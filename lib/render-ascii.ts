import type { GeneratorSettings } from "./ascii-data"

export function renderAsciiToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  settings: GeneratorSettings
): { width: number; height: number } {
  const ctx = canvas.getContext("2d")
  if (!ctx) return { width: 0, height: 0 }

  const dpr = settings.pixelDensity
  const lines = text.split("\n")
  const maxLen = Math.max(...lines.map((l) => l.length), 1)

  // Measure character width with desired font
  ctx.font = `${settings.fontSize}px "${settings.fontFamily}", monospace`
  const charWidth = ctx.measureText("M").width + settings.letterSpacing
  const lineHeightPx = settings.fontSize * settings.lineHeight

  // Content dimensions
  const contentW = maxLen * charWidth
  const contentH = lines.length * lineHeightPx

  // Frame offsets (top, left, bottom, side-extra)
  let ft = 0,
    fl = 0,
    fb = 0,
    fs = 0
  if (settings.frameTemplate === "terminal") {
    ft = 36
  } else if (settings.frameTemplate === "code-editor") {
    ft = 32
    fl = 48
  } else if (settings.frameTemplate === "polaroid") {
    fb = 64
    fs = 16
  } else if (settings.frameTemplate === "vintage") {
    ft = 12
    fl = 12
    fb = 12
    fs = 12
  }

  const bw = settings.borderStyle !== "none" ? settings.borderWidth : 0
  const totalW = contentW + settings.padding * 2 + fl + fs * 2 + bw * 2
  const totalH = contentH + settings.padding * 2 + ft + fb + bw * 2

  // Set canvas size with DPI scaling
  canvas.width = Math.ceil(totalW * dpr)
  canvas.height = Math.ceil(totalH * dpr)
  canvas.style.width = Math.ceil(totalW) + "px"
  canvas.style.height = Math.ceil(totalH) + "px"
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, totalW, totalH)

  // === BACKGROUND ===
  if (!settings.backgroundTransparent) {
    if (settings.frameTemplate === "polaroid") {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, totalW, totalH)
      ctx.fillStyle = settings.backgroundColor
      ctx.fillRect(
        fs + bw,
        bw,
        totalW - fs * 2 - bw * 2,
        totalH - fb - bw * 2
      )
    } else {
      ctx.fillStyle = settings.backgroundColor
      ctx.fillRect(0, 0, totalW, totalH)
    }
  }

  // === FRAME DECORATIONS ===
  if (settings.frameTemplate === "terminal") {
    drawTerminalFrame(ctx, totalW, ft)
  } else if (settings.frameTemplate === "code-editor") {
    drawCodeEditorFrame(
      ctx,
      totalW,
      totalH,
      ft,
      fl,
      settings,
      lines.length,
      lineHeightPx
    )
  } else if (settings.frameTemplate === "vintage") {
    drawVintageFrame(ctx, totalW, totalH)
  }

  // === BORDER ===
  if (settings.borderStyle !== "none" && bw > 0) {
    drawBorder(ctx, settings, totalW, totalH)
  }

  // === TEXT RENDERING ===
  const textX = settings.padding + fl + fs + bw
  const textY = settings.padding + ft + bw

  ctx.font = `${settings.fontSize}px "${settings.fontFamily}", monospace`
  ctx.textBaseline = "top"

  // Shadow / glow
  ctx.shadowColor = "transparent"
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  if (settings.glowEnabled) {
    ctx.shadowColor = settings.useGradient
      ? settings.gradientColor1
      : settings.foregroundColor
    ctx.shadowBlur = 14
  } else if (settings.textShadowEnabled) {
    ctx.shadowColor = settings.textShadowColor
    ctx.shadowBlur = settings.textShadowBlur
    ctx.shadowOffsetX = settings.textShadowOffsetX
    ctx.shadowOffsetY = settings.textShadowOffsetY
  }

  // Fill style (gradient or solid)
  if (settings.useGradient) {
    const angle = (settings.gradientAngle * Math.PI) / 180
    const diag = Math.sqrt(totalW ** 2 + totalH ** 2) / 2
    const cx = totalW / 2,
      cy = totalH / 2
    const grad = ctx.createLinearGradient(
      cx - Math.cos(angle) * diag,
      cy - Math.sin(angle) * diag,
      cx + Math.cos(angle) * diag,
      cy + Math.sin(angle) * diag
    )
    grad.addColorStop(0, settings.gradientColor1)
    grad.addColorStop(1, settings.gradientColor2)
    ctx.fillStyle = grad
  } else {
    ctx.fillStyle = settings.foregroundColor
  }

  // Draw each line
  lines.forEach((line, i) => {
    const y = textY + i * lineHeightPx
    if (settings.letterSpacing !== 0) {
      let x = textX
      for (const char of line) {
        if (char !== " ") ctx.fillText(char, x, y)
        x += ctx.measureText(char).width + settings.letterSpacing
      }
    } else {
      ctx.fillText(line, textX, y)
    }
  })

  // Extra glow pass
  if (settings.glowEnabled) {
    ctx.globalAlpha = 0.35
    lines.forEach((line, i) => {
      ctx.fillText(line, textX, textY + i * lineHeightPx)
    })
    ctx.globalAlpha = 1
  }

  // Clear shadow for post-processing
  ctx.shadowColor = "transparent"
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // === POST-PROCESSING ===
  if (settings.scanLinesEnabled) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.07)"
    for (let y = 0; y < totalH; y += 3) {
      ctx.fillRect(0, y, totalW, 1)
    }
  }

  if (settings.crtEnabled) {
    const vig = ctx.createRadialGradient(
      totalW / 2,
      totalH / 2,
      0,
      totalW / 2,
      totalH / 2,
      Math.max(totalW, totalH) / 1.4
    )
    vig.addColorStop(0, "rgba(0,0,0,0)")
    vig.addColorStop(0.7, "rgba(0,0,0,0)")
    vig.addColorStop(1, "rgba(0,0,0,0.35)")
    ctx.fillStyle = vig
    ctx.fillRect(0, 0, totalW, totalH)
  }

  if (settings.noiseEnabled) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const d = imageData.data
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 15
      d[i] = Math.min(255, Math.max(0, d[i] + n))
      d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n))
      d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n))
    }
    ctx.putImageData(imageData, 0, 0)
  }

  return { width: Math.ceil(totalW), height: Math.ceil(totalH) }
}

// === FRAME HELPERS ===

function drawTerminalFrame(
  ctx: CanvasRenderingContext2D,
  totalW: number,
  frameTop: number
) {
  ctx.fillStyle = "#2d2d2d"
  ctx.fillRect(0, 0, totalW, frameTop)

  // Traffic light buttons
  const btnY = frameTop / 2
  const r = 6
  const colors = ["#ff5f57", "#febc2e", "#28c840"]
  colors.forEach((c, i) => {
    ctx.beginPath()
    ctx.arc(18 + i * 22, btnY, r, 0, Math.PI * 2)
    ctx.fillStyle = c
    ctx.fill()
  })

  // Title
  ctx.fillStyle = "#9ca3af"
  ctx.font = '12px "JetBrains Mono", monospace'
  ctx.textBaseline = "middle"
  ctx.textAlign = "center"
  ctx.fillText("terminal", totalW / 2, btnY)
  ctx.textAlign = "start"
  ctx.textBaseline = "top"

  // Separator
  ctx.fillStyle = "#404040"
  ctx.fillRect(0, frameTop - 1, totalW, 1)
}

function drawCodeEditorFrame(
  ctx: CanvasRenderingContext2D,
  totalW: number,
  totalH: number,
  frameTop: number,
  frameLeft: number,
  settings: GeneratorSettings,
  lineCount: number,
  lineHeightPx: number
) {
  // Title bar
  ctx.fillStyle = "#1e1e1e"
  ctx.fillRect(0, 0, totalW, frameTop)

  // Active tab
  ctx.fillStyle = settings.backgroundColor
  ctx.fillRect(0, 0, 130, frameTop)
  ctx.fillStyle = "#cccccc"
  ctx.font = '11px "JetBrains Mono", monospace'
  ctx.textBaseline = "middle"
  ctx.fillText("  ascii-art.txt", 10, frameTop / 2)
  ctx.textBaseline = "top"

  // Separator
  ctx.fillStyle = "#333333"
  ctx.fillRect(0, frameTop - 1, totalW, 1)

  // Line number gutter
  ctx.fillStyle = adjustBrightness(settings.backgroundColor, -8)
  ctx.fillRect(0, frameTop, frameLeft, totalH - frameTop)

  // Line numbers
  ctx.fillStyle = "#4a5568"
  const numFontSize = Math.max(settings.fontSize * 0.85, 10)
  ctx.font = `${numFontSize}px "${settings.fontFamily}", monospace`
  ctx.textAlign = "right"
  ctx.textBaseline = "top"

  const bw = settings.borderStyle !== "none" ? settings.borderWidth : 0
  for (let i = 0; i < lineCount; i++) {
    const y = settings.padding + frameTop + bw + i * lineHeightPx
    const offset = (settings.fontSize - numFontSize) / 2
    ctx.fillText(String(i + 1), frameLeft - 10, y + offset)
  }
  ctx.textAlign = "start"

  // Gutter separator
  ctx.fillStyle = "#333333"
  ctx.fillRect(frameLeft - 1, frameTop, 1, totalH - frameTop)
}

function drawVintageFrame(
  ctx: CanvasRenderingContext2D,
  totalW: number,
  totalH: number
) {
  ctx.strokeStyle = "#8b7355"
  ctx.lineWidth = 2
  const cs = 20

  // Corner marks
  const corners = [
    [4, cs + 4, 4, 4, cs + 4, 4],
    [totalW - cs - 4, 4, totalW - 4, 4, totalW - 4, cs + 4],
    [4, totalH - cs - 4, 4, totalH - 4, cs + 4, totalH - 4],
    [
      totalW - cs - 4,
      totalH - 4,
      totalW - 4,
      totalH - 4,
      totalW - 4,
      totalH - cs - 4,
    ],
  ]
  corners.forEach(([x1, y1, x2, y2, x3, y3]) => {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.stroke()
  })
}

function drawBorder(
  ctx: CanvasRenderingContext2D,
  settings: GeneratorSettings,
  totalW: number,
  totalH: number
) {
  ctx.strokeStyle = settings.borderColor
  ctx.lineWidth = settings.borderWidth
  const hw = settings.borderWidth / 2

  switch (settings.borderStyle) {
    case "solid":
      ctx.setLineDash([])
      ctx.strokeRect(hw, hw, totalW - settings.borderWidth, totalH - settings.borderWidth)
      break
    case "dashed":
      ctx.setLineDash([8, 4])
      ctx.strokeRect(hw, hw, totalW - settings.borderWidth, totalH - settings.borderWidth)
      ctx.setLineDash([])
      break
    case "double":
      ctx.setLineDash([])
      ctx.lineWidth = 1
      ctx.strokeRect(1, 1, totalW - 2, totalH - 2)
      ctx.strokeRect(
        settings.borderWidth + 1,
        settings.borderWidth + 1,
        totalW - settings.borderWidth * 2 - 2,
        totalH - settings.borderWidth * 2 - 2
      )
      break
  }
}

function adjustBrightness(hex: string, amount: number): string {
  if (!hex.startsWith("#") || hex.length < 7) return hex
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + amount))
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

export function generateSVG(text: string, settings: GeneratorSettings): string {
  const lines = text.split("\n")
  const lineHeightPx = settings.fontSize * settings.lineHeight
  const width =
    Math.max(...lines.map((l) => l.length)) * settings.fontSize * 0.6 +
    settings.padding * 2
  const height = lines.length * lineHeightPx + settings.padding * 2

  const textEls = lines
    .map((line, i) => {
      const y = settings.padding + (i + 1) * lineHeightPx
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
      return `  <text x="${settings.padding}" y="${y}" fill="${settings.foregroundColor}" font-family="'${settings.fontFamily}', monospace" font-size="${settings.fontSize}" xml:space="preserve">${escaped}</text>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${!settings.backgroundTransparent ? `<rect width="100%" height="100%" fill="${settings.backgroundColor}"/>` : ""}
${textEls}
</svg>`
}
