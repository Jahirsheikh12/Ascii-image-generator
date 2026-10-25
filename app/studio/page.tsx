import type { Metadata } from "next"
import AsciiGenerator from "@/components/ascii-generator"

export const metadata: Metadata = {
  title: "Studio",
}

export default function Studio() {
  return <AsciiGenerator />
}
