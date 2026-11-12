import { useEffect, type RefObject } from "react";
import { usePagerController } from "@/components/shell/PagerContext";
import { createOpening } from "@/lib/first-visit/opening";
import { createGlide } from "@/lib/letters/glide";

/** Drives the letter glide (Phase 5, LTR-03, D-11..D-15) and the opening (EXP-01) from pager signals; resize and reduced motion snap them to rest. */
export function useGlide(navRef: RefObject<HTMLElement | null>): void {
  const controller = usePagerController();
  useEffect(() => {
    const nav = navRef.current;
    if (!controller || !nav) return;
    const opening = createOpening({
      nav,
      isReduced: () => controller.isReducedMotion(),
    });
    const glide = createGlide({
      nav,
      isReduced: () => controller.isReducedMotion(),
      intercept: (s) => opening.interceptArrival(s),
    });
    const offStart = controller.signals.onSlideStart((e) =>
      glide.start({
        to: e.to,
        retarget: controller.getSnapshot().retarget,
        heldScrollY: e.heldScrollY,
      }),
    );
    opening.claim();
    const snap = () => {
      opening.finish();
      glide.snapToRest();
    };
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => {
      if (mq.matches) {
        opening.finish();
        glide.snapToRest();
      }
    };
    window.addEventListener("resize", snap, { passive: true });
    window.addEventListener("orientationchange", snap, { passive: true });
    mq.addEventListener("change", onMotion);
    return () => {
      offStart();
      window.removeEventListener("resize", snap);
      window.removeEventListener("orientationchange", snap);
      mq.removeEventListener("change", onMotion);
      opening.destroy();
      glide.destroy();
    };
  }, [controller, navRef]);
}
