import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: {
    default: "Fanfold · Print any photo as ASCII art",
    template: "%s · Fanfold",
  },
  description:
    "Turn photos, text and templates into ASCII art right in your browser. Style it, then export PNG, JPEG, WebP or SVG, or share a link.",
};

// "cover" lets the studio's bottom tabs sit above the home indicator
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8faf6" },
    { media: "(prefers-color-scheme: dark)", color: "#151b17" },
  ],
};

const DIRECTION_CONTRACT = `<!--
THESIS: Fanfold is a line printer for ASCII art, shown on clean paper: the print itself is the only texture. It refuses the neon terminal and the SaaS hero with three cards.
OWN-WORLD: Plain cool paper (carbon in dark), ink type, form-green line numbers and readouts, thin perforated tear lines between sections. Archivo expanded for headings, JetBrains Mono for output. Square corners; no stripes, no gradients as decoration, no glow.
STORY: The visitor drops a photo, watches it print line by line, tunes columns, then opens the studio to style and export.
FIRST VIEWPORT: A full-width banner-page FANFOLD in muted form ink, then the h1 and two actions on the left and a clean printout card with line numbers on the right that is the drop target, with columns and charset controls under it.
FORM: Greenbar Printout (my pick, grounded list 1 of 7), seed ee87715f; refined 2026-10-26 at user request: stripes and sprocket margins removed. Signature: line-by-line print reveal. Motion: stepped carriage advance.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(jetbrainsMono.variable, archivo.variable)}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* On phones, lift toasts above the studio's bottom tab bar */}
          <Toaster
            position="bottom-right"
            mobileOffset={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
