import type { Metadata } from "next";
import { Shell } from "@/components/shell/Shell";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("index");

export default function Page() {
  return <Shell current="index" />;
}
