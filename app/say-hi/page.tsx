import type { Metadata } from "next";
import { Shell } from "@/components/shell/Shell";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("say-hi");

export default function Page() {
  return <Shell current="say-hi" />;
}
