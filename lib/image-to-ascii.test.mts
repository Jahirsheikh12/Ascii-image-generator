// Run: node --no-warnings lib/image-to-ascii.test.mts
import assert from "node:assert/strict"
import {
  pixelsToAscii,
  isLightColor,
  resolveChars,
  CHARSETS,
  DEFAULT_IMAGE_OPTIONS as base,
} from "./image-to-ascii.ts"

// 4×1 strip: black, mid-grey, white, transparent white
const px = [0, 0, 0, 255, 128, 128, 128, 255, 255, 255, 255, 255, 255, 255, 255, 0]

assert.equal(pixelsToAscii(px, 4, 1, base, false).text, " +@ ") // dark bg: bright → dense
assert.equal(pixelsToAscii(px, 4, 1, base, true).text, "@=  ") // light bg: dark → dense (transparent stays blank)
assert.equal(pixelsToAscii(px, 4, 1, { ...base, invert: true }, false).text, "@=  ")
assert.equal(pixelsToAscii(px, 4, 1, { ...base, brightness: 100 }, false).text, "@@@ ")

const colored = pixelsToAscii(px, 2, 2, { ...base, color: true }, false)
assert.equal(colored.text, " +\n@ ")
assert.deepEqual(colored.colors, [["rgb(0,0,0)", "rgb(128,128,128)"], ["rgb(255,255,255)", "rgb(255,255,255)"]])

// Dithering a flat 50% grey must mix levels, not produce one flat character
const grey = Array.from({ length: 64 }, () => [100, 100, 100, 255]).flat()
const blocks = { ...base, charset: "binary", dither: true }
assert.ok(new Set(pixelsToAscii(grey, 16, 4, blocks, false).text.replace(/\n/g, "")).size > 1)

assert.equal(resolveChars({ ...base, charset: "custom", customChars: "x" }).join(""), CHARSETS[0].chars)
assert.equal(resolveChars({ ...base, charset: "detailed" })[0], " ")
assert.equal(isLightColor("#ffffff"), true)
assert.equal(isLightColor("#0f172a"), false)

console.log("image-to-ascii: ok")
