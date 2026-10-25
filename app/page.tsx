import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { Wordmark } from "@/components/wordmark"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  HeroPrinter,
  PhotoPrint,
  FinishPicker,
  PrintOnView,
} from "@/components/landing-demo"
import { ASCII_TEMPLATES } from "@/lib/ascii-data"

const TYPED = `+----------------------------+
|  build passing   v2.4.1    |
|  ~/fanfold  $ npm run ship |
+----------------------------+`

const STUDIO_GROUPS = [
  ["Font", "8 monospace families, 8–72 px, line height, letter spacing"],
  ["Colors", "11 presets, custom ink and paper, gradient ink, transparent background"],
  ["Canvas", "Padding up to 128 px, 1× to 4× pixel density"],
  ["Effects", "Glow, scan lines, CRT curve, noise, text shadow"],
  ["Border & frame", "Solid, dashed or double borders; terminal, code editor, polaroid and vintage frames"],
  ["Photo", "Six character sets, brightness, contrast, color, dithering, invert"],
] as const

const SHORTCUTS = [
  ["Command menu", "⌘ K"],
  ["Undo", "⌘ Z"],
  ["Redo", "⇧ ⌘ Z"],
  ["Export", "⌘ S"],
] as const

const OUTPUTS = [
  ["PNG", "Lossless, with an optional transparent background"],
  ["JPEG", "Quality from 10 to 100%"],
  ["WebP", "Small files for the web"],
  ["SVG", "Real text that scales to any size"],
  ["Clipboard", "Copy the image or the raw characters"],
  ["Share link", "The whole piece travels inside the URL"],
] as const

/** Perforated fold between sheets; a page number marks where each sheet ends. */
function Tear({ page }: { page?: number }) {
  return (
    <div aria-hidden="true" className="perforation relative h-px">
      {page && (
        <span className="absolute top-1/2 right-5 -translate-y-1/2 bg-background px-2 font-mono text-[11px] text-form tabular sm:right-8 lg:right-12">
          PAGE {String(page).padStart(4, "0")}
        </span>
      )}
    </div>
  )
}

function Leaders({ rows }: { rows: readonly (readonly [string, string])[] }) {
  return (
    <dl className="divide-y divide-border/70 border-y border-border/70">
      {rows.map(([term, desc]) => (
        <div
          key={term}
          className="grid gap-1 py-3.5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6"
        >
          <dt className="font-medium">{term}</dt>
          <dd className="text-muted-foreground">{desc}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function Home() {
  const rocket = ASCII_TEMPLATES.find((t) => t.name === "Rocket")!.art

  return (
    <div className="min-h-dvh bg-desk">
      <div className="mx-auto grid max-w-[1360px] grid-cols-[14px_minmax(0,1fr)_14px] bg-background shadow-[0_0_0_1px_var(--border)] sm:grid-cols-[32px_minmax(0,1fr)_32px]">
        <div aria-hidden="true" className="tractor border-r border-dashed border-input" />

        <div className="greenbar min-w-0 [--line:24px]">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 bg-background px-5 shadow-[0_1px_0_var(--border)] sm:px-8 lg:px-12">
            <Wordmark />
            <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
              <a
                href="#start"
                className="hidden rounded-sm px-2 py-1 text-sm text-muted-foreground hover:text-foreground md:block"
              >
                How it works
              </a>
              <a
                href="#treatments"
                className="hidden rounded-sm px-2 py-1 text-sm text-muted-foreground hover:text-foreground md:block"
              >
                Effects
              </a>
              <a
                href="#output"
                className="hidden rounded-sm px-2 py-1 text-sm text-muted-foreground hover:text-foreground md:block"
              >
                Export
              </a>
              <ThemeToggle />
              <Button
                nativeButton={false}
                render={<Link href="/studio" />}
                className="ml-1 text-sm"
              >
                Open studio
              </Button>
            </nav>
          </header>
          <Tear />

          <main>
            <HeroPrinter />
            <Tear page={1} />

            {/* Three ways in, printed as a job report */}
            <section
              id="start"
              aria-labelledby="start-title"
              className="scroll-mt-20 px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
            >
              <div className="max-w-2xl">
                <h2
                  id="start-title"
                  className="font-display text-[clamp(1.9rem,3.4vw,3rem)] leading-[1.02]"
                >
                  Three ways to start a print.
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                  Whatever goes in, the studio treats it as characters you can
                  edit, restyle and export.
                </p>
              </div>

              <div className="mt-12 border-t-2 border-foreground">
                {[
                  {
                    title: "Type it",
                    body: "Type or paste anything: box drawings, banners, signatures, logs. Undo and redo keep up with you.",
                    art: (
                      <PrintOnView rows={TYPED.split("\n").length}>
                        <pre className="m-0 font-mono text-[13px] leading-[24px]">
                          {TYPED}
                        </pre>
                      </PrintOnView>
                    ),
                  },
                  {
                    title: "Start from a template",
                    body: `Eight ready pieces: ${ASCII_TEMPLATES.map((t) => t.name.toLowerCase()).join(", ")}.`,
                    art: (
                      <PrintOnView rows={rocket.split("\n").length}>
                        <pre className="m-0 font-mono text-[13px] leading-[24px]">
                          {rocket}
                        </pre>
                      </PrintOnView>
                    ),
                  },
                  {
                    title: "Drop a photo",
                    body: "Drop, paste or pick an image. Choose the columns and character set, then brightness, contrast, color and dithering. This one is set in blocks.",
                    art: (
                      <PrintOnView rows={17}>
                        <PhotoPrint />
                      </PrintOnView>
                    ),
                  },
                ].map((row) => (
                  <article
                    key={row.title}
                    className="grid gap-6 border-b border-border py-10 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-12"
                  >
                    <div className="max-w-md">
                      <h3 className="font-display text-xl">{row.title}</h3>
                      <p className="mt-3 leading-relaxed text-muted-foreground">
                        {row.body}
                      </p>
                    </div>
                    <div className="overflow-x-auto">{row.art}</div>
                  </article>
                ))}
              </div>
            </section>
            <Tear page={2} />

            {/* Treatments */}
            <section
              id="treatments"
              aria-labelledby="treatments-title"
              className="scroll-mt-20 px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
            >
              <div className="grid gap-6 lg:grid-cols-12">
                <h2
                  id="treatments-title"
                  className="font-display text-[clamp(1.9rem,3.4vw,3rem)] leading-[1.02] lg:col-span-6"
                >
                  Try a finish.
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground lg:col-span-5 lg:col-start-8 lg:self-end">
                  This is the export engine running live. Pick a color preset,
                  effects and a frame; the studio has all of these and more.
                </p>
              </div>
              <div className="mt-12">
                <FinishPicker />
              </div>
            </section>
            <Tear page={3} />

            {/* The studio */}
            <section
              aria-labelledby="studio-title"
              className="px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
            >
              <div className="grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <h2
                    id="studio-title"
                    className="font-display text-[clamp(1.9rem,3.4vw,3rem)] leading-[1.02]"
                  >
                    Every control on one screen.
                  </h2>
                  <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                    Text on the left, the print in the middle, settings
                    alongside. The preview redraws as you type.
                  </p>
                  <div className="mt-10">
                    <h3 className="text-sm font-medium">Keyboard</h3>
                    <ul className="mt-3 space-y-2">
                      {SHORTCUTS.map(([label, keys]) => (
                        <li
                          key={label}
                          className="flex items-center justify-between gap-4 text-sm"
                        >
                          <span className="text-muted-foreground">{label}</span>
                          <kbd className="rounded-sm border border-input bg-background px-1.5 py-0.5 font-mono text-xs">
                            {keys}
                          </kbd>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Use Ctrl instead of ⌘ on Windows and Linux.
                    </p>
                  </div>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <Leaders rows={STUDIO_GROUPS} />
                </div>
              </div>
            </section>
            <Tear page={4} />

            {/* Output and privacy */}
            <section
              id="output"
              aria-labelledby="output-title"
              className="scroll-mt-20 px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
            >
              <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-7">
                  <h2
                    id="output-title"
                    className="font-display text-[clamp(1.9rem,3.4vw,3rem)] leading-[1.02]"
                  >
                    Take it anywhere.
                  </h2>
                  <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                    Export at 1×, 2×, 3× or 4× pixel density, sharp enough for a
                    README banner or a poster.
                  </p>
                  <div className="mt-10">
                    <Leaders rows={OUTPUTS} />
                  </div>
                </div>
                <aside className="bg-primary p-8 text-primary-foreground sm:p-10 lg:col-span-4 lg:col-start-9">
                  <h3 className="font-display text-2xl leading-tight">
                    Your photos never leave this tab.
                  </h3>
                  <p className="mt-4 leading-relaxed opacity-90">
                    Conversion runs on your device with the browser&apos;s
                    canvas. Nothing is uploaded. A share link carries the art
                    itself in the part of the URL that is never sent to a
                    server.
                  </p>
                </aside>
              </div>
            </section>
            <Tear page={5} />

            {/* Close */}
            <section className="px-5 py-20 text-center sm:px-8 lg:px-12 lg:py-24">
              <h2 className="font-display mx-auto max-w-3xl text-[clamp(2.2rem,5vw,4.5rem)] leading-[0.98]">
                Feed it a photo.
              </h2>
              <p className="mx-auto mt-5 max-w-md text-lg text-muted-foreground">
                Open the studio and drop in your own.
              </p>
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/studio" />}
                className="mt-9"
              >
                Open the studio
                <ArrowRightIcon className="size-4" />
              </Button>
            </section>
          </main>

          <Tear />
          <footer className="flex flex-col gap-4 bg-background px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
            <Wordmark />
            <p className="font-mono text-xs text-form">
              End of job. Runs in your browser; nothing is uploaded.
            </p>
          </footer>
        </div>

        <div aria-hidden="true" className="tractor border-l border-dashed border-input" />
      </div>
    </div>
  )
}
