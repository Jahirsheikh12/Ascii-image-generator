export interface GeneratorSettings {
  fontFamily: string
  fontSize: number
  lineHeight: number
  letterSpacing: number
  foregroundColor: string
  backgroundColor: string
  backgroundTransparent: boolean
  useGradient: boolean
  gradientColor1: string
  gradientColor2: string
  gradientAngle: number
  padding: number
  pixelDensity: number
  textShadowEnabled: boolean
  textShadowColor: string
  textShadowBlur: number
  textShadowOffsetX: number
  textShadowOffsetY: number
  glowEnabled: boolean
  scanLinesEnabled: boolean
  crtEnabled: boolean
  noiseEnabled: boolean
  borderStyle: string
  borderWidth: number
  borderColor: string
  frameTemplate: string
  exportFormat: string
  jpegQuality: number
}

export interface ColorTheme {
  name: string
  foreground: string
  background: string
  gradient?: [string, string]
}

export interface AsciiTemplate {
  name: string
  art: string
}

export const FONT_OPTIONS = [
  { value: "JetBrains Mono", label: "JetBrains Mono" },
  { value: "Courier New", label: "Courier New" },
  { value: "Consolas", label: "Consolas" },
  { value: "Monaco", label: "Monaco" },
  { value: "Menlo", label: "Menlo" },
  { value: "SF Mono", label: "SF Mono" },
  { value: "Fira Code", label: "Fira Code" },
  { value: "Source Code Pro", label: "Source Code Pro" },
] as const

export const COLOR_THEMES: ColorTheme[] = [
  { name: "Fanfold", foreground: "#1f2620", background: "#f6f9f4" },
  { name: "Classic", foreground: "#e2e8f0", background: "#0f172a" },
  {
    name: "Matrix",
    foreground: "#00ff41",
    background: "#0a0a0a",
    gradient: ["#00ff41", "#00cc33"],
  },
  {
    name: "Ocean",
    foreground: "#67e8f9",
    background: "#082f49",
    gradient: ["#06b6d4", "#3b82f6"],
  },
  {
    name: "Sunset",
    foreground: "#fbbf24",
    background: "#1c1917",
    gradient: ["#f97316", "#ef4444"],
  },
  {
    name: "Neon",
    foreground: "#e879f9",
    background: "#1a0a2e",
    gradient: ["#d946ef", "#8b5cf6"],
  },
  {
    name: "Retro",
    foreground: "#fbbf24",
    background: "#292524",
    gradient: ["#f59e0b", "#d97706"],
  },
  {
    name: "Cyberpunk",
    foreground: "#22d3ee",
    background: "#0c0a1a",
    gradient: ["#06b6d4", "#ec4899"],
  },
  {
    name: "Dracula",
    foreground: "#bd93f9",
    background: "#282a36",
    gradient: ["#bd93f9", "#ff79c6"],
  },
  {
    name: "Nord",
    foreground: "#88c0d0",
    background: "#2e3440",
    gradient: ["#88c0d0", "#81a1c1"],
  },
  {
    name: "Monokai",
    foreground: "#a6e22e",
    background: "#272822",
    gradient: ["#a6e22e", "#f92672"],
  },
]

export const ASCII_TEMPLATES: AsciiTemplate[] = [
  {
    name: "Cat",
    art: `  /\\_/\\
 ( o.o )
  > ^ <`,
  },
  {
    name: "Heart",
    art: `   ***   ***
  ***** *****
  ***********
   *********
    *******
     *****
      ***
       *`,
  },
  {
    name: "Skull",
    art: `    _____
   /     \\
  | () () |
   \\  ^  /
    |||||
    |||||`,
  },
  {
    name: "Rocket",
    art: `     /\\
    /  \\
   /    \\
  | FAN  |
  | FOLD |
  |      |
  /|    |\\
 /_|____|_\\
   /_\\/_\\`,
  },
  {
    name: "Tree",
    art: `      *
     /|\\
    / | \\
   /  |  \\
  /   |   \\
 /____|____\\
      |
      |`,
  },
  {
    name: "Star",
    art: `       .
      /|\\
     / | \\
    /  |  \\
   /   |   \\
   \\   |   /
    \\  |  /
     \\ | /
      \\|/
       '`,
  },
  {
    name: "House",
    art: `      /\\
     /  \\
    /    \\
   /______\\
   |  __  |
   | |  | |
   | |__| |
   |______|`,
  },
  {
    name: "Smiley",
    art: `  .-------.
 /         \\
|  O     O  |
|     __    |
 \\  '----' /
  '-------'`,
  },
]

export const BORDER_STYLES = [
  { value: "none", label: "None" },
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "double", label: "Double" },
] as const

export const FRAME_TEMPLATES = [
  { value: "none", label: "None" },
  { value: "terminal", label: "Terminal" },
  { value: "code-editor", label: "Code Editor" },
  { value: "polaroid", label: "Polaroid" },
  { value: "vintage", label: "Vintage" },
] as const

export const PIXEL_DENSITY_OPTIONS = [
  { value: 1, label: "1x" },
  { value: 2, label: "2x" },
  { value: 3, label: "3x" },
  { value: 4, label: "4x" },
] as const

export const EXPORT_FORMATS = [
  { value: "png", label: "PNG", mime: "image/png" },
  { value: "jpeg", label: "JPEG", mime: "image/jpeg" },
  { value: "webp", label: "WebP", mime: "image/webp" },
  { value: "svg", label: "SVG", mime: "image/svg+xml" },
] as const

export const DEFAULT_SETTINGS: GeneratorSettings = {
  fontFamily: "JetBrains Mono",
  fontSize: 16,
  lineHeight: 1.4,
  letterSpacing: 0,
  foregroundColor: "#e2e8f0",
  backgroundColor: "#0f172a",
  backgroundTransparent: false,
  useGradient: false,
  gradientColor1: "#06b6d4",
  gradientColor2: "#8b5cf6",
  gradientAngle: 45,
  padding: 32,
  pixelDensity: 2,
  textShadowEnabled: false,
  textShadowColor: "#000000",
  textShadowBlur: 4,
  textShadowOffsetX: 2,
  textShadowOffsetY: 2,
  glowEnabled: false,
  scanLinesEnabled: false,
  crtEnabled: false,
  noiseEnabled: false,
  borderStyle: "none",
  borderWidth: 2,
  borderColor: "#334155",
  frameTemplate: "none",
  exportFormat: "png",
  jpegQuality: 90,
}
