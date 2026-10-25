export interface ImageAsciiOptions {
  columns: number
  charset: string
  customChars: string
  brightness: number
  contrast: number
  invert: boolean
  dither: boolean
  color: boolean
}

export interface AsciiResult {
  text: string
  // One CSS color per character, row by row; null when color mode is off
  colors: string[][] | null
}

// Ordered sparse → dense
export const CHARSETS = [
  { value: "standard", label: "Standard", chars: " .:-=+*#%@" },
  {
    value: "detailed",
    label: "Detailed",
    chars: Array.from(
      "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. "
    )
      .reverse()
      .join(""),
  },
  { value: "blocks", label: "Blocks", chars: " ░▒▓█" },
  { value: "simple", label: "Simple", chars: " .oO@" },
  { value: "binary", label: "Binary", chars: " 01" },
  { value: "custom", label: "Custom", chars: "" },
] as const

export const DEFAULT_IMAGE_OPTIONS: ImageAsciiOptions = {
  columns: 100,
  charset: "standard",
  customChars: " .:oO8@",
  brightness: 0,
  contrast: 0,
  invert: false,
  dither: false,
  color: false,
}

export const MAX_COLUMNS = 300
const MAX_ROWS = 400

export function resolveChars(opts: ImageAsciiOptions): string[] {
  const preset = CHARSETS.find((c) => c.value === opts.charset)
  const chars = Array.from(
    !preset || preset.value === "custom" ? opts.customChars : preset.chars
  )
  // A ramp needs at least two levels; fall back rather than render nothing
  return chars.length >= 2 ? chars : Array.from(CHARSETS[0].chars)
}

export function isLightColor(hex: string): boolean {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!m) return false
  const [r, g, b] = m.slice(1).map((h) => parseInt(h, 16))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 127.5
}

/**
 * Pure core: RGBA pixels (cols × rows, one pixel per character cell) → ASCII.
 * Bright pixels get dense characters on a dark background, and vice versa.
 * Transparent pixels always become the sparsest character.
 */
export function pixelsToAscii(
  data: ArrayLike<number>,
  cols: number,
  rows: number,
  opts: ImageAsciiOptions,
  lightBackground: boolean
): AsciiResult {
  const chars = resolveChars(opts)
  const levels = chars.length - 1
  const c = Math.max(-254, Math.min(254, opts.contrast * 2.55))
  const factor = (259 * (c + 255)) / (255 * (259 - c))
  const shift = opts.brightness * 2.55
  const adjust = (v: number) =>
    Math.max(0, Math.min(255, (v - 128) * factor + 128 + shift))

  const density = new Float32Array(cols * rows)
  const colors: string[][] | null = opts.color ? [] : null

  for (let y = 0; y < rows; y++) {
    const rowColors: string[] = []
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const r = adjust(data[i * 4])
      const g = adjust(data[i * 4 + 1])
      const b = adjust(data[i * 4 + 2])
      const a = data[i * 4 + 3] / 255
      let d = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
      if (lightBackground) d = 1 - d
      if (opts.invert) d = 1 - d
      density[i] = d * a
      if (colors)
        rowColors.push(`rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`)
    }
    colors?.push(rowColors)
  }

  const lines: string[] = []
  for (let y = 0; y < rows; y++) {
    let line = ""
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const d = Math.max(0, Math.min(1, density[i]))
      const level = Math.round(d * levels)
      line += chars[level]
      if (opts.dither) {
        // Floyd–Steinberg error diffusion
        const err = d - level / levels
        if (x + 1 < cols) density[i + 1] += (err * 7) / 16
        if (y + 1 < rows) {
          if (x > 0) density[i + cols - 1] += (err * 3) / 16
          density[i + cols] += (err * 5) / 16
          if (x + 1 < cols) density[i + cols + 1] += err / 16
        }
      }
    }
    lines.push(line)
  }

  return { text: lines.join("\n"), colors }
}

let sampler: HTMLCanvasElement | null = null

/**
 * Browser wrapper: downsamples the image to one pixel per character cell.
 * `charAspect` is character width ÷ line height, used to keep proportions.
 */
export function imageToAscii(
  image: HTMLCanvasElement,
  opts: ImageAsciiOptions,
  charAspect: number,
  lightBackground: boolean
): AsciiResult {
  const cols = Math.max(1, Math.min(MAX_COLUMNS, Math.round(opts.columns)))
  const rows = Math.max(
    1,
    Math.min(MAX_ROWS, Math.round((cols * image.height * charAspect) / image.width))
  )
  sampler ??= document.createElement("canvas")
  sampler.width = cols
  sampler.height = rows
  const ctx = sampler.getContext("2d", { willReadFrequently: true })
  if (!ctx) return { text: "", colors: null }
  ctx.clearRect(0, 0, cols, rows)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(image, 0, 0, cols, rows)
  const { data } = ctx.getImageData(0, 0, cols, rows)
  return pixelsToAscii(data, cols, rows, opts, lightBackground)
}

const MAX_SOURCE_SIDE = 1024

/** Decodes an image file into a capped-size canvas plus a small thumbnail. */
export async function loadImageFile(
  file: File
): Promise<{ canvas: HTMLCanvasElement; thumb: string }> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const w = img.naturalWidth
    const h = img.naturalHeight
    if (!w || !h) throw new Error("Image has no dimensions")

    const draw = (maxSide: number) => {
      const s = Math.min(1, maxSide / Math.max(w, h))
      const canvas = document.createElement("canvas")
      canvas.width = Math.max(1, Math.round(w * s))
      canvas.height = Math.max(1, Math.round(h * s))
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas unavailable")
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      return canvas
    }
    return { canvas: draw(MAX_SOURCE_SIDE), thumb: draw(96).toDataURL() }
  } finally {
    URL.revokeObjectURL(url)
  }
}
