"use client"

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import {
  SunIcon,
  MoonIcon,
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
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

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
import { Badge } from "@/components/ui/badge"
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

// ─── Main Component ───

export default function AsciiGenerator() {
  // --- State ---
  const [text, setText] = useState(ASCII_TEMPLATES[0].art)
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])
  const [settings, setSettings] = useState<GeneratorSettings>(DEFAULT_SETTINGS)
  const [commandOpen, setCommandOpen] = useState(false)
  const [previewDims, setPreviewDims] = useState({ width: 0, height: 0 })
  const [mobileView, setMobileView] = useState<
    "editor" | "preview" | "settings"
  >("editor")

  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const renderTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // --- Hooks ---
  const isMobile = useIsMobile()
  const { resolvedTheme, setTheme } = useTheme()
  // false during SSR/hydration, true on the client — avoids theme flash
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

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

  // --- Text change with undo ---
  const handleTextChange = useCallback(
    (newText: string) => {
      setUndoStack((prev) => [...prev.slice(-50), text])
      setRedoStack([])
      setText(newText)
    },
    [text]
  )

  const undo = useCallback(() => {
    if (undoStack.length === 0) return
    setRedoStack((r) => [...r, text])
    setText(undoStack[undoStack.length - 1])
    setUndoStack((s) => s.slice(0, -1))
  }, [undoStack, text])

  const redo = useCallback(() => {
    if (redoStack.length === 0) return
    setUndoStack((s) => [...s, text])
    setText(redoStack[redoStack.length - 1])
    setRedoStack((r) => r.slice(0, -1))
  }, [redoStack, text])

  // --- Canvas rendering (debounced) ---
  useEffect(() => {
    if (renderTimeout.current) clearTimeout(renderTimeout.current)
    renderTimeout.current = setTimeout(() => {
      if (canvasRef.current) {
        const dims = renderAsciiToCanvas(canvasRef.current, text, settings)
        setPreviewDims(dims)
      }
    }, 60)
    return () => {
      if (renderTimeout.current) clearTimeout(renderTimeout.current)
    }
    // mounted/isMobile swap the layout, which mounts a fresh canvas
  }, [text, settings, mounted, isMobile])

  // --- Export ---
  const handleExport = useCallback(() => {
    if (!canvasRef.current) return
    const fmt = settings.exportFormat
    if (fmt === "svg") {
      const svg = generateSVG(text, settings)
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
  }, [text, settings])

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
    navigator.clipboard.writeText(text).then(
      () => toast.success("ASCII art copied!"),
      () => toast.error("Failed to copy text")
    )
  }, [text])

  // --- Import file ---
  const importFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        handleTextChange(reader.result as string)
        toast.success("File imported!")
      }
      reader.readAsText(file)
      e.target.value = ""
    },
    [handleTextChange]
  )

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
        encodeURIComponent(JSON.stringify({ text, settings }))
      )
      const url = `${window.location.origin}${window.location.pathname}#${encoded}`
      navigator.clipboard.writeText(url).then(
        () => toast.success("Share link copied!"),
        () => toast.error("Failed to copy share link")
      )
    } catch {
      toast.error("Failed to generate share link")
    }
  }, [text, settings])

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
  const lines = useMemo(() => text.split("\n"), [text])
  const rows = lines.length
  const cols = Math.max(...lines.map((l) => l.length), 0)
  const charCount = text.length

  // ─── Render sections ───

  const editorPanel = (
    <div className="flex h-full flex-col">
      {/* Templates */}
      <div className="shrink-0 border-b border-border/50 p-3">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Templates
        </p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {ASCII_TEMPLATES.map((t) => (
            <button
              key={t.name}
              onClick={() => handleTextChange(t.art)}
              className="shrink-0 rounded-md border border-border/50 bg-muted/30 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative flex-1 overflow-hidden">
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          spellCheck={false}
          className="ascii-textarea size-full resize-none border-none bg-transparent p-4 font-mono text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40"
          placeholder="Type or paste ASCII art here..."
        />
      </div>

      {/* Actions bar */}
      <div className="flex shrink-0 items-center gap-1 border-t border-border/50 px-3 py-2">
        <TooltipButton label="Undo (Ctrl+Z)" onClick={undo} disabled={undoStack.length === 0}>
          <ArrowCounterClockwiseIcon className="size-3.5" />
        </TooltipButton>
        <TooltipButton label="Redo (Ctrl+Shift+Z)" onClick={redo} disabled={redoStack.length === 0}>
          <ArrowClockwiseIcon className="size-3.5" />
        </TooltipButton>
        <Separator orientation="vertical" className="mx-1 h-4" />
        <TooltipButton label="Copy text" onClick={copyText}>
          <CopyIcon className="size-3.5" />
        </TooltipButton>
        <TooltipButton label="Import .txt file" onClick={() => fileInputRef.current?.click()}>
          <UploadSimpleIcon className="size-3.5" />
        </TooltipButton>
        <TooltipButton
          label="Clear"
          onClick={() => {
            handleTextChange("")
            toast.success("Cleared")
          }}
        >
          <TrashIcon className="size-3.5" />
        </TooltipButton>
        <div className="ml-auto text-[10px] text-muted-foreground/60">
          {rows}x{cols}
        </div>
      </div>
    </div>
  )

  const previewPanel = (
    <div className="relative flex h-full items-center justify-center overflow-auto bg-[repeating-conic-gradient(var(--color-muted)_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] p-6">
      <canvas
        ref={canvasRef}
        className="block max-w-full shadow-2xl transition-shadow"
        style={{ imageRendering: "auto" }}
      />
    </div>
  )

  const customizerPanel = (
    <div className="flex h-full flex-col overflow-hidden">
      <Tabs defaultValue="customize" className="flex h-full flex-col">
        <div className="shrink-0 border-b border-border/50 px-3 pt-2">
          <TabsList variant="line" className="h-7">
            <TabsTrigger value="customize" className="text-[11px]">
              Customize
            </TabsTrigger>
            <TabsTrigger value="export" className="text-[11px]">
              Export
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="customize" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3">
              <Accordion multiple defaultValue={["font", "colors"]}>
                {/* Font Settings */}
                <AccordionItem value="font">
                  <AccordionTrigger className="py-2 text-[11px]">
                    <span className="flex items-center gap-2">
                      <TextTIcon className="size-3.5 text-muted-foreground" />
                      Font
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pb-2">
                      <SettingRow label="Family">
                        <Select
                          value={settings.fontFamily}
                          onValueChange={(v) => v && updateSetting("fontFamily", v)}
                        >
                          <SelectTrigger className="h-7 w-full text-[11px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_OPTIONS.map((f) => (
                              <SelectItem key={f.value} value={f.value}>
                                <span style={{ fontFamily: f.value }}>
                                  {f.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </SettingRow>
                      <SettingRow label={`Size: ${settings.fontSize}px`}>
                        <Slider
                          value={[settings.fontSize]}
                          onValueChange={(v) => updateSetting("fontSize", sliderVal(v))}
                          min={8}
                          max={72}
                          step={1}
                        />
                      </SettingRow>
                      <SettingRow
                        label={`Line Height: ${settings.lineHeight.toFixed(1)}`}
                      >
                        <Slider
                          value={[settings.lineHeight]}
                          onValueChange={(v) => updateSetting("lineHeight", sliderVal(v))}
                          min={0.8}
                          max={3}
                          step={0.1}
                        />
                      </SettingRow>
                      <SettingRow
                        label={`Letter Spacing: ${settings.letterSpacing}px`}
                      >
                        <Slider
                          value={[settings.letterSpacing]}
                          onValueChange={(v) =>
                            updateSetting("letterSpacing", sliderVal(v))
                          }
                          min={-2}
                          max={10}
                          step={0.5}
                        />
                      </SettingRow>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Colors */}
                <AccordionItem value="colors">
                  <AccordionTrigger className="py-2 text-[11px]">
                    <span className="flex items-center gap-2">
                      <PaletteIcon className="size-3.5 text-muted-foreground" />
                      Colors
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pb-2">
                      {/* Theme presets */}
                      <div>
                        <Label className="mb-1.5 text-[10px] text-muted-foreground">
                          Presets
                        </Label>
                        <div className="flex flex-wrap gap-1.5">
                          {COLOR_THEMES.map((t) => (
                            <button
                              key={t.name}
                              onClick={() => applyTheme(t)}
                              className="group relative flex h-6 items-center gap-1.5 rounded-md border border-border/50 px-2 text-[10px] transition-all hover:border-primary/40"
                            >
                              <span
                                className="size-2.5 rounded-full"
                                style={{ backgroundColor: t.foreground }}
                              />
                              <span
                                className="size-2.5 rounded-full"
                                style={{ backgroundColor: t.background }}
                              />
                              <span className="text-muted-foreground group-hover:text-foreground">
                                {t.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <SettingRow label="Foreground">
                        <ColorInput
                          value={settings.foregroundColor}
                          onChange={(v) =>
                            updateSetting("foregroundColor", v)
                          }
                        />
                      </SettingRow>
                      <SettingRow label="Background">
                        <ColorInput
                          value={settings.backgroundColor}
                          onChange={(v) =>
                            updateSetting("backgroundColor", v)
                          }
                        />
                      </SettingRow>
                      <SettingRow label="Transparent BG" inline>
                        <Switch
                          checked={settings.backgroundTransparent}
                          onCheckedChange={(v) =>
                            updateSetting("backgroundTransparent", v)
                          }
                          size="sm"
                        />
                      </SettingRow>

                      <Separator className="my-1" />

                      <SettingRow label="Gradient text" inline>
                        <Switch
                          checked={settings.useGradient}
                          onCheckedChange={(v) =>
                            updateSetting("useGradient", v)
                          }
                          size="sm"
                        />
                      </SettingRow>
                      {settings.useGradient && (
                        <>
                          <SettingRow label="Gradient Start">
                            <ColorInput
                              value={settings.gradientColor1}
                              onChange={(v) =>
                                updateSetting("gradientColor1", v)
                              }
                            />
                          </SettingRow>
                          <SettingRow label="Gradient End">
                            <ColorInput
                              value={settings.gradientColor2}
                              onChange={(v) =>
                                updateSetting("gradientColor2", v)
                              }
                            />
                          </SettingRow>
                          <SettingRow
                            label={`Angle: ${settings.gradientAngle}deg`}
                          >
                            <Slider
                              value={[settings.gradientAngle]}
                              onValueChange={(v) =>
                                updateSetting("gradientAngle", sliderVal(v))
                              }
                              min={0}
                              max={360}
                              step={5}
                            />
                          </SettingRow>
                        </>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Canvas */}
                <AccordionItem value="canvas">
                  <AccordionTrigger className="py-2 text-[11px]">
                    <span className="flex items-center gap-2">
                      <SlidersHorizontalIcon className="size-3.5 text-muted-foreground" />
                      Canvas
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pb-2">
                      <SettingRow label={`Padding: ${settings.padding}px`}>
                        <Slider
                          value={[settings.padding]}
                          onValueChange={(v) => updateSetting("padding", sliderVal(v))}
                          min={0}
                          max={128}
                          step={4}
                        />
                      </SettingRow>
                      <SettingRow label="Scale">
                        <div className="flex gap-1">
                          {PIXEL_DENSITY_OPTIONS.map((o) => (
                            <button
                              key={o.value}
                              onClick={() =>
                                updateSetting("pixelDensity", o.value)
                              }
                              className={cn(
                                "rounded-md border px-2.5 py-1 text-[10px] font-medium transition-all",
                                settings.pixelDensity === o.value
                                  ? "border-primary/50 bg-primary/10 text-primary"
                                  : "border-border/50 text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {o.label}
                            </button>
                          ))}
                        </div>
                      </SettingRow>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Effects */}
                <AccordionItem value="effects">
                  <AccordionTrigger className="py-2 text-[11px]">
                    <span className="flex items-center gap-2">
                      <SparkleIcon className="size-3.5 text-muted-foreground" />
                      Effects
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pb-2">
                      <SettingRow label="Glow" inline>
                        <Switch
                          checked={settings.glowEnabled}
                          onCheckedChange={(v) =>
                            updateSetting("glowEnabled", v)
                          }
                          size="sm"
                        />
                      </SettingRow>
                      <SettingRow label="Scan Lines" inline>
                        <Switch
                          checked={settings.scanLinesEnabled}
                          onCheckedChange={(v) =>
                            updateSetting("scanLinesEnabled", v)
                          }
                          size="sm"
                        />
                      </SettingRow>
                      <SettingRow label="CRT Effect" inline>
                        <Switch
                          checked={settings.crtEnabled}
                          onCheckedChange={(v) =>
                            updateSetting("crtEnabled", v)
                          }
                          size="sm"
                        />
                      </SettingRow>
                      <SettingRow label="Noise" inline>
                        <Switch
                          checked={settings.noiseEnabled}
                          onCheckedChange={(v) =>
                            updateSetting("noiseEnabled", v)
                          }
                          size="sm"
                        />
                      </SettingRow>

                      <Separator className="my-1" />

                      <SettingRow label="Text Shadow" inline>
                        <Switch
                          checked={settings.textShadowEnabled}
                          onCheckedChange={(v) =>
                            updateSetting("textShadowEnabled", v)
                          }
                          size="sm"
                        />
                      </SettingRow>
                      {settings.textShadowEnabled && (
                        <>
                          <SettingRow label="Shadow Color">
                            <ColorInput
                              value={settings.textShadowColor}
                              onChange={(v) =>
                                updateSetting("textShadowColor", v)
                              }
                            />
                          </SettingRow>
                          <SettingRow
                            label={`Blur: ${settings.textShadowBlur}px`}
                          >
                            <Slider
                              value={[settings.textShadowBlur]}
                              onValueChange={(v) =>
                                updateSetting("textShadowBlur", sliderVal(v))
                              }
                              min={0}
                              max={20}
                              step={1}
                            />
                          </SettingRow>
                          <SettingRow
                            label={`Offset X: ${settings.textShadowOffsetX}px`}
                          >
                            <Slider
                              value={[settings.textShadowOffsetX]}
                              onValueChange={(v) =>
                                updateSetting("textShadowOffsetX", sliderVal(v))
                              }
                              min={-10}
                              max={10}
                              step={1}
                            />
                          </SettingRow>
                          <SettingRow
                            label={`Offset Y: ${settings.textShadowOffsetY}px`}
                          >
                            <Slider
                              value={[settings.textShadowOffsetY]}
                              onValueChange={(v) =>
                                updateSetting("textShadowOffsetY", sliderVal(v))
                              }
                              min={-10}
                              max={10}
                              step={1}
                            />
                          </SettingRow>
                        </>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Border & Frame */}
                <AccordionItem value="frame">
                  <AccordionTrigger className="py-2 text-[11px]">
                    <span className="flex items-center gap-2">
                      <FrameCornersIcon className="size-3.5 text-muted-foreground" />
                      Border & Frame
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pb-2">
                      <SettingRow label="Frame">
                        <Select
                          value={settings.frameTemplate}
                          onValueChange={(v) =>
                            v && updateSetting("frameTemplate", v)
                          }
                        >
                          <SelectTrigger className="h-7 w-full text-[11px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FRAME_TEMPLATES.map((f) => (
                              <SelectItem key={f.value} value={f.value}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </SettingRow>
                      <SettingRow label="Border Style">
                        <Select
                          value={settings.borderStyle}
                          onValueChange={(v) =>
                            v && updateSetting("borderStyle", v)
                          }
                        >
                          <SelectTrigger className="h-7 w-full text-[11px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BORDER_STYLES.map((b) => (
                              <SelectItem key={b.value} value={b.value}>
                                {b.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </SettingRow>
                      {settings.borderStyle !== "none" && (
                        <>
                          <SettingRow
                            label={`Width: ${settings.borderWidth}px`}
                          >
                            <Slider
                              value={[settings.borderWidth]}
                              onValueChange={(v) =>
                                updateSetting("borderWidth", sliderVal(v))
                              }
                              min={1}
                              max={12}
                              step={1}
                            />
                          </SettingRow>
                          <SettingRow label="Border Color">
                            <ColorInput
                              value={settings.borderColor}
                              onChange={(v) =>
                                updateSetting("borderColor", v)
                              }
                            />
                          </SettingRow>
                        </>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="export" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4 p-3">
              <div>
                <Label className="mb-2 text-[10px] text-muted-foreground">
                  Format
                </Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {EXPORT_FORMATS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => updateSetting("exportFormat", f.value)}
                      className={cn(
                        "rounded-md border py-2 text-[11px] font-medium transition-all",
                        settings.exportFormat === f.value
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {settings.exportFormat === "jpeg" && (
                <SettingRow
                  label={`Quality: ${settings.jpegQuality}%`}
                >
                  <Slider
                    value={[settings.jpegQuality]}
                    onValueChange={(v) => updateSetting("jpegQuality", sliderVal(v))}
                    min={10}
                    max={100}
                    step={5}
                  />
                </SettingRow>
              )}

              <div className="space-y-2 pt-2">
                <Button
                  className="w-full gap-2"
                  onClick={handleExport}
                >
                  <DownloadSimpleIcon className="size-4" />
                  Download {settings.exportFormat.toUpperCase()}
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={copyImage}
                >
                  <ClipboardIcon className="size-4" />
                  Copy to Clipboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={shareSettings}
                >
                  <ShareNetworkIcon className="size-4" />
                  Copy Share Link
                </Button>
              </div>

              <div className="rounded-md border border-border/50 bg-muted/30 p-3 text-[10px] text-muted-foreground">
                <p>
                  Output: {previewDims.width}x{previewDims.height}px @{" "}
                  {settings.pixelDensity}x
                </p>
                <p>
                  Actual: {previewDims.width * settings.pixelDensity}x
                  {previewDims.height * settings.pixelDensity}px
                </p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )

  // ─── Layout ───

  if (!mounted) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="animate-pulse text-sm text-muted-foreground">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider delay={300}>
      <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
        {/* ── Header ── */}
        <header className="flex h-11 shrink-0 items-center justify-between border-b border-border/50 px-4">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold tracking-tight">
              <span className="text-primary">ASCII</span>
              <span className="text-muted-foreground">CRAFT</span>
            </h1>
            <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">
              v1.0
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <TooltipButton
              label="Command Palette (Ctrl+K)"
              onClick={() => setCommandOpen(true)}
            >
              <CommandIcon className="size-3.5" />
            </TooltipButton>
            <TooltipButton
              label={resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              {resolvedTheme === "dark" ? (
                <SunIcon className="size-3.5" />
              ) : (
                <MoonIcon className="size-3.5" />
              )}
            </TooltipButton>
          </div>
        </header>

        {/* ── Mobile tabs ── */}
        {isMobile && (
          <div className="flex shrink-0 border-b border-border/50">
            {(["editor", "preview", "settings"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setMobileView(v)}
                className={cn(
                  "flex-1 py-2 text-[11px] font-medium capitalize transition-colors",
                  mobileView === v
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        )}

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-hidden">
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
              <ResizablePanel defaultSize={35} minSize={25}>
                {editorPanel}
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={65} minSize={35}>
                <ResizablePanelGroup orientation="vertical" className="h-full">
                  <ResizablePanel defaultSize={55} minSize={25}>
                    {previewPanel}
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={45} minSize={20}>
                    {customizerPanel}
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </main>

        {/* ── Status Bar ── */}
        <footer className="flex h-7 shrink-0 items-center justify-between border-t border-border/50 px-4 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              {rows} rows x {cols} cols
            </span>
            <span>{charCount} chars</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{settings.fontFamily}</span>
            <span>{settings.fontSize}px</span>
            <span>
              {settings.exportFormat.toUpperCase()} @{settings.pixelDensity}x
            </span>
          </div>
        </footer>

        {/* ── Command Palette ── */}
        <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
          <Command>
            <CommandInput placeholder="Search commands..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
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
                    Insert {t.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Themes">
                {COLOR_THEMES.map((t) => (
                  <CommandItem
                    key={t.name}
                    onSelect={() => {
                      applyTheme(t)
                      setCommandOpen(false)
                    }}
                  >
                    <PaletteIcon className="size-4" />
                    {t.name} theme
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Actions">
                <CommandItem
                  onSelect={() => {
                    handleExport()
                    setCommandOpen(false)
                  }}
                >
                  <DownloadSimpleIcon className="size-4" />
                  Export Image
                  <CommandShortcut>Ctrl+S</CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    copyImage()
                    setCommandOpen(false)
                  }}
                >
                  <ClipboardIcon className="size-4" />
                  Copy Image to Clipboard
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    copyText()
                    setCommandOpen(false)
                  }}
                >
                  <CopyIcon className="size-4" />
                  Copy ASCII Text
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    shareSettings()
                    setCommandOpen(false)
                  }}
                >
                  <ShareNetworkIcon className="size-4" />
                  Copy Share Link
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    undo()
                    setCommandOpen(false)
                  }}
                >
                  <ArrowCounterClockwiseIcon className="size-4" />
                  Undo
                  <CommandShortcut>Ctrl+Z</CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    redo()
                    setCommandOpen(false)
                  }}
                >
                  <ArrowClockwiseIcon className="size-4" />
                  Redo
                  <CommandShortcut>Ctrl+Shift+Z</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.asc"
          className="hidden"
          onChange={importFile}
        />
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
            size="icon-xs"
            onClick={onClick}
            disabled={disabled}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function SettingRow({
  label,
  inline,
  children,
}: {
  label: string
  inline?: boolean
  children: React.ReactNode
}) {
  if (inline) {
    return (
      <div className="flex items-center justify-between">
        <Label className="text-[11px] text-muted-foreground">{label}</Label>
        {children}
      </div>
    )
  }
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function ColorInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 size-7 cursor-pointer opacity-0"
        />
        <div
          className="size-7 rounded-md border border-border/50 shadow-sm"
          style={{ backgroundColor: value }}
        />
      </div>
      <input
        type="text"
        // Uncontrolled + keyed so partial hex while typing never reaches the canvas
        key={value}
        defaultValue={value}
        onChange={(e) => {
          const v = e.target.value
          if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v)
        }}
        className="h-7 w-full rounded-md border border-border/50 bg-transparent px-2 font-mono text-[11px] outline-none focus:border-ring"
        maxLength={7}
      />
    </div>
  )
}
