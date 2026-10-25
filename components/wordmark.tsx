import Link from "next/link"
import { cn } from "@/lib/utils"

/** Folded continuous-form paper: three panels, sprocket holes on the edges. */
function FanfoldGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-5", className)}
    >
      <path d="M4 3h16l-3 6H7z" className="fill-bar stroke-form" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 9h10l3 6H4z" className="fill-background stroke-form" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 15h16l-3 6H7z" className="fill-bar stroke-form" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 12h6M9 18h6M9 6h6" className="stroke-foreground" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 rounded-sm text-foreground",
        className
      )}
    >
      <FanfoldGlyph />
      <span className="font-display text-sm leading-none tracking-tight">
        Fanfold
      </span>
    </Link>
  )
}
