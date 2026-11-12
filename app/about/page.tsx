import type { Metadata } from "next";
import { Shell } from "@/components/shell/Shell";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("about");

export default function Page() {
  return <Shell current="about" />;
}
