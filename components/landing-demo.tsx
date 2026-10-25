"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { ArrowRightIcon, ImageIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  CHARSETS,
  DEFAULT_IMAGE_OPTIONS,
  imageToAscii,
  isLightColor,
  loadImageFile,
} from "@/lib/image-to-ascii"
import {
  COLOR_THEMES,
  DEFAULT_SETTINGS,
  FRAME_TEMPLATES,
  type ColorTheme,
  type GeneratorSettings,
} from "@/lib/ascii-data"
import { renderAsciiToCanvas } from "@/lib/render-ascii"
import { banner } from "@/lib/banner"
import { useIsMobile } from "@/hooks/use-mobile"
import { PresetSwatches, SelectRow, SwitchRow } from "@/components/controls"

// Printed lines are 1.2em tall and JetBrains Mono advances 0.6em,
// so one character cell is half as wide as it is tall.
const LINE = 1.2
const CHAR_ASPECT = 0.6 / LINE

const noop = () => () => {}
const useMounted = () => useSyncExternalStore(noop, () => true, () => false)

const STARS = [
  [58, 52, 4], [540, 70, 5], [596, 368, 4], [96, 388, 5],
  [470, 26, 3], [24, 236, 4], [612, 196, 3], [300, 410, 3],
] as const

/** A lit, ringed planet drawn on a canvas: the sample every visitor sees first. */
function drawPlanet(): HTMLCanvasElement {
  const c = document.createElement("canvas")
  c.width = 640
  c.height = 440
  const ctx = c.getContext("2d")!
  const cx = 320
  const cy = 220
  const r = 128

  ctx.fillStyle = "#6b6b6b"
  for (const [x, y, s] of STARS) ctx.fillRect(x, y, s, s)

  const ring = (front: boolean) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(-0.36)
    ctx.scale(1, 0.3)
    const [a0, a1] = front ? [0, Math.PI] : [Math.PI, Math.PI * 2]
    for (const [radius, width, shade] of [
      [r * 1.9, 26, "#8c8c8c"],
      [r * 1.55, 12, "#4a4a4a"],
    ] as const) {
      ctx.beginPath()
      ctx.arc(0, 0, radius, a0, a1)
      ctx.lineWidth = width
      ctx.strokeStyle = shade
      ctx.stroke()
    }
    ctx.restore()
  }

  ring(false)
  const body = ctx.createRadialGradient(
    cx - r * 0.42, cy - r * 0.46, r * 0.08,
    cx, cy, r
  )
  // Never reaches black or white, so the limb survives on light and dark paper
  body.addColorStop(0, "#ffffff")
  body.addColorStop(0.35, "#d2d2d2")
  body.addColorStop(0.75, "#5c5c5c")
  body.addColorStop(1, "#2a2a2a")
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = body
  ctx.fill()
  // Cloud bands
  ctx.save()
  ctx.clip()
  ctx.translate(cx, cy)
  ctx.rotate(-0.36)
  ctx.fillStyle = "rgba(0,0,0,0.16)"
  for (const y of [-70, -26, 18, 58]) ctx.fillRect(-r, y, r * 2, 14)
  ctx.restore()
  ring(true)
  return c
}

function encodeShare(text: string, settings: Partial<GeneratorSettings>) {
  return btoa(encodeURIComponent(JSON.stringify({ text, settings })))
}

// ─── Hero: the live printer ───

const HERO_CHARSETS = CHARSETS.filter((c) => c.value !== "custom")

export function HeroPrinter() {
  const mounted = useMounted()
  const { resolvedTheme } = useTheme()
  const dark = mounted && resolvedTheme === "dark"
  const fileRef = useRef<HTMLInputElement>(null)

  const sample = useMemo(
    () => (mounted ? { canvas: drawPlanet(), name: "planet.png (sample)", id: 0 } : null),
    [mounted]
  )
  const [upload, setUpload] = useState<{
    canvas: HTMLCanvasElement
    name: string
    id: number
  } | null>(null)
  const source = upload ?? sample

  // Phones print narrower so the sample stays legible; a slider move wins after that
  const isMobile = useIsMobile()
  const [pickedColumns, setColumns] = useState<number | null>(null)
  const columns = pickedColumns ?? (isMobile ? 48 : 76)
  const [charset, setCharset] = useState("standard")
  const [invert, setInvert] = useState(false)
  const [dragging, setDragging] = useState(false)

  const result = useMemo(
    () =>
      source
        ? imageToAscii(
            source.canvas,
            { ...DEFAULT_IMAGE_OPTIONS, columns, charset, invert },
            CHAR_ASPECT,
            !dark
          )
        : null,
    [source, columns, charset, invert, dark]
  )
  const rows = result ? result.text.split("\n").length : 0

  const accept = useCallback(async (file?: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("That isn't an image. Try a JPG, PNG, WebP or GIF.")
      return
    }
    try {
      const { canvas } = await loadImageFile(file)
      setUpload({ canvas, name: file.name || "pasted image", id: Date.now() })
    } catch {
      toast.error("Couldn't read that image. Try another file.")
    }
  }, [])

  // Old share links pointed at "/": hand them to the studio. Section anchors
  // like #output name an element on this page and stay here.
  useEffect(() => {
    const hash = window.location.hash
    if (hash.length > 1 && !document.getElementById(hash.slice(1))) {
      window.location.replace("/studio" + hash)
    }
  }, [])

  // Paste or drop an image anywhere on the page
  useEffect(() => {
    const hasFiles = (e: DragEvent) => !!e.dataTransfer?.types.includes("Files")
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) =>
        f.type.startsWith("image/")
      )
      if (!file) return
      e.preventDefault()
      accept(file)
    }
    const onEnter = (e: DragEvent) => hasFiles(e) && setDragging(true)
    const onOver = (e: DragEvent) => hasFiles(e) && e.preventDefault()
    const onLeave = (e: DragEvent) => !e.relatedTarget && setDragging(false)
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      setDragging(false)
      accept(e.dataTransfer?.files[0])
    }
    window.addEventListener("paste", onPaste)
    window.addEventListener("dragenter", onEnter)
    window.addEventListener("dragover", onOver)
    window.addEventListener("dragleave", onLeave)
    window.addEventListener("drop", onDrop)
    return () => {
      window.removeEventListener("paste", onPaste)
      window.removeEventListener("dragenter", onEnter)
      window.removeEventListener("dragover", onOver)
      window.removeEventListener("dragleave", onLeave)
      window.removeEventListener("drop", onDrop)
    }
  }, [accept])

  const openInStudio = () => {
    if (!result) return window.location.assign("/studio")
    const hash = encodeShare(result?.text ?? "", {
      fontSize: 12,
      lineHeight: LINE,
      foregroundColor: dark ? "#e3e9e0" : "#1f2620",
      backgroundColor: dark ? "#141a16" : "#f6f9f4",
    })
    window.location.assign("/studio#" + hash)
  }

  const pick = () => fileRef.current?.click()

  return (
    <section className="px-5 pt-10 pb-16 sm:px-8 lg:px-12 lg:pt-8 lg:pb-24">
      {/* The job's banner page, set in its own letters */}
      <div className="@container hidden sm:block">
        <pre
          aria-hidden="true"
          className="font-mono leading-[1.05] font-bold text-foreground select-none"
          style={{ fontSize: "min(calc(100cqi / 28.6), 22px)" }}
        >
          {BANNER}
        </pre>
      </div>
      <div className="grid items-center gap-12 sm:mt-10 lg:mt-8 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <h1 className="font-display text-[clamp(2.5rem,4.6vw,4.1rem)] leading-[0.98]">
            Print any photo as ASCII art.
          </h1>
          <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-muted-foreground">
            Drop an image and watch it print, line by line. Fine-tune it in the
            studio, then export a PNG, an SVG or a link. Everything happens in
            your browser.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button size="lg" onClick={openInStudio}>
              Open in studio
              <ArrowRightIcon className="size-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={pick}>
              <ImageIcon className="size-4" />
              Choose a photo
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Or drop or paste an image anywhere on this page.
          </p>
        </div>

        <figure className="@container lg:col-span-7">
          <figcaption className="mb-2.5 flex items-baseline justify-between gap-4 font-mono text-xs text-form tabular">
            <span className="truncate">{source?.name ?? "loading paper"}</span>
            <span className="shrink-0">
              {columns} × {rows || "–"} ·{" "}
              {HERO_CHARSETS.find((c) => c.value === charset)?.label}
            </span>
          </figcaption>

          <div
            role="button"
            tabIndex={0}
            aria-label="Choose a photo to print. You can also drop or paste one."
            onClick={pick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                pick()
              }
            }}
            className={cn(
              "relative grid cursor-pointer grid-cols-[22px_1fr_22px] bg-background ring-1 ring-border transition-shadow [--tractors:44px] sm:grid-cols-[28px_1fr_28px] sm:[--tractors:56px]",
              "shadow-[0_1px_0_var(--border),0_24px_48px_-28px_var(--shadow)]",
              dragging && "ring-2 ring-primary"
            )}
          >
            <div aria-hidden="true" className="tractor border-r border-dashed border-input" />
            <div
              className="greenbar min-w-0 overflow-hidden [--line:1.2em] [background-origin:content-box]"
              style={{
                // text + 3em line-number gutter + 1.2em side margins
                fontSize: `calc((100cqi - var(--tractors)) / ${columns * 0.6 + 5.4})`,
                padding: "2.4em 1.2em 2.4em 0",
              }}
            >
              <div
                key={`${source?.id}-${charset}-${invert}-${dark}`}
                className="print-in flex font-mono leading-[1.2]"
                style={
                  {
                    minHeight: result ? undefined : `${LINE * 30}em`,
                    "--print-rows": Math.max(rows, 1),
                    "--print-duration": `${Math.min(1.8, rows * 0.045)}s`,
                  } as React.CSSProperties
                }
              >
                <pre
                  aria-hidden="true"
                  className="m-0 mr-[0.6em] w-[2.4em] shrink-0 text-right text-form/75 tabular select-none"
                >
                  {Array.from({ length: rows }, (_, i) => i + 1).join("\n")}
                </pre>
                <pre className="m-0 text-foreground">{result?.text}</pre>
              </div>
            </div>
            <div aria-hidden="true" className="tractor border-l border-dashed border-input" />

            {dragging && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center bg-background/85">
                <p className="font-display text-2xl">Release to print</p>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <div className="mb-3 flex items-baseline justify-between">
                <span id="hero-columns" className="text-sm font-medium">
                  Columns
                </span>
                <output className="font-mono text-sm text-form tabular">
                  {columns}
                </output>
              </div>
              <Slider
                aria-labelledby="hero-columns"
                value={[columns]}
                onValueChange={(v) =>
                  setColumns(typeof v === "number" ? v : v[0])
                }
                min={32}
                max={140}
                step={1}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="hero-invert"
                aria-labelledby="hero-invert-label"
                checked={invert}
                onCheckedChange={setInvert}
              />
              <Label id="hero-invert-label" htmlFor="hero-invert" className="text-sm">
                Invert
              </Label>
            </div>
            <fieldset className="sm:col-span-2">
              <legend className="mb-2.5 text-sm font-medium">Characters</legend>
              <div className="flex flex-wrap gap-1.5">
                {HERO_CHARSETS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    aria-pressed={charset === c.value}
                    onClick={() => setCharset(c.value)}
                    className={cn(
                      "h-8 rounded-sm border px-3 text-sm transition-colors",
                      charset === c.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background hover:border-primary hover:text-foreground"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              accept(e.target.files?.[0])
              e.target.value = ""
            }}
          />
        </figure>
      </div>
    </section>
  )
}

const BANNER = banner("FANFOLD")

/** Sun over layered ridges: a second sample, so the report shows something new. */
function drawLandscape(): HTMLCanvasElement {
  const c = document.createElement("canvas")
  c.width = 640
  c.height = 300
  const ctx = c.getContext("2d")!
  const sky = ctx.createLinearGradient(0, 0, 0, 300)
  // A darker sky so the white sun reads on light and dark paper alike
  sky.addColorStop(0, "#5e5e5e")
  sky.addColorStop(1, "#d6d6d6")
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, 640, 300)
  ctx.fillStyle = "#ffffff"
  ctx.beginPath()
  ctx.arc(430, 120, 52, 0, Math.PI * 2)
  ctx.fill()
  const ridge = (shade: string, base: number, peaks: [number, number][]) => {
    ctx.fillStyle = shade
    ctx.beginPath()
    ctx.moveTo(0, 300)
    ctx.lineTo(0, base)
    for (const [x, y] of peaks) ctx.lineTo(x, y)
    ctx.lineTo(640, base)
    ctx.lineTo(640, 300)
    ctx.fill()
  }
  ridge("#8a8a8a", 190, [[90, 140], [190, 175], [300, 110], [420, 170], [540, 125]])
  ridge("#4d4d4d", 230, [[70, 205], [170, 180], [280, 220], [380, 185], [510, 215], [600, 195]])
  ridge("#1c1c1c", 270, [[120, 250], [260, 262], [400, 240], [560, 258]])
  return c
}

// ─── A second photo printed in block characters, for the "ways in" report ───

export function PhotoPrint({ columns = 72 }: { columns?: number }) {
  const mounted = useMounted()
  const { resolvedTheme } = useTheme()
  const dark = mounted && resolvedTheme === "dark"
  const text = useMemo(
    () =>
      mounted
        ? imageToAscii(
            drawLandscape(),
            { ...DEFAULT_IMAGE_OPTIONS, columns, charset: "blocks" },
            CHAR_ASPECT,
            !dark
          ).text
        : "",
    [mounted, dark, columns]
  )
  // Size the type so every column fits the report column, capped at 12px
  return (
    <div className="@container">
      <pre
        aria-label="A landscape photo printed in block characters"
        className="m-0 font-mono leading-[1.2]"
        style={{
          fontSize: `min(calc(100cqi / ${columns * 0.6}), 12px)`,
          minHeight: `${LINE * 15}em`,
        }}
      >
        {text}
      </pre>
    </div>
  )
}

// ─── Prints that run when they scroll into view ───

export function PrintOnView({
  rows,
  className,
  children,
}: {
  rows: number
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // Observe the unclipped outer box: Chrome counts the target's own clip-path,
    // so a fully clipped element would never report as visible
    const outer = ref.current
    const el = outer?.firstElementChild as HTMLElement | null
    if (!outer || !el || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return
    // Only arm prints still below the fold; anything already on screen stays printed
    if (outer.getBoundingClientRect().top < window.innerHeight) return
    el.style.clipPath = "inset(0 0 100% 0)"
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        el.style.clipPath = ""
        el.classList.add("print-in")
      },
      { threshold: 0.25 }
    )
    io.observe(outer)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={className}>
      <div
        style={
          {
            "--print-rows": rows,
            "--print-duration": `${Math.min(1.6, rows * 0.06)}s`,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </div>
  )
}

// ─── Try a finish: the export engine running live with studio controls ───

const EFFECTS = [
  ["glowEnabled", "Glow"],
  ["scanLinesEnabled", "Scan lines"],
  ["crtEnabled", "CRT curve"],
  ["noiseEnabled", "Noise"],
] as const

export function FinishPicker() {
  const mounted = useMounted()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Opens on the world's own paper; the louder presets are a click away
  const [settings, setSettings] = useState<GeneratorSettings>(() => ({
    ...DEFAULT_SETTINGS,
    fontSize: 10,
    lineHeight: LINE,
    padding: 24,
    foregroundColor: COLOR_THEMES[0].foreground,
    backgroundColor: COLOR_THEMES[0].background,
    scanLinesEnabled: true,
  }))
  const lightPaper = isLightColor(settings.backgroundColor)
  const text = useMemo(
    () =>
      mounted
        ? imageToAscii(
            drawPlanet(),
            { ...DEFAULT_IMAGE_OPTIONS, columns: 64 },
            CHAR_ASPECT,
            lightPaper
          ).text
        : "",
    [mounted, lightPaper]
  )

  useEffect(() => {
    if (!text) return
    let cancelled = false
    // Wait for the web font so the canvas measures the real glyphs
    document.fonts.ready.then(() => {
      if (!cancelled && canvasRef.current)
        renderAsciiToCanvas(canvasRef.current, text, settings)
    })
    return () => {
      cancelled = true
    }
  }, [text, settings])

  const update = <K extends keyof GeneratorSettings>(
    key: K,
    value: GeneratorSettings[K]
  ) => setSettings((prev) => ({ ...prev, [key]: value }))

  const isActive = (t: ColorTheme) =>
    settings.foregroundColor === t.foreground &&
    settings.backgroundColor === t.background
  const pick = (t: ColorTheme) =>
    setSettings((prev) => ({
      ...prev,
      foregroundColor: t.foreground,
      backgroundColor: t.background,
      useGradient: !!t.gradient,
      gradientColor1: t.gradient?.[0] ?? prev.gradientColor1,
      gradientColor2: t.gradient?.[1] ?? prev.gradientColor2,
    }))

  const readout = [
    COLOR_THEMES.find(isActive)?.name ?? "Custom",
    settings.useGradient && "gradient ink",
    ...EFFECTS.filter(([key]) => settings[key]).map(([, label]) =>
      label.toLowerCase()
    ),
    settings.frameTemplate !== "none" &&
      `${FRAME_TEMPLATES.find((f) => f.value === settings.frameTemplate)?.label.toLowerCase()} frame`,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <figure className="lg:col-span-8">
        <div className="grid min-h-72 place-items-center bg-housing p-4 ring-1 ring-border sm:p-8">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Live preview: ${readout}`}
            className="block h-auto! max-h-[32rem] w-auto! max-w-full drop-shadow-[0_18px_28px_var(--shadow)]"
          />
        </div>
        <figcaption className="mt-3 font-mono text-xs text-form" aria-live="polite">
          {readout}
        </figcaption>
      </figure>

      <div className="space-y-6 lg:col-span-4">
        <div>
          <p className="mb-2 text-xs text-muted-foreground">Colors</p>
          <PresetSwatches isActive={isActive} onPick={pick} />
        </div>
        <div className="space-y-3.5">
          {EFFECTS.map(([key, label]) => (
            <SwitchRow
              key={key}
              label={label}
              checked={settings[key]}
              onChange={(v) => update(key, v)}
            />
          ))}
        </div>
        <SelectRow
          label="Frame"
          value={settings.frameTemplate}
          options={FRAME_TEMPLATES}
          onChange={(v) => update("frameTemplate", v)}
        />
      </div>
    </div>
  )
}
