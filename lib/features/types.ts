/** Feature module contracts (Phase 6, D-07): React-free modules mounted lazily per page. */
import type { Slug } from "@/content/types";
import type { PagerController } from "@/lib/pager/types";

export type FeatureKey =
  "previews" | "walkthrough" | "toggles" | "copy-email" | "motion";

export interface FeatureContext {
  readonly controller: PagerController;
  readonly slug: Slug;
  isCurrent(): boolean;
}

export type FeatureMount = (
  root: HTMLElement,
  ctx: FeatureContext,
) => () => void;

export interface FeatureModule {
  readonly mount: FeatureMount;
}

/** id = `${key}:${slug}` */
export interface FeatureJob {
  readonly key: FeatureKey;
  readonly slug: Slug;
  readonly id: string;
}
