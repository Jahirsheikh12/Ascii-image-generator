import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Wordmark } from "@/components/wordmark"
import { ThemeToggle } from "@/components/theme-toggle"
import { banner } from "@/lib/banner"

export const metadata: Metadata = {
  title: "Page not found",
}

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-desk">
      <div className="mx-auto grid min-h-dvh max-w-[1360px] grid-cols-[14px_minmax(0,1fr)_14px] bg-background shadow-[0_0_0_1px_var(--border)] sm:grid-cols-[32px_minmax(0,1fr)_32px]">
        <div aria-hidden="true" className="tractor border-r border-dashed border-input" />

        <div className="greenbar flex min-w-0 flex-col [--line:24px]">
          <header className="flex h-16 items-center justify-between bg-background px-5 shadow-[0_1px_0_var(--border)] sm:px-8 lg:px-12">
            <Wordmark />
            <ThemeToggle />
          </header>

          <main className="flex flex-1 flex-col justify-center px-5 py-16 sm:px-8 lg:px-12">
            <div className="@container max-w-xl shrink-0">
              <pre
                aria-hidden="true"
                className="font-mono leading-[1.05] font-bold select-none"
                style={{ fontSize: "min(calc(100cqi / 10.2), 40px)" }}
              >
                {banner("404")}
              </pre>
            </div>
            <h1 className="mt-10 font-display text-[clamp(1.9rem,3.4vw,3rem)] leading-[1.02]">
              This page isn&apos;t on the printout.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              The link may be old or mistyped. Start a new print instead.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" nativeButton={false} render={<Link href="/studio" />}>
                Open the studio
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/" />}
              >
                Back to home
              </Button>
            </div>
          </main>

          <footer className="bg-background px-5 py-8 font-mono text-xs text-form sm:px-8 lg:px-12">
            End of job.
          </footer>
        </div>

        <div aria-hidden="true" className="tractor border-l border-dashed border-input" />
      </div>
    </div>
  )
}
