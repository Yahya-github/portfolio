/**
 * Lazy per-page feature loader (Phase 6 D-07, RESEARCH Pattern 1). A page's
 * features load when it is the pager target or a neighbour, once each; a
 * failed chunk stays retryable and leaves the server-rendered state (WR-07).
 */
import { useEffect } from "react";
import {
  FEATURE_LOADERS,
  GLOBAL_FEATURES,
  featureJobs,
} from "@/lib/features/registry";
import type { FeatureJob } from "@/lib/features/types";
import { indexOfSlug, slugAt } from "@/lib/sections";
import type { PagerController } from "@/lib/pager/types";

export function useFeatures(controller: PagerController): void {
  useEffect(() => {
    let alive = true;
    const loaded = new Set<string>();
    const cleanups: Array<() => void> = [];

    const run = (job: FeatureJob, root: HTMLElement | null): void => {
      const load = FEATURE_LOADERS[job.key];
      if (!load || !root) return;
      loaded.add(job.id);
      const ctx = {
        controller,
        slug: job.slug,
        isCurrent: () =>
          controller.getSnapshot().target === indexOfSlug(job.slug),
      };
      load()
        .then((m) => {
          if (alive) cleanups.push(m.mount(root, ctx));
        })
        .catch(() => {
          loaded.delete(job.id);
        });
    };

    const runPage = (target: number): void => {
      for (const job of featureJobs(target, loaded)) {
        run(job, document.getElementById(`page-${job.slug}`));
      }
    };

    const target = controller.getSnapshot().target;
    runPage(target);
    for (const key of GLOBAL_FEATURES) {
      run(
        { key, slug: slugAt(target), id: `${key}:global` },
        document.documentElement,
      );
    }
    const off = controller.signals.onSlideStart(({ to }) => runPage(to));

    return () => {
      alive = false;
      off();
      for (const c of cleanups) c();
    };
  }, [controller]);
}
