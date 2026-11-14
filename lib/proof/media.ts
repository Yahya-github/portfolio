import type { ProofMediaKey } from "@/content/types";
import { media } from "@/lib/media/manifest";
import type { MediaVariant } from "@/lib/media/types";

/** Looks a proof picture up in the manifest; fails the build if it is not registered. */
export function proofMedia(key: ProofMediaKey): readonly MediaVariant[] {
  const found = (
    media as Readonly<Record<string, readonly MediaVariant[] | undefined>>
  )[key];
  if (!found) throw new Error(`Proof media not in manifest: ${key}`);
  return found;
}
