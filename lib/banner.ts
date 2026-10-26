// Banner-page lettering, each letter set in itself, like a line printer's job separator
const GLYPHS: Record<string, string[]> = {
  F: ["FFFFF", "F    ", "FFFF ", "F    ", "F    "],
  A: [" AAA ", "A   A", "AAAAA", "A   A", "A   A"],
  N: ["N   N", "NN  N", "N N N", "N  NN", "N   N"],
  O: [" OOO ", "O   O", "O   O", "O   O", " OOO "],
  L: ["L    ", "L    ", "L    ", "L    ", "LLLLL"],
  D: ["DDDD ", "D   D", "D   D", "D   D", "DDDD "],
  "4": ["4   4", "4   4", "44444", "    4", "    4"],
  "0": [" 000 ", "0  00", "0 0 0", "00  0", " 000 "],
}

/** Five-row banner text for a word made of the glyphs above. */
export function banner(word: string): string {
  return [0, 1, 2, 3, 4]
    .map((row) =>
      Array.from(word)
        .map((ch) => GLYPHS[ch][row])
        .join(" ")
    )
    .join("\n")
}
