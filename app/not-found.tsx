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
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="bg-background shadow-[0_1px_0_var(--border)]">
        <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Wordmark />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1360px] flex-1 flex-col justify-center px-5 py-16 sm:px-8 lg:px-12">
        <div className="@container max-w-xl shrink-0">
          <pre
            aria-hidden="true"
            className="font-mono leading-[1.05] font-bold text-form/60 select-none"
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

      <div aria-hidden="true" className="perforation h-px" />
      <footer className="mx-auto w-full max-w-[1360px] px-5 py-8 font-mono text-xs text-form sm:px-8 lg:px-12">
        End of job.
      </footer>
    </div>
  )
}
