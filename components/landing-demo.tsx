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
import {
  DEFAULT_IMAGE_OPTIONS,
  imageToAscii,
  isLightColor,
  loadImageFile,
} from "@/lib/image-to-ascii"
import {
  COLOR_THEMES,
  DEFAULT_SETTINGS,
  type ColorTheme,
  type GeneratorSettings,
} from "@/lib/ascii-data"
import { renderAsciiToCanvas } from "@/lib/render-ascii"
import { useIsMobile } from "@/hooks/use-mobile"
import { PresetSwatches } from "@/components/controls"

// Printed lines are 1.2em tall and JetBrains Mono advances 0.6em,
// so one character cell is half as wide as it is tall.
const LINE = 1.2
const CHAR_ASPECT = 0.6 / LINE

const noop = () => () => {}
const useMounted = () => useSyncExternalStore(noop, () => true, () => false)

const STARS = [
  [58, 52, 4], [540, 70, 5], [596, 318, 4], [96, 300, 5],
  [470, 26, 3], [24, 236, 4], [612, 196, 3], [300, 326, 3],
] as const

/** A lit, ringed planet drawn on a canvas: the sample every visitor sees first. */
function drawPlanet(): HTMLCanvasElement {
  const c = document.createElement("canvas")
  c.width = 640
  // Cropped close to the planet so prints carry few blank rows
  c.height = 340
  const ctx = c.getContext("2d")!
  const cx = 320
  const cy = 170
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

// ─── Hero: headline, two actions and the live printer ───

export function HeroPrinter() {
  const mounted = useMounted()
  const { resolvedTheme } = useTheme()
  const dark = mounted && resolvedTheme === "dark"
  const fileRef = useRef<HTMLInputElement>(null)

  const sample = useMemo(
    () => (mounted ? { canvas: drawPlanet(), name: "planet.png · sample", id: 0 } : null),
    [mounted]
  )
  const [upload, setUpload] = useState<{
    canvas: HTMLCanvasElement
    name: string
    id: number
  } | null>(null)
  const source = upload ?? sample

  // Phones print narrower so the sample stays legible
  const isMobile = useIsMobile()
  const columns = isMobile ? 48 : 76
  const [dragging, setDragging] = useState(false)

  const result = useMemo(
    () =>
      source
        ? imageToAscii(
            source.canvas,
            { ...DEFAULT_IMAGE_OPTIONS, columns },
            CHAR_ASPECT,
            !dark
          )
        : null,
    [source, columns, dark]
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
  // like #export name an element on this page and stay here.
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
    const hash = encodeShare(result.text, {
      fontSize: 12,
      lineHeight: LINE,
      foregroundColor: dark ? "#e3e9e0" : "#1f2620",
      backgroundColor: dark ? "#141a16" : "#f6f9f4",
    })
    window.location.assign("/studio#" + hash)
  }

  const pick = () => fileRef.current?.click()

  return (
    <section className="pt-16 pb-20 sm:pt-24 lg:pt-28 lg:pb-28">
      <h1 className="max-w-[13ch] font-display text-[clamp(2.75rem,7vw,5.75rem)] leading-[0.94]">
        Print any photo as ASCII art.
      </h1>
      <p className="mt-8 max-w-[46ch] text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mt-10">
        Drop an image and watch it print, line by line. Then style it and
        export it in the studio.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button size="lg" onClick={pick}>
          <ImageIcon className="size-4" />
          Choose a photo
        </Button>
        <Button size="lg" variant="outline" onClick={openInStudio}>
          Open in studio
          <ArrowRightIcon className="size-4" />
        </Button>
      </div>

      <figure
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
          "@container relative mt-12 cursor-pointer bg-card ring-1 ring-border transition-shadow [--pad:24px] hover:ring-primary/40 sm:[--pad:48px] lg:mt-16",
          "shadow-[0_1px_0_var(--border),0_32px_64px_-40px_var(--shadow)]",
          dragging && "ring-2 ring-primary"
        )}
      >
        <div className="grid place-items-center px-(--pad) py-[calc(var(--pad)*1.25)]">
          <pre
            key={`${source?.id}-${dark}`}
            className="print-in m-0 font-mono leading-[1.2] text-foreground"
            style={
              {
                fontSize: `min(16px, calc((100cqi - 2 * var(--pad)) / ${columns * 0.6}))`,
                minHeight: `${LINE * (isMobile ? 13 : 20)}em`,
                "--print-rows": Math.max(rows, 1),
                "--print-duration": `${Math.min(1.8, rows * 0.06)}s`,
              } as React.CSSProperties
            }
          >
            {result?.text}
          </pre>
        </div>
        <figcaption className="flex items-center justify-between gap-4 border-t border-border/70 px-(--pad) py-3.5 text-sm text-muted-foreground">
          <span className="truncate font-mono text-xs text-form">
            {source?.name ?? "Loading sample"}
          </span>
          <span className="shrink-0">
            <span className="pointer-coarse:hidden">
              Drop, paste or click to print your own
            </span>
            <span className="hidden pointer-coarse:inline">
              Tap to print your own
            </span>
          </span>
        </figcaption>

        {dragging && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-background/85">
            <p className="font-display text-2xl">Release to print</p>
          </div>
        )}
      </figure>

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
    </section>
  )
}

// ─── Try a finish: the export engine running live on one canvas ───

export function FinishPicker({ children }: { children: React.ReactNode }) {
  const mounted = useMounted()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Opens on a preset that differs from the hero's paper, so the section
  // shows a finish rather than repeating the demo; Fanfold is one swatch away
  const [settings, setSettings] = useState<GeneratorSettings>(() => {
    const classic = COLOR_THEMES.find((t) => t.name === "Classic")!
    return {
      ...DEFAULT_SETTINGS,
      fontSize: 10,
      lineHeight: LINE,
      padding: 28,
      foregroundColor: classic.foreground,
      backgroundColor: classic.background,
    }
  })
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
  const active = COLOR_THEMES.find(isActive)?.name ?? "Custom"

  return (
    // Phones read heading → canvas → swatches; wide screens put the canvas
    // beside the heading and swatches
    <div className="grid gap-10 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-10">
      <div className="lg:col-span-4 lg:self-end">{children}</div>
      <div className="lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1">
        <div className="grid h-full min-h-72 place-items-center bg-housing p-6 ring-1 ring-border sm:p-12">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Live preview in the ${active} preset`}
            className="block h-auto! max-h-[30rem] w-auto! max-w-full drop-shadow-[0_18px_28px_var(--shadow)]"
          />
        </div>
      </div>
      <div className="lg:col-span-4 lg:row-start-2">
        <PresetSwatches isActive={isActive} onPick={pick} className="grid-cols-4 sm:grid-cols-6 lg:grid-cols-4" />
      </div>
    </div>
  )
}
