/**
 * Lazy feature registry (D-07, RESEARCH Pattern 1). Keep string-literal
 * import() so Turbopack splits each feature into its own chunk (T-06-10).
 */
import type { Slug } from "@/content/types";
import { sections } from "@/content/site";
import { slugAt } from "@/lib/sections";
import type { FeatureJob, FeatureKey, FeatureModule } from "./types";

export const FEATURE_LOADERS: Readonly<
  Partial<Record<FeatureKey, () => Promise<FeatureModule>>>
> = {
  previews: () => import("@/lib/previews/mount"),
  walkthrough: () => import("@/lib/walkthrough/mount"),
  toggles: () => import("@/lib/toggles/mount"),
  "copy-email": () => import("@/lib/copy-email/mount"),
};

export const PAGE_FEATURES: Readonly<Record<Slug, readonly FeatureKey[]>> = {
  index: [],
  achievements: ["previews"],
  projects: ["walkthrough", "previews", "toggles"],
  experience: ["toggles"],
  about: ["toggles"],
  "say-hi": ["copy-email"],
};

/** Mounted once on load with root = document.documentElement (plan 06-15 adds "motion"). */
export const GLOBAL_FEATURES: readonly FeatureKey[] = [];

/** Slugs of target-1..target+1, clamped to the sections. */
export function neighbourSlugs(target: number): readonly Slug[] {
  const out: Slug[] = [];
  for (let i = target - 1; i <= target + 1; i++) {
    if (i >= 0 && i < sections.length) out.push(slugAt(i));
  }
  return out;
}

export function featureJobs(
  target: number,
  loaded: ReadonlySet<string>,
): readonly FeatureJob[] {
  const jobs: FeatureJob[] = [];
  for (const slug of neighbourSlugs(target)) {
    for (const key of PAGE_FEATURES[slug]) {
      const id = `${key}:${slug}`;
      if (FEATURE_LOADERS[key] && !loaded.has(id)) jobs.push({ key, slug, id });
    }
  }
  return jobs;
}
