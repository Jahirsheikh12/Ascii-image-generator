"use client"

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useSyncExternalStore,
} from "react"
import { toast } from "sonner"
import {
  CopyIcon,
  TrashIcon,
  UploadSimpleIcon,
  DownloadSimpleIcon,
  ArrowCounterClockwiseIcon,
  ArrowClockwiseIcon,
  ShareNetworkIcon,
  CommandIcon,
  PaletteIcon,
  TextTIcon,
  SlidersHorizontalIcon,
  SparkleIcon,
  FrameCornersIcon,
  ImageIcon,
  ClipboardIcon,
  XIcon,
  PencilSimpleIcon,
  ImageSquareIcon,
  ArrowsOutSimpleIcon,
  ArrowsInSimpleIcon,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Wordmark } from "@/components/wordmark"
import { ThemeToggle } from "@/components/theme-toggle"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command"

import {
  type GeneratorSettings,
  type ColorTheme,
  DEFAULT_SETTINGS,
  COLOR_THEMES,
  ASCII_TEMPLATES,
  FONT_OPTIONS,
  BORDER_STYLES,
  FRAME_TEMPLATES,
  PIXEL_DENSITY_OPTIONS,
  EXPORT_FORMATS,
} from "@/lib/ascii-data"
import { renderAsciiToCanvas, generateSVG } from "@/lib/render-ascii"
import {
  type ImageAsciiOptions,
  CHARSETS,
  DEFAULT_IMAGE_OPTIONS,
  MAX_COLUMNS,
  imageToAscii,
  isLightColor,
  loadImageFile,
} from "@/lib/image-to-ascii"

// ─── Helpers ───

function sliderVal(v: number | readonly number[]): number {
  return typeof v === "number" ? v : v[0]
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Safari can cancel the download if the URL is revoked synchronously
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

// Editor line metrics: bars span three lines, like the paper
const EDITOR_LINE = 20

// ─── Main Component ───

export default function AsciiGenerator() {
  // --- State ---
  const [text, setText] = useState(ASCII_TEMPLATES[0].art)
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])
  // New sessions start on Fanfold paper; shared links still merge over DEFAULT_SETTINGS keys
  const [settings, setSettings] = useState<GeneratorSettings>(() => ({
    ...DEFAULT_SETTINGS,
    foregroundColor: COLOR_THEMES[0].foreground,
    backgroundColor: COLOR_THEMES[0].background,
  }))
  const [commandOpen, setCommandOpen] = useState(false)
  const [previewDims, setPreviewDims] = useState({
    width: 0,
    height: 0,
    scale: 1,
  })
  // While an image is attached, the ASCII text is derived from it
  const [imageSource, setImageSource] = useState<{
    canvas: HTMLCanvasElement
    thumb: string
    name: string
  } | null>(null)
  const [imageOpts, setImageOpts] =
    useState<ImageAsciiOptions>(DEFAULT_IMAGE_OPTIONS)
  const [dragging, setDragging] = useState(false)
  const [mobileView, setMobileView] = useState<
    "editor" | "preview" | "settings"
  >("editor")

  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const renderTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // --- Hooks ---
  const isMobile = useIsMobile()
  // false during SSR/hydration, true on the client — avoids theme flash
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const [fit, setFit] = useState(true)
  const stageRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState({ w: 0, h: 0 })
  const gutterRef = useRef<HTMLDivElement>(null)
  const mod =
    mounted && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? "⌘" : "Ctrl"

  // --- Settings updater ---
  const updateSetting = useCallback(
    <K extends keyof GeneratorSettings>(
      key: K,
      value: GeneratorSettings[K]
    ) => {
      setSettings((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const updateImageOpt = useCallback(
    <K extends keyof ImageAsciiOptions>(key: K, value: ImageAsciiOptions[K]) => {
      setImageOpts((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  // --- Image → ASCII ---
  const lightBg = isLightColor(settings.backgroundColor)
  const charAspect =
    (settings.fontSize * 0.6 + settings.letterSpacing) /
    (settings.fontSize * settings.lineHeight)
  const imageResult = useMemo(
    () =>
      imageSource
        ? imageToAscii(imageSource.canvas, imageOpts, charAspect, lightBg)
        : null,
    [imageSource, imageOpts, charAspect, lightBg]
  )
  const asciiText = imageResult?.text ?? text
  const charColors = imageResult?.colors ?? null

  // --- Text change with undo (editing detaches the image) ---
  const handleTextChange = useCallback(
    (newText: string) => {
      setUndoStack((prev) => [...prev.slice(-50), asciiText])
      setRedoStack([])
      setText(newText)
      setImageSource(null)
    },
    [asciiText]
  )

  const undo = useCallback(() => {
    if (undoStack.length === 0) return
    setRedoStack((r) => [...r, asciiText])
    setText(undoStack[undoStack.length - 1])
    setUndoStack((s) => s.slice(0, -1))
    setImageSource(null)
  }, [undoStack, asciiText])

  const redo = useCallback(() => {
    if (redoStack.length === 0) return
    setUndoStack((s) => [...s, asciiText])
    setText(redoStack[redoStack.length - 1])
    setRedoStack((r) => r.slice(0, -1))
    setImageSource(null)
  }, [redoStack, asciiText])

  const detachImage = useCallback(() => {
    setText(asciiText)
    setImageSource(null)
  }, [asciiText])

  // --- Canvas rendering (debounced) ---
  useEffect(() => {
    if (renderTimeout.current) clearTimeout(renderTimeout.current)
    renderTimeout.current = setTimeout(() => {
      if (canvasRef.current) {
        const dims = renderAsciiToCanvas(
          canvasRef.current,
          asciiText,
          settings,
          charColors
        )
        setPreviewDims(dims)
      }
    }, 60)
    return () => {
      if (renderTimeout.current) clearTimeout(renderTimeout.current)
    }
    // mounted/isMobile swap the layout, which mounts a fresh canvas
  }, [asciiText, charColors, settings, mounted, isMobile])

  // --- Stage size, for fitting the preview (it remounts with the layout) ---
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) =>
      setStage({ w: entry.contentRect.width, h: entry.contentRect.height })
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [mounted, isMobile])

  // --- Export ---
  const handleExport = useCallback(() => {
    if (!canvasRef.current) return
    const fmt = settings.exportFormat
    if (fmt === "svg") {
      const svg = generateSVG(asciiText, settings, charColors)
      downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "ascii-art.svg")
    } else {
      const mimeMap: Record<string, string> = {
        png: "image/png",
        jpeg: "image/jpeg",
        webp: "image/webp",
      }
      const extMap: Record<string, string> = {
        png: "png",
        jpeg: "jpg",
        webp: "webp",
      }
      const quality = fmt === "jpeg" ? settings.jpegQuality / 100 : undefined
      canvasRef.current.toBlob(
        (blob) => {
          if (!blob) return toast.error("Export failed")
          downloadBlob(blob, `ascii-art.${extMap[fmt]}`)
          toast.success("Image exported!")
        },
        mimeMap[fmt],
        quality
      )
      return
    }
    toast.success("Image exported!")
  }, [asciiText, charColors, settings])

  // --- Copy image ---
  const copyImage = useCallback(async () => {
    if (!canvasRef.current) return
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvasRef.current!.toBlob(resolve, "image/png")
      )
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ])
        toast.success("Image copied to clipboard!")
      }
    } catch {
      toast.error("Failed to copy image")
    }
  }, [])

  const copyText = useCallback(() => {
    navigator.clipboard.writeText(asciiText).then(
      () => toast.success("ASCII art copied!"),
      () => toast.error("Failed to copy text")
    )
  }, [asciiText])

  // --- Import file (image → converted, text → loaded as-is) ---
  const importFile = useCallback(
    async (file: File) => {
      if (file.type.startsWith("image/")) {
        try {
          const { canvas, thumb } = await loadImageFile(file)
          setUndoStack((prev) => [...prev.slice(-50), asciiText])
          setRedoStack([])
          setImageSource({ canvas, thumb, name: file.name || "Pasted image" })
          toast.success("Image converted to ASCII!")
        } catch {
          toast.error("Couldn't read that image")
        }
      } else if (
        !file.type ||
        file.type.startsWith("text/") ||
        /\.(txt|asc)$/i.test(file.name)
      ) {
        handleTextChange(await file.text())
        toast.success("File imported!")
      } else {
        toast.error("Unsupported file. Use an image or a .txt file")
      }
    },
    [asciiText, handleTextChange]
  )

  // --- Paste an image anywhere ---
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) =>
        f.type.startsWith("image/")
      )
      if (!file) return
      e.preventDefault()
      importFile(file)
    }
    window.addEventListener("paste", handler)
    return () => window.removeEventListener("paste", handler)
  }, [importFile])

  // --- Theme application ---
  const applyTheme = useCallback((t: ColorTheme) => {
    setSettings((prev) => ({
      ...prev,
      foregroundColor: t.foreground,
      backgroundColor: t.background,
      useGradient: !!t.gradient,
      gradientColor1: t.gradient?.[0] || prev.gradientColor1,
      gradientColor2: t.gradient?.[1] || prev.gradientColor2,
    }))
    toast.success(`${t.name} theme applied`)
  }, [])

  // --- Share ---
  const shareSettings = useCallback(() => {
    try {
      const encoded = btoa(
        encodeURIComponent(JSON.stringify({ text: asciiText, settings }))
      )
      const url = `${window.location.origin}${window.location.pathname}#${encoded}`
      navigator.clipboard.writeText(url).then(
        () => toast.success("Share link copied!"),
        () => toast.error("Failed to copy share link")
      )
    } catch {
      toast.error("Failed to generate share link")
    }
  }, [asciiText, settings])

  // --- Load from URL hash ---
  useEffect(() => {
    try {
      const hash = window.location.hash.slice(1)
      if (hash) {
        const data = JSON.parse(decodeURIComponent(atob(hash)))
        // Syncing from the URL (external system) on mount is the intended use
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (typeof data.text === "string") setText(data.text)
        if (data.settings && typeof data.settings === "object") {
          // Shared links are untrusted: keep only known keys of the right type
          const safe = Object.fromEntries(
            Object.entries(data.settings).filter(
              ([k, v]) =>
                k in DEFAULT_SETTINGS &&
                typeof v === typeof DEFAULT_SETTINGS[k as keyof GeneratorSettings]
            )
          )
          setSettings((prev) => ({ ...prev, ...safe }))
        }
        window.location.hash = ""
        // Defer: this effect runs before the <Toaster> sibling subscribes
        setTimeout(() => toast.success("Loaded from shared link!"))
      }
    } catch {
      // ignore
    }
  }, [])

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandOpen((o) => !o)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleExport()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [undo, redo, handleExport])

  // --- Computed ---
  const lines = useMemo(() => asciiText.split("\n"), [asciiText])
  const rows = lines.length
  const cols = Math.max(...lines.map((l) => l.length), 0)
  const charCount = asciiText.length

  // ─── Render sections ───

  const imagePanel = imageSource ? (
    <section
      aria-label="Photo conversion"
      className="max-h-[52%] shrink-0 overflow-y-auto border-b border-border p-4"
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className="size-11 shrink-0 bg-housing bg-contain bg-center bg-no-repeat ring-1 ring-border"
          style={{ backgroundImage: `url(${imageSource.thumb})` }}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{imageSource.name}</p>
          <p className="font-mono text-[11px] text-form tabular">
            {imageSource.canvas.width} × {imageSource.canvas.height} px → {cols} ×{" "}
            {rows} chars
          </p>
        </div>
        <TooltipButton
          label="Replace photo"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadSimpleIcon className="size-4" />
        </TooltipButton>
        <TooltipButton label="Detach photo, keep the text" onClick={detachImage}>
          <XIcon className="size-4" />
        </TooltipButton>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        <SliderRow
          label="Columns"
          display={imageOpts.columns}
          value={imageOpts.columns}
          onChange={(v) => updateImageOpt("columns", v)}
          min={20}
          max={MAX_COLUMNS}
        />
        <SelectRow
          label="Characters"
          value={imageOpts.charset}
          options={CHARSETS}
          onChange={(v) => updateImageOpt("charset", v)}
        />
        {imageOpts.charset === "custom" && (
          <div className="col-span-2 space-y-2">
            <Label htmlFor="custom-ramp" className="text-xs text-muted-foreground">
              Custom ramp, light to dense
            </Label>
            <input
              id="custom-ramp"
              type="text"
              value={imageOpts.customChars}
              onChange={(e) => updateImageOpt("customChars", e.target.value)}
              spellCheck={false}
              className="h-8 w-full rounded-sm border border-input bg-background px-2.5 font-mono text-xs outline-none focus-visible:border-ring"
            />
          </div>
        )}
        <SliderRow
          label="Brightness"
          display={imageOpts.brightness}
          value={imageOpts.brightness}
          onChange={(v) => updateImageOpt("brightness", v)}
          min={-100}
          max={100}
        />
        <SliderRow
          label="Contrast"
          display={imageOpts.contrast}
          value={imageOpts.contrast}
          onChange={(v) => updateImageOpt("contrast", v)}
          min={-100}
          max={100}
        />
        <SwitchRow
          label="Color"
          checked={imageOpts.color}
          onChange={(v) => updateImageOpt("color", v)}
        />
        <SwitchRow
          label="Dither"
          checked={imageOpts.dither}
          onChange={(v) => updateImageOpt("dither", v)}
        />
        <SwitchRow
          label="Invert"
          checked={imageOpts.invert}
          onChange={(v) => updateImageOpt("invert", v)}
        />
        <button
          type="button"
          onClick={() => setImageOpts(DEFAULT_IMAGE_OPTIONS)}
          className="justify-self-end rounded-sm px-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Reset photo settings
        </button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Editing the text below detaches the photo.
      </p>
    </section>
  ) : (
    <div className="shrink-0 border-b border-border p-4">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group flex w-full items-center gap-3.5 rounded-sm border border-dashed border-input bg-background px-3.5 py-3.5 text-left transition-colors hover:border-primary hover:bg-secondary"
      >
        <span className="grid size-10 shrink-0 place-items-center bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <ImageIcon className="size-5" />
        </span>
        <span>
          <span className="block text-sm font-medium">Convert a photo</span>
          <span className="block text-xs text-muted-foreground">
            Drop, paste or choose an image
          </span>
        </span>
      </button>
    </div>
  )

  const editorPanel = (
    <div className="flex h-full flex-col bg-card">
      {imagePanel}

      {/* Templates */}
      <div className="shrink-0 border-b border-border py-3.5">
        <p className="mb-2.5 px-4 text-xs font-medium text-muted-foreground">
          Templates
        </p>
        <div
          className={cn(
            "px-4",
            isMobile
              ? "flex gap-2 overflow-x-auto pb-1 no-scrollbar [mask-image:linear-gradient(to_right,black_82%,transparent)]"
              : "grid grid-cols-4 gap-2"
          )}
        >
          {ASCII_TEMPLATES.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => handleTextChange(t.art)}
              className={cn("group text-left", isMobile && "shrink-0")}
            >
              <span className="grid h-12 w-full min-w-16 place-items-center overflow-hidden bg-background ring-1 ring-border transition-shadow group-hover:ring-primary">
                <pre
                  aria-hidden="true"
                  className="font-mono text-[4px] leading-[1.1] text-foreground"
                >
                  {t.art}
                </pre>
              </span>
              <span className="mt-1 block text-[11px] text-muted-foreground group-hover:text-foreground">
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Text, on green-bar paper with a line-number gutter */}
      <div className="relative flex min-h-0 flex-1 bg-background">
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="w-11 shrink-0 overflow-hidden border-r border-dashed border-input"
        >
          <pre
            className="py-[20px] pr-2.5 text-right font-mono text-[11px] text-form/80 tabular"
            style={{ lineHeight: `${EDITOR_LINE}px` }}
          >
            {lines.map((_, i) => i + 1).join("\n")}
          </pre>
        </div>
        <textarea
          aria-label="ASCII text"
          value={asciiText}
          onChange={(e) => handleTextChange(e.target.value)}
          onScroll={(e) => {
            if (gutterRef.current)
              gutterRef.current.scrollTop = e.currentTarget.scrollTop
          }}
          spellCheck={false}
          className="ascii-textarea greenbar size-full resize-none border-none bg-local px-4 py-[20px] font-mono text-[13px] text-foreground outline-none placeholder:text-muted-foreground [--line:20px] [background-origin:content-box]"
          style={{ lineHeight: `${EDITOR_LINE}px` }}
          placeholder="Type or paste ASCII art here…"
        />
      </div>

      {/* Actions */}
      <div className="flex h-11 shrink-0 items-center gap-0.5 border-t border-border px-2">
        <TooltipButton
          label={`Undo (${mod} Z)`}
          onClick={undo}
          disabled={undoStack.length === 0}
        >
          <ArrowCounterClockwiseIcon className="size-4" />
        </TooltipButton>
        <TooltipButton
          label={`Redo (⇧ ${mod} Z)`}
          onClick={redo}
          disabled={redoStack.length === 0}
        >
          <ArrowClockwiseIcon className="size-4" />
        </TooltipButton>
        <Separator orientation="vertical" className="mx-1.5 h-4" />
        <TooltipButton label="Copy text" onClick={copyText}>
          <CopyIcon className="size-4" />
        </TooltipButton>
        <TooltipButton
          label="Import an image or .txt file"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadSimpleIcon className="size-4" />
        </TooltipButton>
        <TooltipButton
          label="Clear text"
          onClick={() => {
            handleTextChange("")
            toast.success("Cleared")
          }}
        >
          <TrashIcon className="size-4" />
        </TooltipButton>
        <span className="ml-auto pr-2 font-mono text-[11px] text-form tabular">
          {rows} × {cols}
        </span>
      </div>
    </div>
  )

  // Fit scales up to 2× (sharp at the default density) and down as far as needed
  const STAGE_PAD = isMobile ? 48 : 80
  const zoom =
    fit && stage.w > STAGE_PAD && previewDims.width > 0
      ? Math.min(
          2,
          (stage.w - STAGE_PAD) / previewDims.width,
          (stage.h - STAGE_PAD) / previewDims.height
        )
      : 1
  const actualW = Math.ceil(previewDims.width * previewDims.scale)
  const actualH = Math.ceil(previewDims.height * previewDims.scale)

  const previewPanel = (
    <div className="relative flex h-full flex-col bg-housing">
      <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
        <h2 className="text-xs font-medium text-muted-foreground">Preview</h2>
        <div className="flex items-center gap-0.5">
          <TooltipButton
            label={fit ? "Show at actual size" : "Fit to window"}
            onClick={() => setFit((f) => !f)}
          >
            {fit ? (
              <ArrowsOutSimpleIcon className="size-4" />
            ) : (
              <ArrowsInSimpleIcon className="size-4" />
            )}
          </TooltipButton>
          <TooltipButton label="Copy image" onClick={copyImage}>
            <ClipboardIcon className="size-4" />
          </TooltipButton>
        </div>
      </div>
      <div
        ref={stageRef}
        className={cn(
          "relative min-h-0 flex-1 overflow-auto",
          settings.backgroundTransparent &&
            "bg-[repeating-conic-gradient(var(--color-border)_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]"
        )}
      >
        <div
          className={cn(
            "flex p-6 sm:p-10",
            fit ? "size-full items-center justify-center" : "min-h-full min-w-full w-max items-start"
          )}
        >
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Rendered ASCII art preview"
            className="block shrink-0 drop-shadow-[0_18px_28px_var(--shadow)]"
            style={{ zoom }}
          />
        </div>
      </div>
      <div className="pointer-events-none absolute right-3 bottom-3 bg-background/90 px-2 py-1 font-mono text-[11px] text-form tabular ring-1 ring-border">
        {actualW} × {actualH} px
      </div>
    </div>
  )

  const isActiveTheme = (t: ColorTheme) =>
    settings.foregroundColor === t.foreground &&
    settings.backgroundColor === t.background

  const customizerPanel = (
    <div className="flex h-full flex-col overflow-hidden bg-card">
      <Tabs defaultValue="customize" className="flex h-full flex-col gap-0">
        <div className="flex h-11 shrink-0 items-end border-b border-border px-3">
          <TabsList variant="line" className="h-9">
            <TabsTrigger value="customize" className="px-2 text-sm">
              Style
            </TabsTrigger>
            <TabsTrigger value="export" className="px-2 text-sm">
              Export
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="customize" className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <Accordion multiple defaultValue={["font", "colors"]} className="px-4">
              <AccordionItem value="font">
                <SectionTrigger icon={TextTIcon}>Font</SectionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pb-3">
                    <SelectRow
                      label="Family"
                      value={settings.fontFamily}
                      options={FONT_OPTIONS}
                      onChange={(v) => updateSetting("fontFamily", v)}
                      previewFont
                    />
                    <SliderRow
                      label="Size"
                      display={`${settings.fontSize} px`}
                      value={settings.fontSize}
                      onChange={(v) => updateSetting("fontSize", v)}
                      min={8}
                      max={72}
                    />
                    <SliderRow
                      label="Line height"
                      display={settings.lineHeight.toFixed(1)}
                      value={settings.lineHeight}
                      onChange={(v) => updateSetting("lineHeight", v)}
                      min={0.8}
                      max={3}
                      step={0.1}
                    />
                    <SliderRow
                      label="Letter spacing"
                      display={`${settings.letterSpacing} px`}
                      value={settings.letterSpacing}
                      onChange={(v) => updateSetting("letterSpacing", v)}
                      min={-2}
                      max={10}
                      step={0.5}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="colors">
                <SectionTrigger icon={PaletteIcon}>Colors</SectionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pb-3">
                    <div>
                      <p className="mb-2 text-xs text-muted-foreground">Presets</p>
                      <div className="grid grid-cols-5 gap-1.5">
                        {COLOR_THEMES.map((t) => (
                          <button
                            key={t.name}
                            type="button"
                            title={t.name}
                            aria-label={`${t.name} preset`}
                            aria-pressed={isActiveTheme(t)}
                            onClick={() => applyTheme(t)}
                            className="group text-left"
                          >
                            <span
                              className={cn(
                                "grid h-9 place-items-center font-mono text-xs font-bold ring-1 ring-border transition-shadow group-hover:ring-2 group-hover:ring-ring",
                                isActiveTheme(t) && "ring-2 ring-primary"
                              )}
                              style={{
                                backgroundColor: t.background,
                                color: t.foreground,
                                backgroundImage: t.gradient
                                  ? `linear-gradient(90deg, transparent 70%, ${t.gradient[1]} 70%)`
                                  : undefined,
                              }}
                            >
                              #@
                            </span>
                            <span className="mt-1 block truncate text-[10px] text-muted-foreground group-hover:text-foreground">
                              {t.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <ColorRow
                      label="Ink"
                      value={settings.foregroundColor}
                      onChange={(v) => updateSetting("foregroundColor", v)}
                    />
                    <ColorRow
                      label="Paper"
                      value={settings.backgroundColor}
                      onChange={(v) => updateSetting("backgroundColor", v)}
                    />
                    <SwitchRow
                      label="Transparent paper"
                      checked={settings.backgroundTransparent}
                      onChange={(v) => updateSetting("backgroundTransparent", v)}
                    />
                    <Separator />
                    <SwitchRow
                      label="Gradient ink"
                      checked={settings.useGradient}
                      onChange={(v) => updateSetting("useGradient", v)}
                    />
                    {settings.useGradient && (
                      <>
                        <ColorRow
                          label="Gradient start"
                          value={settings.gradientColor1}
                          onChange={(v) => updateSetting("gradientColor1", v)}
                        />
                        <ColorRow
                          label="Gradient end"
                          value={settings.gradientColor2}
                          onChange={(v) => updateSetting("gradientColor2", v)}
                        />
                        <SliderRow
                          label="Angle"
                          display={`${settings.gradientAngle}°`}
                          value={settings.gradientAngle}
                          onChange={(v) => updateSetting("gradientAngle", v)}
                          min={0}
                          max={360}
                          step={5}
                        />
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="canvas">
                <SectionTrigger icon={SlidersHorizontalIcon}>Canvas</SectionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pb-3">
                    <SliderRow
                      label="Padding"
                      display={`${settings.padding} px`}
                      value={settings.padding}
                      onChange={(v) => updateSetting("padding", v)}
                      min={0}
                      max={128}
                      step={4}
                    />
                    <Segmented
                      label="Pixel density"
                      value={settings.pixelDensity}
                      options={PIXEL_DENSITY_OPTIONS}
                      onChange={(v) => updateSetting("pixelDensity", v)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="effects">
                <SectionTrigger icon={SparkleIcon}>Effects</SectionTrigger>
                <AccordionContent>
                  <div className="space-y-3.5 pb-3">
                    <SwitchRow
                      label="Glow"
                      checked={settings.glowEnabled}
                      onChange={(v) => updateSetting("glowEnabled", v)}
                    />
                    <SwitchRow
                      label="Scan lines"
                      checked={settings.scanLinesEnabled}
                      onChange={(v) => updateSetting("scanLinesEnabled", v)}
                    />
                    <SwitchRow
                      label="CRT curve"
                      checked={settings.crtEnabled}
                      onChange={(v) => updateSetting("crtEnabled", v)}
                    />
                    <SwitchRow
                      label="Noise"
                      checked={settings.noiseEnabled}
                      onChange={(v) => updateSetting("noiseEnabled", v)}
                    />
                    <Separator />
                    <SwitchRow
                      label="Text shadow"
                      checked={settings.textShadowEnabled}
                      onChange={(v) => updateSetting("textShadowEnabled", v)}
                    />
                    {settings.textShadowEnabled && (
                      <>
                        <ColorRow
                          label="Shadow color"
                          value={settings.textShadowColor}
                          onChange={(v) => updateSetting("textShadowColor", v)}
                        />
                        <SliderRow
                          label="Blur"
                          display={`${settings.textShadowBlur} px`}
                          value={settings.textShadowBlur}
                          onChange={(v) => updateSetting("textShadowBlur", v)}
                          min={0}
                          max={20}
                        />
                        <SliderRow
                          label="Offset X"
                          display={`${settings.textShadowOffsetX} px`}
                          value={settings.textShadowOffsetX}
                          onChange={(v) => updateSetting("textShadowOffsetX", v)}
                          min={-10}
                          max={10}
                        />
                        <SliderRow
                          label="Offset Y"
                          display={`${settings.textShadowOffsetY} px`}
                          value={settings.textShadowOffsetY}
                          onChange={(v) => updateSetting("textShadowOffsetY", v)}
                          min={-10}
                          max={10}
                        />
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="frame">
                <SectionTrigger icon={FrameCornersIcon}>Border & frame</SectionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pb-3">
                    <SelectRow
                      label="Frame"
                      value={settings.frameTemplate}
                      options={FRAME_TEMPLATES}
                      onChange={(v) => updateSetting("frameTemplate", v)}
                    />
                    <SelectRow
                      label="Border"
                      value={settings.borderStyle}
                      options={BORDER_STYLES}
                      onChange={(v) => updateSetting("borderStyle", v)}
                    />
                    {settings.borderStyle !== "none" && (
                      <>
                        <SliderRow
                          label="Border width"
                          display={`${settings.borderWidth} px`}
                          value={settings.borderWidth}
                          onChange={(v) => updateSetting("borderWidth", v)}
                          min={1}
                          max={12}
                        />
                        <ColorRow
                          label="Border color"
                          value={settings.borderColor}
                          onChange={(v) => updateSetting("borderColor", v)}
                        />
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="export" className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="space-y-6 p-4">
              <Segmented
                label="Format"
                value={settings.exportFormat}
                options={EXPORT_FORMATS}
                onChange={(v) => updateSetting("exportFormat", v)}
              />

              {settings.exportFormat === "jpeg" && (
                <SliderRow
                  label="Quality"
                  display={`${settings.jpegQuality}%`}
                  value={settings.jpegQuality}
                  onChange={(v) => updateSetting("jpegQuality", v)}
                  min={10}
                  max={100}
                  step={5}
                />
              )}

              <div className="space-y-2">
                <Button size="lg" className="w-full" onClick={handleExport}>
                  <DownloadSimpleIcon className="size-4" />
                  Download {settings.exportFormat.toUpperCase()}
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={copyImage}>
                  <ClipboardIcon className="size-4" />
                  Copy image
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={shareSettings}>
                  <ShareNetworkIcon className="size-4" />
                  Copy share link
                </Button>
              </div>

              <dl className="greenbar divide-y divide-border/60 font-mono text-[11px] ring-1 ring-border [--line:28px]">
                {[
                  ["Layout size", `${previewDims.width} × ${previewDims.height} px`],
                  ["Exported pixels", `${actualW} × ${actualH} px`],
                  ["Density", `${settings.pixelDensity}×`],
                ].map(([k, v]) => (
                  <div key={k} className="flex h-7 items-center justify-between px-3">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-foreground tabular">{v}</dd>
                  </div>
                ))}
              </dl>
              {previewDims.scale < settings.pixelDensity && (
                <p className="text-xs text-muted-foreground">
                  Density was lowered to stay within the browser&apos;s canvas
                  size limit.
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )

  // ─── Layout ───

  if (!mounted) {
    return (
      <div className="flex h-dvh flex-col bg-background" aria-busy="true">
        <div className="h-12 border-b border-border" />
        <div className="grid flex-1 grid-cols-1 md:grid-cols-[28%_1fr_300px]">
          <div className="greenbar border-r border-border [--line:20px]" />
          <div className="bg-housing" />
          <div className="hidden border-l border-border bg-card md:block" />
        </div>
        <span className="sr-only">Loading the studio</span>
      </div>
    )
  }

  const mobileTabs = [
    { id: "editor", label: "Text", icon: PencilSimpleIcon },
    { id: "preview", label: "Preview", icon: ImageSquareIcon },
    { id: "settings", label: "Style", icon: SlidersHorizontalIcon },
  ] as const

  return (
    <TooltipProvider delay={300}>
      <div
        className="flex h-dvh flex-col overflow-hidden bg-background text-foreground"
        onDragEnter={(e) => {
          if (e.dataTransfer.types.includes("Files")) setDragging(true)
        }}
      >
        {/* ── Header ── */}
        <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Wordmark />
            <span aria-hidden="true" className="hidden h-4 w-px bg-border sm:block" />
            <span className="hidden truncate text-sm text-muted-foreground sm:block">
              {imageSource ? imageSource.name : "Studio"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="hidden gap-2 text-muted-foreground md:inline-flex"
              onClick={() => setCommandOpen(true)}
            >
              <CommandIcon className="size-4" />
              Commands
              <kbd className="rounded-sm border border-input px-1 font-mono text-[10px]">
                {mod} K
              </kbd>
            </Button>
            <ThemeToggle />
            <Button size="sm" className="ml-1 gap-1.5 px-3" onClick={handleExport}>
              <DownloadSimpleIcon className="size-4" />
              Export
              <span className="hidden font-mono text-[10px] opacity-75 sm:inline">
                {settings.exportFormat.toUpperCase()}
              </span>
            </Button>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main className="min-h-0 flex-1">
          {isMobile ? (
            <div className="h-full">
              {/* Keep all panels mounted so the canvas exists for export */}
              <div className={cn("h-full", mobileView !== "editor" && "hidden")}>
                {editorPanel}
              </div>
              <div className={cn("h-full", mobileView !== "preview" && "hidden")}>
                {previewPanel}
              </div>
              <div className={cn("h-full", mobileView !== "settings" && "hidden")}>
                {customizerPanel}
              </div>
            </div>
          ) : (
            <ResizablePanelGroup orientation="horizontal" className="h-full">
              <ResizablePanel defaultSize={30} minSize={22}>
                {editorPanel}
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={46} minSize={30}>
                {previewPanel}
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={24} minSize={20}>
                {customizerPanel}
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </main>

        {/* ── Status bar / mobile tabs ── */}
        {isMobile ? (
          <nav
            aria-label="Studio panels"
            className="grid shrink-0 grid-cols-3 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]"
          >
            {mobileTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-current={mobileView === id ? "page" : undefined}
                onClick={() => setMobileView(id)}
                className={cn(
                  "relative flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  mobileView === id
                    ? "text-foreground after:absolute after:inset-x-6 after:top-0 after:h-0.5 after:bg-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="size-5" weight={mobileView === id ? "fill" : "regular"} />
                {label}
              </button>
            ))}
          </nav>
        ) : (
          <footer className="flex h-7 shrink-0 items-center justify-between gap-4 border-t border-border bg-card px-4 font-mono text-[11px] text-muted-foreground tabular">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-form">
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                Ready
              </span>
              <span>
                {rows} lines × {cols} columns
              </span>
              <span>{charCount.toLocaleString()} characters</span>
            </div>
            <div className="flex items-center gap-4">
              <span>
                {settings.fontFamily} {settings.fontSize} px
              </span>
              <span>
                {settings.exportFormat.toUpperCase()} @ {settings.pixelDensity}×
              </span>
            </div>
          </footer>
        )}

        {/* ── Command Palette ── */}
        <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
          <Command>
            <CommandInput placeholder="Search commands, templates and presets…" />
            <CommandList>
              <CommandEmpty>Nothing matches that.</CommandEmpty>
              <CommandGroup heading="Actions">
                <CommandItem
                  onSelect={() => {
                    fileInputRef.current?.click()
                    setCommandOpen(false)
                  }}
                >
                  <UploadSimpleIcon className="size-4" />
                  Convert a photo
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    handleExport()
                    setCommandOpen(false)
                  }}
                >
                  <DownloadSimpleIcon className="size-4" />
                  Export {settings.exportFormat.toUpperCase()}
                  <CommandShortcut>{mod} S</CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    copyImage()
                    setCommandOpen(false)
                  }}
                >
                  <ClipboardIcon className="size-4" />
                  Copy image
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    copyText()
                    setCommandOpen(false)
                  }}
                >
                  <CopyIcon className="size-4" />
                  Copy text
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    shareSettings()
                    setCommandOpen(false)
                  }}
                >
                  <ShareNetworkIcon className="size-4" />
                  Copy share link
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    undo()
                    setCommandOpen(false)
                  }}
                >
                  <ArrowCounterClockwiseIcon className="size-4" />
                  Undo
                  <CommandShortcut>{mod} Z</CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    redo()
                    setCommandOpen(false)
                  }}
                >
                  <ArrowClockwiseIcon className="size-4" />
                  Redo
                  <CommandShortcut>⇧ {mod} Z</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Templates">
                {ASCII_TEMPLATES.map((t) => (
                  <CommandItem
                    key={t.name}
                    onSelect={() => {
                      handleTextChange(t.art)
                      setCommandOpen(false)
                    }}
                  >
                    <ImageIcon className="size-4" />
                    Insert {t.name.toLowerCase()}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Color presets">
                {COLOR_THEMES.map((t) => (
                  <CommandItem
                    key={t.name}
                    onSelect={() => {
                      applyTheme(t)
                      setCommandOpen(false)
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="size-4 ring-1 ring-border"
                      style={{
                        background: `linear-gradient(135deg, ${t.background} 50%, ${t.foreground} 50%)`,
                      }}
                    />
                    {t.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.txt,.asc"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) importFile(file)
            e.target.value = ""
          }}
        />

        {/* Drop overlay — covers the window so dragleave only fires on exit */}
        {dragging && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-background/85 p-6"
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              const file = e.dataTransfer.files[0]
              if (file) importFile(file)
            }}
          >
            <div className="pointer-events-none grid w-full max-w-md grid-cols-[24px_1fr_24px] bg-background shadow-[0_24px_60px_-30px_var(--shadow)] ring-2 ring-primary">
              <div className="tractor border-r border-dashed border-input" />
              <div className="greenbar px-6 py-12 text-center [--line:24px]">
                <ImageIcon className="mx-auto mb-4 size-8 text-primary" />
                <p className="font-display text-2xl">Release to print</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Photos convert to ASCII. Text files load as they are.
                </p>
              </div>
              <div className="tractor border-l border-dashed border-input" />
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

// ─── Sub-components ───

function TooltipButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            onClick={onClick}
            disabled={disabled}
            className="text-muted-foreground hover:text-foreground"
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function SectionTrigger({
  icon: Icon,
  children,
}: {
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <AccordionTrigger className="items-center py-3.5 text-sm">
      <span className="flex items-center gap-2.5">
        <Icon className="size-4 text-form" />
        {children}
      </span>
    </AccordionTrigger>
  )
}

function SliderRow({
  label,
  display,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string
  display: React.ReactNode
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
}) {
  const id = useId()
  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <span id={id} className="text-xs text-muted-foreground">
          {label}
        </span>
        <output className="font-mono text-[11px] text-form tabular">{display}</output>
      </div>
      <Slider
        aria-labelledby={id}
        value={[value]}
        onValueChange={(v) => onChange(sliderVal(v))}
        min={min}
        max={max}
        step={step}
      />
    </div>
  )
}

function SwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  const id = useId()
  return (
    <div className="flex min-h-6 items-center justify-between gap-3">
      <Label htmlFor={id} className="text-xs font-normal text-muted-foreground">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} size="sm" />
    </div>
  )
}

function SelectRow({
  label,
  value,
  options,
  onChange,
  previewFont,
}: {
  label: string
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (v: string) => void
  previewFont?: boolean
}) {
  const id = useId()
  return (
    <div className="space-y-2">
      <span id={id} className="block text-xs text-muted-foreground">
        {label}
      </span>
      <Select
        value={value}
        items={options}
        onValueChange={(v) => v && onChange(v)}
      >
        <SelectTrigger aria-labelledby={id} className="h-8 w-full bg-background text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              <span style={previewFont ? { fontFamily: o.value } : undefined}>
                {o.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs text-muted-foreground">{label}</legend>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "h-8 rounded-sm border text-xs font-medium transition-colors",
              value === o.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background text-muted-foreground hover:border-primary hover:text-foreground"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const id = useId()
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id} className="text-xs font-normal text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-1.5">
        <label className="relative size-8 shrink-0 cursor-pointer ring-1 ring-border focus-within:ring-2 focus-within:ring-ring">
          <span className="sr-only">Pick {label.toLowerCase()}</span>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
          <span className="block size-full" style={{ backgroundColor: value }} />
        </label>
        <input
          id={id}
          type="text"
          // Uncontrolled + keyed so partial hex while typing never reaches the canvas
          key={value}
          defaultValue={value}
          onChange={(e) => {
            const v = e.target.value
            if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v)
          }}
          className="h-8 w-[5.5rem] rounded-sm border border-input bg-background px-2 font-mono text-xs uppercase outline-none focus-visible:border-ring"
          maxLength={7}
          spellCheck={false}
        />
      </div>
    </div>
  )
}
