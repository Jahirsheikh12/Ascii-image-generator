import Link from "next/link"
import { ArrowRightIcon, ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { Wordmark } from "@/components/wordmark"
import { ThemeToggle } from "@/components/theme-toggle"
import { FinishPicker, HeroPrinter } from "@/components/landing-demo"
import { banner } from "@/lib/banner"

// One measure for every section, so everything shares a left edge
const WRAP = "mx-auto w-full max-w-6xl px-5 sm:px-8"

const STEPS = [
  ["Drop", "Drop, paste or pick a photo. Or type, or start from one of eight templates."],
  ["Style", "Choose a font and colors, then add a frame, glow, scan lines or a CRT curve."],
  ["Export", "Download a PNG, JPEG, WebP or SVG, or copy a link that carries the whole piece."],
] as const

const FORMATS = [
  ["PNG", "Lossless"],
  ["JPEG", "Quality 10–100%"],
  ["WebP", "Small files"],
  ["SVG", "Scales to any size"],
] as const

const NAV = [
  ["How it works", "#how"],
  ["Finishes", "#finishes"],
  ["Export", "#export"],
] as const

/** Thin perforated fold between sections. */
function Tear() {
  return (
    <div className={WRAP}>
      <div aria-hidden="true" className="perforation h-px" />
    </div>
  )
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.02]"
    >
      {children}
    </h2>
  )
}

export default function Home() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 bg-background shadow-[0_1px_0_var(--border)]">
        <div className={`${WRAP} flex h-16 items-center justify-between gap-4`}>
          <Wordmark />
          <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
            {NAV.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="hidden rounded-sm px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground md:block"
              >
                {label}
              </a>
            ))}
            <ThemeToggle />
            <Button
              nativeButton={false}
              render={<Link href="/studio" />}
              className="ml-1 text-sm"
            >
              Open studio
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <div className={WRAP}>
          <HeroPrinter />
        </div>
        <Tear />

        <section
          id="how"
          aria-labelledby="how-title"
          className={`${WRAP} scroll-mt-20 py-20 lg:py-28`}
        >
          <SectionTitle id="how-title">From photo to print in three steps.</SectionTitle>
          <ol className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8 lg:gap-12">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="border-t border-foreground/80 pt-6">
                <span className="font-mono text-xs text-form tabular">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-xl">{title}</h3>
                <p className="mt-2 max-w-[34ch] leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </section>
        <Tear />

        <section
          id="finishes"
          aria-labelledby="finishes-title"
          className={`${WRAP} scroll-mt-20 py-20 lg:py-28`}
        >
          <FinishPicker>
            <SectionTitle id="finishes-title">Try a finish.</SectionTitle>
            <p className="mt-5 max-w-[40ch] text-lg leading-relaxed text-muted-foreground">
              The same print, drawn live by the engine that writes your
              export. Pick a preset; the studio has the rest.
            </p>
          </FinishPicker>
        </section>
        <Tear />

        <section
          id="export"
          aria-labelledby="export-title"
          className={`${WRAP} scroll-mt-20 py-20 lg:py-28`}
        >
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionTitle id="export-title">Take it anywhere.</SectionTitle>
              <p className="mt-5 max-w-[40ch] text-lg leading-relaxed text-muted-foreground">
                Export at 1× to 4× pixel density, copy the image or the
                text, or share a link that carries the whole piece.
              </p>
            </div>
            <div className="lg:col-span-7">
              <ul className="grid grid-cols-2 border-t border-foreground/80 sm:grid-cols-4">
                {FORMATS.map(([name, note]) => (
                  <li key={name} className="border-b border-border/70 py-6 pr-4">
                    <p className="font-display text-2xl">{name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{note}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-8 flex gap-3 leading-relaxed text-muted-foreground">
                <ShieldCheckIcon
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-form"
                />
                <span>
                  <span className="font-medium text-foreground">
                    Your photos never leave this tab.
                  </span>{" "}
                  Conversion runs on your device, and a share link keeps the
                  art in the part of the URL that is never sent to a server.
                </span>
              </p>
            </div>
          </div>
        </section>
        <Tear />

        <section aria-labelledby="close-title" className={`${WRAP} py-20 lg:py-28`}>
          <div className="@container hidden max-w-3xl sm:block">
            <pre
              aria-hidden="true"
              className="font-mono leading-[1.05] font-bold text-form/60 select-none"
              style={{ fontSize: "min(calc(100cqi / 28.6), 22px)" }}
            >
              {banner("FANFOLD")}
            </pre>
          </div>
          <h2
            id="close-title"
            className="font-display text-[clamp(2.25rem,5vw,4rem)] leading-[0.98] sm:mt-10"
          >
            Feed it a photo.
          </h2>
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/studio" />}
            className="mt-8"
          >
            Open the studio
            <ArrowRightIcon className="size-4" />
          </Button>
        </section>
      </main>

      <footer className="shadow-[0_-1px_0_var(--border)]">
        <div className={`${WRAP} flex items-center justify-between gap-4 py-8`}>
          <Wordmark />
          <Link
            href="/studio"
            className="rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Studio
          </Link>
        </div>
      </footer>
    </div>
  )
}
