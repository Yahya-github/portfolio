import { useEffect, type RefObject } from "react";
import { usePagerController } from "@/components/shell/PagerContext";
import { createGlide } from "@/lib/letters/glide";

/** Drives the letter glide (Phase 5, LTR-03, D-11..D-15) from pager signals; resize and reduced motion snap it to rest. */
export function useGlide(navRef: RefObject<HTMLElement | null>): void {
  const controller = usePagerController();
  useEffect(() => {
    const nav = navRef.current;
    if (!controller || !nav) return;
    const glide = createGlide({
      nav,
      isReduced: () => controller.isReducedMotion(),
    });
    const offStart = controller.signals.onSlideStart((e) =>
      glide.start({
        to: e.to,
        retarget: controller.getSnapshot().retarget,
        heldScrollY: 0,
      }),
    );
    const snap = () => glide.snapToRest();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => {
      if (mq.matches) glide.snapToRest();
    };
    window.addEventListener("resize", snap, { passive: true });
    window.addEventListener("orientationchange", snap, { passive: true });
    mq.addEventListener("change", onMotion);
    return () => {
      offStart();
      window.removeEventListener("resize", snap);
      window.removeEventListener("orientationchange", snap);
      mq.removeEventListener("change", onMotion);
      glide.destroy();
    };
  }, [controller, navRef]);
}
