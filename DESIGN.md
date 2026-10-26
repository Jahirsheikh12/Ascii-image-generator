---
name: Fanfold
description: A line printer for ASCII art, shown on clean paper; the print is the only texture.
colors:
  paper: "oklch(0.985 0.006 145)"
  ink: "oklch(0.24 0.014 150)"
  card-paper: "oklch(0.99 0.004 145)"
  form-green: "oklch(0.48 0.09 152)"
  primary: "oklch(0.45 0.09 152)"
  primary-foreground: "oklch(0.985 0.006 145)"
  ring: "oklch(0.55 0.11 152)"
  mint-bar: "oklch(0.94 0.04 150)"
  secondary: "oklch(0.935 0.035 150)"
  secondary-foreground: "oklch(0.3 0.06 152)"
  muted: "oklch(0.955 0.014 148)"
  muted-foreground: "oklch(0.46 0.03 152)"
  border: "oklch(0.86 0.03 150)"
  input: "oklch(0.82 0.035 150)"
  housing: "oklch(0.925 0.01 150)"
  destructive: "oklch(0.53 0.19 27)"
  dark-paper: "oklch(0.19 0.012 155)"
  dark-ink: "oklch(0.93 0.012 140)"
  dark-primary: "oklch(0.8 0.1 152)"
  dark-form-green: "oklch(0.74 0.08 152)"
  dark-bar: "oklch(0.235 0.026 152)"
  dark-housing: "oklch(0.16 0.01 155)"
typography:
  display:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(2.5rem, 4.6vw, 4.1rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(1.9rem, 3.4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 125"
  title:
    fontFamily: "Archivo, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 125"
  body:
    fontFamily: "Archivo, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Archivo, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
  ui:
    fontFamily: "Archivo, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
  printout:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.2
    fontFeature: "'liga' 0"
  readout:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: "'tnum' 1"
rounded:
  none: "0px"
  hairline: "1.8px"
  control: "3px"
spacing:
  line: "20px"
  line-loose: "24px"
  control-height: "32px"
  bar-height: "44px"
  gutter-sm: "20px"
  gutter-md: "32px"
  gutter-lg: "48px"
  section: "64px"
  section-lg: "96px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.none}"
    padding: "0 10px"
    height: "32px"
    typography: "{typography.ui}"
  button-primary-lg:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "40px"
    typography: "{typography.label}"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 10px"
    height: "32px"
  button-outline-hover:
    backgroundColor: "{colors.muted}"
  button-ghost-hover:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.ink}"
  choice-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.hairline}"
    height: "32px"
    padding: "0 12px"
  choice-chip-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
  text-input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.hairline}"
    height: "32px"
    padding: "0 10px"
    typography: "{typography.readout}"
  kbd:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.hairline}"
    padding: "2px 6px"
  privacy-panel:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.none}"
    padding: "40px"
---

# Design System: Fanfold

## Overview

**Creative North Star: "The Clean Printout"**

Fanfold is a line printer for ASCII art, shown on clean paper. The printed output is the only texture in the system. Surfaces are plain cool paper in light mode and carbon in dark. The printer's character lives in four places: the wide, form-printed headings; form-green line numbers and readouts; the stepped row-by-row print reveal; and thin perforated tear lines between landing sections. Ink is a near-black foreground with a green cast. Form furniture (line numbers, counts, sizes, captions) is printed in form green, the colour of a pre-printed form.

The look is quiet and premium: generous section spacing, one heavy anchor per page, hairline rulings, and a single soft shadow under the sheets that hold a print. The studio is an operator console on the same paper. The text editor carries a line-number gutter on a 20px rhythm, the preview sits in a slightly darker printer housing, and settings sit on card stock. Dark mode is the machine room after hours: sage form ink on carbon.

The world rejects the neon terminal (green-on-black glow, glowing edges) and the generic SaaS page (purple gradients, glass cards, a centred hero over three feature boxes). It also no longer uses decorative paper texture: no green-bar stripes, no sprocket margins, no desk border, no page counters.

**Key Characteristics:**
- Plain paper surfaces; the print is the only texture.
- Form green for every machine-printed annotation: line numbers, counts, readouts, captions.
- Wide (125% width) Archivo for headings, bold at 700, with only the page h1 at 800; JetBrains Mono for anything printed.
- Thin dashed perforations between landing sections, with no labels.
- Square corners on buttons and sheets; near-square hairline corners on small controls.
- Motion is a stepped carriage advance: output appears row by row, never fades in.

## Colors

One green family: hue 145 to 155 runs through paper, ink, form and accent, with a single red reserved for destructive actions.

### Primary
- **Form Press Green** (primary): filled actions, selected chips, the active slider range, the switch track, the privacy panel, drag-target and active-preset rings. Lighter in dark mode (dark-primary) so it reads as sage ink on carbon.
- **Form Ink** (form-green): pre-printed form furniture. Line-number gutters (75 to 80% opacity), banner lettering (60% opacity), numeric readouts, captions under prints, the footer sign-off, section icons in the studio settings, the wordmark glyph strokes. Its job is to annotate, not to act.

### Secondary
- **Mint Bar** (mint-bar): kept only as the fill of the fanfold glyph's outer panels in the wordmark and favicon. It is not a surface colour.
- **Pale Mint Wash** (secondary): hover fill on dashed drop zones and secondary buttons.

### Neutral
- **Cool Paper** (paper): the page, the sticky header and the footer.
- **Foreground Ink** (ink): all body text and printed ASCII output, and the 1px top rule (at 80%) over the job-report list.
- **Card Stock** (card-paper): sheets that hold a print (the hero printout, the studio drop overlay), the studio header and the settings panel.
- **Muted Ink** (muted-foreground): supporting copy, nav links, field labels.
- **Ruling** (border) and **Field Edge** (input): hairline dividers and ring outlines (border); control strokes, dashed gutter edges and the scrollbar thumb (input).
- **Printer Housing** (housing): the studio preview stage, the finish-picker frame, image thumbnails.
- **Fault Red** (destructive): destructive actions and invalid states only.

### Named Rules
**The Form Ink Rule.** Anything a machine would print onto the form (line numbers, counts, dimensions, captions, the banner) is form green in mono with tabular figures. Content the user made is foreground ink. Never swap them.

**The Only Texture Rule.** Surfaces are flat paper, card or housing. Pattern exists only in the printed ASCII and the perforated tear line. No stripes, punched margins or decorative fills.

## Typography

**Display Font:** Archivo at 125% width (with sans-serif fallback)
**Body Font:** Archivo at normal width (with sans-serif fallback)
**Label/Mono Font:** JetBrains Mono

**Character:** the expanded Archivo is the pre-printed form header, broad and mechanical. JetBrains Mono is the print head: every character cell is 0.6em wide on a 1.2em line.

### Hierarchy
- **Display** (800, 125% width, clamp(2.5rem, 4.6vw, 4.1rem), 0.98): the landing h1 only.
- **Headline** (700, 125% width, clamp(1.9rem, 3.4vw, 3rem), 1.02): landing section headings, short declaratives ending in a full stop. The 404 h1 uses this size at 800. The closing call to action uses clamp(2.2rem, 5vw, 4.5rem) at 700.
- **Title** (700, 125% width, 1.125 to 1.5rem): report row titles, the privacy panel heading, "Release to print", "Nothing to print yet".
- **Body** (400, 1.125rem, 1.625): lead paragraphs in muted ink, capped near 44ch in the hero.
- **Label** (500, 0.875rem): nav links, field legends, list terms. Studio controls drop to 0.75rem.
- **Printout** (JetBrains Mono, 1.2 line height, ligatures off): all ASCII output. Hero size is computed from the column count so the sheet always fits.
- **Readout** (JetBrains Mono, 10 to 12px, tabular figures, form green): values, dimensions, zoom, captions.

### Named Rules
**The One Anchor Rule.** Only the page's h1 sets the display cut at 800. Every other display heading stays at 700, and body, labels and controls stay at normal width.

**The Line Grid Rule.** Printed output sits at 1.2 line height. A line-number gutter shares its text's exact line height (1.2em on the hero, 20px in the editor) so numbers and rows stay in phase.

## Layout

The landing page is plain paper. A full-bleed sticky header (64px, 1px ruling under it) holds an inner container. All content sits in a centred container at most 1360px wide, with horizontal gutters of 20, 32 or 48px (base, sm, lg). Sections have vertical padding of 64px, rising to 96px at lg. The closing section is 80px, rising to 96px. Full-width dashed perforations, with no labels, separate the sections. Composition is a 12-column grid at lg with asymmetric spans (5/7 in the hero, 8/4 in the finish picker, 4/7 and 7/4 elsewhere).

From sm up, the hero opens with a banner: FANFOLD in five-row letters, each letter set in itself, in form ink at 60%. Below sm the banner is hidden, and the header wordmark carries the name. The 404 page uses the same container and banner set ("404"), under a non-sticky header with the wordmark and theme toggle.

The landing page lays repeating content out as a job report: full-width rows split 4/8, divided by rulings under a 1px ink top rule. Specs are leader lists, a term column 11rem wide beside its description. Neither uses cards.

The studio is a full-height console: a 48px header, then three panes (text at 28%, preview, settings at 300px) with resizable dividers that turn primary on hover. On mobile it switches to tabs (Text, Preview, Style). Toolbars are 44px tall. Controls are 32px tall.

## Elevation & Depth

The system is flat and tonal (paper, card, housing). It adds one soft, downward shadow only where a sheet holding a print rests above the page or stage. There is no glow and no coloured shadow. The shadow colour is a tokenised green-black, heavier in dark mode.

### Shadow Vocabulary
- **Sheet lift** (`box-shadow: 0 1px 0 var(--border), 0 24px 48px -28px var(--shadow)`): the hero printout card.
- **Drop sheet** (`box-shadow: 0 24px 60px -30px var(--shadow)`): the studio drop overlay card.
- **Print on stage** (`filter: drop-shadow(0 18px 28px var(--shadow))`): a rendered canvas in a housing (studio preview, landing finish picker).
- **Empty sheet** (`box-shadow: 0 18px 28px var(--shadow)`): the blank "Nothing to print yet" sheet on the studio stage.
- **Header rule** (`box-shadow: 0 1px 0 var(--border)`): the 1px rule under the landing and 404 headers. It is a rule, not depth.

### Named Rules
**The Paper Lift Rule.** A shadow means a sheet with a print on it resting above the surface. It is soft, it falls downward, and it uses a negative spread where the sheet sits on the page. Buttons, chips, panels and controls never cast one.

## Shapes

Corners are square. Buttons, sheets, cards, tabs, slider tracks, panels and the privacy block use 0 radius. Small hand controls (choice chips, text and hex inputs, kbd keys, nav link hit areas) take a hairline 1.8px corner. The switch takes 3px, and its thumb and the slider thumb take 2px. Nothing is pill-shaped. Edges are rulings: 1px rings in the border tone, dashed field-edge lines on the editor gutter and drop zones, and the perforation, which is 6px dashes with 4px gaps at 55% form green.

## Components

### Buttons
Blunt, form-press buttons: flat fills, square corners, no lift.
- **Shape:** square (0px).
- **Pairing:** where two actions sit together, the primary is paired with an outline secondary (hero, 404).
- **Primary:** form-press green fill with paper text, 32px tall with 10px padding at 0.75rem medium. The large size is 40px tall with 16px padding at 0.875rem. A trailing arrow icon marks forward navigation.
- **Hover / Focus:** the fill drops to 88% (80% when pressed). Focus shows a 2px ring-colour outline with a 2px offset.
- **Outline:** paper fill with a ruling stroke, filling muted on hover. Used for the secondary action and the empty-state actions.
- **Ghost:** no fill until hover (muted). Used for toolbar icons, the theme toggle (28px square) and Reset style.

### Chips
- **Style:** 32px choice buttons in a row or grid, hairline corners, field-edge stroke on paper, muted ink.
- **State:** hover turns the stroke primary and the text to ink. Selected is a solid primary fill with paper text and `aria-pressed`.

### Cards / Containers
- **Corner Style:** square.
- **Background:** card stock for print sheets, housing for render frames, primary for the privacy panel.
- **Shadow Strategy:** only the sheet lifts in Elevation.
- **Border:** a 1px ruling ring. The hero sheet ring shifts toward primary (40%) on hover, and becomes a 2px primary ring while a file is dragged over it.
- **Internal Padding:** 16 to 32px around rendered canvases. 32 to 40px on the privacy panel.

### Inputs / Fields
- **Style:** 32px tall, hairline corners, field-edge stroke, paper fill, mono 0.75rem text (hex values in uppercase).
- **Focus:** the stroke shifts to the ring colour.
- **Sliders:** a 4px square track in muted with a primary range, and a 14px square thumb (2px corner) with a primary border on paper.
- **Switch:** 32 by 18px (24 by 14px small), 3px corner, field-edge track that turns primary when on.

### Wordmark
A folded fanfold glyph (three panels: mint-bar fills, form-green strokes, foreground-ink print lines) beside "Fanfold" in the display cut at 15px. The favicon is the same glyph on a paper tile.

### Labelled Setting Controls
The studio and the landing finish picker use the same labelled rows, so a control looks identical in both places. Each has a 0.75rem muted-ink label.
- **Slider row:** the label on the left and a form-green mono readout on the right, above a slider named through aria-labelledby.
- **Switch row:** the label on the left and a small switch on the right. The visible switch is named through aria-labelledby.
- **Select row:** the label above a 32px trigger on paper.
- **Segmented:** a one-of grid of 32px choice chips in equal columns.
- **Color row:** a 32px square swatch with a 1px ruling ring (2px ring colour on focus) beside an uppercase mono hex field.
- **Preset swatches:** a five-column grid of 36px tiles. Each shows "#@" in the preset's own ink on its own paper, with a stripe for gradient ink. The tile has a 1px ruling ring, 2px ring colour on hover and 2px primary when active, with an 11px name below.

### Navigation
The landing header is full-bleed and sticky, 64px tall on paper, with a 1px ruling under it. It holds the wordmark, then muted 0.875rem text links that turn ink on hover (hidden below md), the theme toggle, and a primary "Open studio" button. The studio header is 48px on card stock with a ruling underneath: wordmark, a 1px divider, the current file name in muted ink, then ghost actions including a Commands button with a kbd hint. Studio mobile uses bottom tabs. Tabs elsewhere use a square muted track; the line variant has a 2px primary underline.

### Printout Sheet (signature)
A square card-stock sheet with a 1px ruling ring and the sheet-lift shadow. A form-green line-number gutter (75%) runs down the left. A mono caption above it gives the file name and `columns × rows · charset`. On the landing page the sheet is the drop target and opens the file picker on tap. The hero sample prints at 48 columns on phones and 76 on desktop until the visitor moves the slider. The studio editor uses the same idea without the card: a scroll-synced line gutter, divided off by a dashed edge, on a 20px line rhythm.

### Finish Picker
The landing "Try a finish" section runs the real export engine on one live canvas. The canvas sits in the printer housing with a 1px ruling ring and the print-on-stage shadow. Beside it are the shared controls: preset swatches, effect switch rows and a frame select. Under it, a form-green mono readout lists the active finish, separated by " · ", and announces changes politely. It opens on the Fanfold preset with the polaroid frame (no stripes, no window chrome).

### Studio Stage
- **Zoom:** in fit mode the preview scales to fit the stage, up to 2×. A form-green mono readout in the toolbar shows "Fit · N%" or "100%".
- **Empty state:** with no text, the stage shows a blank card-stock sheet: "Nothing to print yet" in title type, a muted line, and small outline actions (Type, Templates, Photo).
- **Drop overlay:** a card-stock sheet with a 2px primary ring, a primary image icon and "Release to print".
- **Templates:** a native disclosure with a muted 0.75rem summary and a caret that rotates when it opens.
- **Export sizes:** a plain mono list divided by rulings inside a 1px ring.
- **Reset style:** a full-width ghost button at the foot of the settings. Its toast offers Undo.

### Print Reveal (signature motion)
New output is uncovered top to bottom by a clip-path wipe that advances in `steps(rows)`, one step per printed row. On the hero it takes about 0.045s per row, at most 1.8s, and replays whenever the source, charset, invert setting or theme changes. Other landing prints run the reveal once, when they scroll into view (25% visible, about 0.06s per row, at most 1.6s). Prints already on screen at load stay printed. When reduced motion is requested, the reveal is skipped entirely.

## Do's and Don'ts

### Do:
- **Do** keep surfaces plain paper, card or housing, and let the printed ASCII be the texture.
- **Do** print machine annotations (line numbers, counts, sizes, captions) in form-green JetBrains Mono with tabular figures.
- **Do** separate landing sections with a thin, unlabelled perforated tear line.
- **Do** keep a line-number gutter on the same line height as its text.
- **Do** keep buttons and sheets square (0px), and keep small controls at 3px or less.
- **Do** show real rendered output from the engine on every surface. Never show a picture of ASCII.
- **Do** reveal new output with the stepped, row-by-row print reveal, and drop it under reduced motion.
- **Do** keep both modes: cool paper in light, sage form ink on carbon in dark.

### Don't:
- **Don't** add green-bar stripes, sprocket-hole margins, a desk border or page counters. They were removed for a cleaner look.
- **Don't** add glow, neon green-on-black, or glowing edges to the interface.
- **Don't** use purple gradients, glass cards, or a centred hero above three feature boxes.
- **Don't** use gradients as decoration. The perforation and the transparency checkerboard are the only interface patterns.
- **Don't** give buttons, chips or panels a shadow. Shadows belong to sheets holding a print.
- **Don't** set any heading other than the page h1 at 800, or use the wide display cut for body, labels or controls.
- **Don't** fade or slide output in. The printer advances in steps.
