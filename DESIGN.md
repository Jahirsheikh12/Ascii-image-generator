---
name: Fanfold
description: A line printer for ASCII art. Every surface is a continuous green-bar printout.
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
  desk: "oklch(0.875 0.012 150)"
  destructive: "oklch(0.53 0.19 27)"
  dark-paper: "oklch(0.19 0.012 155)"
  dark-ink: "oklch(0.93 0.012 140)"
  dark-primary: "oklch(0.8 0.1 152)"
  dark-form-green: "oklch(0.74 0.08 152)"
  dark-bar: "oklch(0.235 0.026 152)"
  dark-housing: "oklch(0.16 0.01 155)"
  dark-desk: "oklch(0.135 0.008 155)"
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
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 125"
  title:
    fontFamily: "Archivo, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
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
  section: "80px"
  section-lg: "112px"
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

**Creative North Star: "The Continuous Printout"**

Fanfold renders every surface as a sheet of line-printer output on green-bar fanfold paper. The page itself is the paper: a cool white strip with mint bands every three printed lines, sprocket-hole tractor margins down both edges, and perforated tear lines between sections that carry a page counter. The page sits on a darker desk tone, so the paper reads as an object you could tear off. Ink is near-black with a green cast. Form furniture (line numbers, readouts, captions, page counters) is printed in form green, the colour the paper mill printed on before the job ran.

Density follows the source: wide-set headings like the pre-printed form header, then mono output set on a strict line grid. The studio is the same paper inside an operator console. The text editor is green-bar paper with a line-number gutter, the preview sits in the printer housing, and settings are printed on plain card stock. Dark mode is the machine room after hours: sage form ink on carbon paper, darker housing, the same bars at low contrast.

The world rejects the neon terminal (green-on-black glow, glowing edges) and the generic SaaS page (purple gradients, glass cards, a centred hero over three feature boxes). Depth comes from paper on desk, never from light effects.

**Key Characteristics:**
- Green-bar paper as the base surface: three-line mint bands keyed to a `--line` unit.
- Tractor-feed sprocket margins and perforated tear lines carry the structure.
- Form green for every machine-printed annotation: line numbers, counters, readouts.
- Wide (125% width) heavy Archivo for headings; JetBrains Mono for anything printed.
- Square corners on buttons and sheets; near-square hairline corners on small controls.
- Motion is a stepped carriage advance: output appears row by row, never fades in.

## Colors

One green family: hue 145 to 155 runs through paper, ink, bars, form and accent, with a single red reserved for destructive actions.

### Primary
- **Form Press Green** (primary): filled actions, selected chips, the active slider range, the switch track, the privacy panel, the drag-target ring. Lighter in dark mode (dark-primary) so it reads as sage ink on carbon.
- **Form Ink** (form-green): the colour of pre-printed form furniture. Line-number gutters (at 75 to 80% opacity), numeric readouts, page counters, captions under prints, section icons in the studio settings, the wordmark glyph strokes. Its job is to annotate, not to act.

### Secondary
- **Mint Bar** (mint-bar): the green-bar band. Only ever drawn by the greenbar pattern and the wordmark glyph fills, never as a flat panel fill.
- **Pale Mint Wash** (secondary): hover fill on dashed drop zones and secondary buttons.

### Neutral
- **Cool Paper** (paper): the base page and sheet surface; the backing behind labels on tear lines.
- **Ribbon Ink** (ink): all body text and printed ASCII output, plus the 2px top rule on the job-report list.
- **Card Stock** (card-paper): the studio header and settings panel.
- **Muted Ink** (muted-foreground): supporting copy, nav links, field labels.
- **Ruling** (border) and **Field Edge** (input): hairline dividers and ring outlines (border); control strokes, the dashed tractor edge and the scrollbar thumb (input).
- **Printer Housing** (housing): the preview stage and the frame behind rendered canvases.
- **Desk** (desk): what surrounds the paper. It shows through the sprocket holes and behind the landing sheet.
- **Fault Red** (destructive): destructive actions and invalid states only.

### Named Rules
**The Form Ink Rule.** Anything a machine would print onto the form (line numbers, counts, dimensions, page labels, captions) is form green in mono with tabular figures. Content the user made is ribbon ink. Never swap them.

**The Bars Are Paper Rule.** Mint appears only as green-bar banding inside the pattern, keyed to the text's own line height. A mint block used as a card background breaks the paper.

## Typography

**Display Font:** Archivo at 125% width, weight 800 (with sans-serif fallback)
**Body Font:** Archivo at normal width (with sans-serif fallback)
**Label/Mono Font:** JetBrains Mono

**Character:** the expanded heavy Archivo is the pre-printed form header, broad and mechanical. JetBrains Mono is the print head: every character cell is 0.6em wide on a 1.2em line, so it locks to the green-bar grid.

### Hierarchy
- **Display** (800, 125% width, clamp(2.5rem, 4.6vw, 4.1rem), 0.98): the single h1 on the landing page. The closing call to action steps it up to clamp(2.2rem, 5vw, 4.5rem).
- **Headline** (800, 125% width, clamp(1.9rem, 3.4vw, 3rem), 1.02): section headings on the landing page, which are short declaratives ending in a full stop.
- **Title** (800, 125% width, 1.25 to 1.5rem): row titles in the job report, the privacy panel heading, the "Release to print" overlay.
- **Body** (400, 1.125rem, 1.625): lead paragraphs in muted ink, capped near 44ch in the hero and xl width in sections.
- **Label** (500, 0.875rem): nav links, field legends, list terms. Studio controls drop to 0.75rem.
- **Printout** (JetBrains Mono, 1.2 line height, ligatures off): all ASCII output and the editor. Size is computed from columns so the sheet always fits.
- **Readout** (JetBrains Mono, 10 to 12px, tabular figures, form green): values, dimensions, page counters.

### Named Rules
**The Wide Header Rule.** Only headings use the 125% width display cut. Body, labels and controls stay at normal width.

**The Line Grid Rule.** Mono output always sits at 1.2 line height, and any green-bar behind it sets `--line` to that same line height (1.2em, 20px in the editor, 24px on the landing page). Bars and text must stay in phase.

## Layout

The landing page is one sheet: a centred column at most 1360px wide, flanked by tractor margins (14px on mobile, 32px from sm), set on the desk tone with a 1px ruling outline. Inside it, content keeps a horizontal gutter of 20, 32 or 48px (base, sm, lg) and section padding of 80px, rising to 112px at lg. Sections are separated by full-width perforated tear lines, numbered PAGE 0001 onward at the right. Composition is a 12-column grid at lg with asymmetric spans (5/7 in the hero, 4/7 and 7/4 elsewhere). The banner page (FANFOLD set in its own letters, in ribbon ink) spans the full width above the hero grid.

The landing page lays repeating content out as a job report: full-width rows split 4/8, divided by rulings under a 2px ink top rule. Specs are leader lists, a term column 11rem wide beside its description. Neither uses cards.

The studio is a full-height console: a 48px header, then three panes (text at 28%, preview, settings at 300px) with resizable dividers that turn primary on hover. On mobile it switches to tabs (Text, Preview, Style). Toolbars are 44px tall. Controls are 32px tall.

## Elevation & Depth

Depth is physical: paper on a desk. The system is flat and tonal (paper, card, housing, desk) and adds shadow only where a sheet lifts off the surface beneath it. There is no glow and no coloured shadow. The shadow colour is a tokenised green-black, much heavier in dark mode.

### Shadow Vocabulary
- **Sheet lift** (`box-shadow: 0 1px 0 var(--border), 0 24px 48px -28px var(--shadow)`): the live printout sheet on the landing hero.
- **Drop sheet** (`box-shadow: 0 24px 60px -30px var(--shadow)`): the studio drag-and-drop sheet.
- **Print on stage** (`filter: drop-shadow(0 18px 28px var(--shadow))`): the rendered canvas in the preview housing.
- **Paper edge** (`box-shadow: 0 0 0 1px var(--border)`): the outline of the landing page sheet against the desk.

### Named Rules
**The Paper Lift Rule.** A shadow means paper resting above the housing or desk. It is soft, it falls downward, and it uses a negative spread. Buttons, chips, panels and controls never cast one.

## Shapes

Corners are square. Buttons, sheets, tabs, slider tracks, panels and the privacy block use 0 radius. Small hand controls (choice chips, text and hex inputs, kbd keys, nav link hit areas) take a hairline 1.8px corner, the switch takes 3px, and its thumb and the slider thumb take 2px. Nothing is pill-shaped. Edges are rulings: 1px rings in the border tone, dashed field-edge lines where the tractor strip meets the paper and on drop zones, and the perforation, which is 6px dashes with 4px gaps at 55% form green. The sprocket hole is a 9px desk-coloured circle with a 1px rim, repeating every 24px.

## Components

### Buttons
Blunt, form-press buttons: flat fills, square corners, no lift.
- **Shape:** square (0px).
- **Primary:** form-press green fill with paper text, 32px tall with 10px padding at 0.75rem medium. The large size is 40px tall with 16px padding at 0.875rem. A trailing arrow icon marks forward navigation.
- **Hover / Focus:** the fill drops to 88% (80% when pressed). Focus shows a 2px ring-colour outline with a 2px offset.
- **Outline:** paper fill with a ruling stroke, filling muted on hover. Used for the secondary action beside a primary.
- **Ghost:** no fill until hover (muted). Used for toolbar icons and the theme toggle (28px square).

### Chips
- **Style:** 32px choice buttons in a row or grid, hairline corners, field-edge stroke on paper, muted ink.
- **State:** hover turns the stroke primary and the text to ink. Selected is a solid primary fill with paper text and `aria-pressed`. Used for charset, export format and other one-of choices.

### Cards / Containers
- **Corner Style:** square.
- **Background:** paper for sheets, housing for render frames, card stock for the studio settings.
- **Shadow Strategy:** none, except for the sheet lifts in Elevation.
- **Border:** a 1px ruling ring.
- **Internal Padding:** 12 to 16px around rendered canvases. The privacy panel uses 32 to 40px.

### Inputs / Fields
- **Style:** 32px tall, hairline corners, field-edge stroke, paper fill, mono 0.75rem text (hex values in uppercase).
- **Focus:** the stroke shifts to the ring colour.
- **Sliders:** a 4px square track in muted with a primary range, and a 14px square thumb (2px corner) with a primary border on paper. The value prints above the right end as a form-green readout.
- **Switch:** 32 by 18px, 3px corner, field-edge track that turns primary when on.

### Navigation
The landing header is 64px tall on paper: the wordmark on the left, then muted 0.875rem text links that turn ink on hover (hidden below md), the theme toggle, and a primary "Open studio" button. A tear line sits under it. The studio header is 48px on card stock with a ruling underneath: wordmark, a 1px divider, the current file name in muted ink, then ghost actions including a Commands button with a kbd hint. On mobile, the studio uses bottom tabs. Tabs elsewhere use a square muted track, and the line variant has a 2px primary underline.

### Greenbar Sheet (signature)
A printout surface: tractor strip, then green-bar paper, then tractor strip. A form-green line-number gutter runs down the left of the paper, and a mono caption above the sheet gives the file name and `columns × rows · charset`. On the landing page the whole sheet is the drop target: dragging a file adds a 2px primary ring and a "Release to print" overlay in title type. The studio editor reuses it as a textarea with a scroll-synced line gutter divided off by a dashed edge.

### Print Reveal (signature motion)
New output is uncovered top to bottom by a clip-path wipe that advances in `steps(rows)`, one step per printed row, over about 0.045s per row and at most 1.8s. It replays whenever the source, charset, invert setting or theme changes. When reduced motion is requested, the reveal is skipped entirely.

## Do's and Don'ts

### Do:
- **Do** set every printed surface on green-bar paper with `--line` equal to the text's line height, so a band always spans three printed lines.
- **Do** print machine annotations (line numbers, counts, sizes, page labels) in form-green JetBrains Mono with tabular figures.
- **Do** separate major sections with a perforated tear line, numbered PAGE 000N where it ends a page.
- **Do** keep buttons and sheets square (0px), and keep small controls at 3px or less.
- **Do** show real rendered output from the engine on every surface. Never show a picture of ASCII.
- **Do** reveal new output with the stepped, row-by-row print reveal, and drop it under reduced motion.
- **Do** keep both modes: paper on desk in light, sage form ink on carbon in dark.

### Don't:
- **Don't** add glow, neon green-on-black, or glowing edges to the interface. The neon terminal is a rejected look.
- **Don't** use purple gradients, glass cards, or a centred hero above three feature boxes.
- **Don't** use gradients as decoration. Gradients are allowed only where they are the paper's own mechanism: the green-bar bands, sprocket holes, perforation and transparency checkerboard.
- **Don't** give buttons, chips or panels a shadow. Shadows belong to paper lifting off the desk.
- **Don't** fill a card or panel with mint-bar colour. Mint exists only as banding.
- **Don't** use the wide display cut for body text, labels or controls.
- **Don't** fade or slide output in. The printer advances in steps.
