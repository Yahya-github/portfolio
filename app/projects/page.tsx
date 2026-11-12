import type { Metadata } from "next";
import { Shell } from "@/components/shell/Shell";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("projects");

export default function Page() {
  return <Shell current="projects" />;
}
