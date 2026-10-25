# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Developers making README banners, CLI splash art, and repo headers.
- Designers and creators turning photos into retro graphics, posters, and social posts.
- Hobbyists playing: turning selfies, memes, and text into ASCII for fun.

## Product Purpose

Turn typed text, built-in templates, or photos into styled ASCII art, then export it as a finished image (PNG, JPEG, WebP) or SVG. Success: a visitor goes from a photo or an idea to a downloadable, good-looking piece in under a minute, and comes back to fine-tune it.

## Positioning

- Everything runs in the browser: photos are read locally and never uploaded.
- Export is real typeset output, not a screenshot: 1–4× pixel density and true SVG.
- A share link carries the whole piece (text + settings) in the URL hash; no account, no server.

## Operating Context

Two surfaces: a landing page at `/` where a visitor can drop or paste a photo and watch it convert live, and the studio at `/studio` where the full editor lives. Used on desktop for serious work and on phones for quick conversions.

## Capabilities and Constraints

- Input: typing/pasting ASCII, templates, image import by click, drag-and-drop, or paste; `.txt`/`.asc` import.
- Image conversion: columns, charset ramps (including custom), brightness, contrast, color, dither, invert.
- Styling: font family/size/line height/letter spacing; foreground/background, transparent background, gradient text; padding, scale; glow, scan lines, CRT, noise, text shadow; border styles and frame templates; color theme presets.
- Output: PNG/JPEG (quality)/WebP/SVG download, copy image, copy text, copy share link.
- Workflow: undo/redo, command palette, keyboard shortcuts (⌘K, ⌘Z, ⇧⌘Z, ⌘S).
- Every current feature must be kept. Light and dark modes must both exist. Icons are Phosphor.
- Stack: Next.js 16, React 19, Tailwind v4, shadcn on Base UI, bun.
- Name: **Fanfold** (renamed from ASCIICRAFT on 2026-10-26).
- Undecided: whether the product is and will stay free. Do not claim "free".

## Evidence on Hand

None. No users, testimonials, metrics, press, or pricing exist. Never fabricate them. Demonstrations must be live renders from the real engine (`lib/render-ascii.ts`, `lib/image-to-ascii.ts`).

## Product Principles

1. The output is the hero: every surface shows real rendered ASCII, never a mock of it.
2. Instant first result: a photo in becomes ASCII out with zero setup.
3. Private by construction: nothing leaves the visitor's browser unless they share a link.
4. Depth on demand: casual users get a great result by default; pros find every control.

## Brand Commitments

Name: Fanfold. Visual world: Greenbar Printout (line-printer output on green-bar fanfold paper), chosen 2026-10-26. Code-led builds.

The user rejected these looks, even if polished: hacker/Matrix cliché (neon green on black, glowing terminal edges), generic SaaS (purple gradients, glass cards, centered hero plus three feature boxes), toy-like/childish, and cold corporate.
