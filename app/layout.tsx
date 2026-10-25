import type { Metadata } from "next";
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

const DIRECTION_CONTRACT = `<!--
THESIS: Fanfold is a line printer for ASCII art. Every surface is a continuous green-bar printout; it refuses the neon terminal and the SaaS hero with three cards.
OWN-WORLD: Cool paper white with mint bars every three lines, form-green rulings and line numbers, ribbon-black ink, sprocket-hole margins, perforated tear lines. Archivo expanded for headings, JetBrains Mono for output. Square corners, no gradients as decoration, no glow. Dark: the machine room, sage form ink on carbon.
STORY: The visitor drops a photo, watches it print line by line, tunes columns, then opens the studio to style and export.
FIRST VIEWPORT: Left, a banner-page FANFOLD set in characters, the h1 and two actions. Right, a live printout sheet with sprocket margins that is the drop target, with columns and charset controls under it.
FORM: Greenbar Printout (my pick, grounded list 1 of 7), seed ee87715f. Signature: line-by-line print reveal. Motion: stepped carriage advance.
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
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
