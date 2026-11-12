"use client";

/**
 * Mounts the pager (Phase 4, RESEARCH Patterns 1, 2, 6). Creates the
 * controller with the real DOM ports, wires navigation inputs and projects
 * state onto main[data-phase|data-land] and document.title.
 *
 * The initial index comes from the server prop, never usePathname() (Pattern 2).
 * Ports touch the DOM only when called, so creating them during SSR is safe.
 */
import {
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { sections } from "@/content/site";
import { createWaapiAnimator } from "@/lib/pager/animator";
import { createPagerController } from "@/lib/pager/controller";
import { createFocusPort } from "@/lib/pager/focus";
import {
  createHistoryPort,
  setManualScrollRestoration,
} from "@/lib/pager/history";
import { pageElement } from "@/lib/pager/input/edge";
import { autoloadCursor } from "@/lib/cursor/autoload";
import { decodeImages } from "@/lib/media/decode";
import { createScrollPort } from "@/lib/pager/scroll";
import { PAGER_SELECTORS, type PagerDeps } from "@/lib/pager/types";
import { PagerContext } from "./PagerContext";
import { useFeatures } from "./useFeatures";
import { usePagerInput } from "./usePagerInput";
import { usePagerNavigation } from "./usePagerNavigation";

const query = (selector: string) => (): HTMLElement | null =>
  document.querySelector<HTMLElement>(selector);

function createDomDeps(): PagerDeps {
  return {
    animator: createWaapiAnimator({
      track: query(PAGER_SELECTORS.track),
      bar: query(PAGER_SELECTORS.bar),
    }),
    history: createHistoryPort(),
    focus: createFocusPort(),
    scroll: createScrollPort(),
    commit: (fn) => flushSync(fn),
    now: () => performance.now(),
  };
}

interface PagerProviderProps {
  readonly initial: number;
  readonly children: ReactNode;
}

export function PagerProvider({ initial, children }: PagerProviderProps) {
  const [controller] = useState(() =>
    createPagerController(createDomDeps(), initial),
  );
  usePagerInput(controller);
  usePagerNavigation(controller);
  useFeatures(controller);
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );

  useLayoutEffect(() => {
    const main = document.querySelector<HTMLElement>(PAGER_SELECTORS.track);
    if (!main) return;
    main.dataset.phase = state.phase;
    main.dataset.land = String(state.landId);
  }, [state.phase, state.landId]);

  useLayoutEffect(() => {
    // D-10: the title switches when the slide starts.
    document.title = sections[state.target].title;
  }, [state.target]);

  useEffect(() => {
    setManualScrollRestoration();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => controller.setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [controller]);

  // EXP-03: the cursor chunk loads only for a fine hovering pointer outside forced colours; a failed load keeps the native cursor (WR-07).
  useEffect(() => autoloadCursor(controller.signals), [controller]);

  useEffect(
    () =>
      controller.signals.onSlideStart(({ to }) =>
        decodeImages(pageElement(to)),
      ),
    [controller],
  );

  // D-14: the overlay chunk loads only with ?debug; the query value is never read.
  const [Debug, setDebug] = useState<ComponentType | null>(null);
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("debug")) return;
    let alive = true;
    import("./DebugOverlay")
      .then((m) => {
        if (alive) setDebug(() => m.DebugOverlay);
      })
      .catch(() => {
        // WR-03: the overlay is optional; a failed chunk load is not an error.
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <PagerContext value={controller}>
      {children}
      {Debug ? <Debug /> : null}
    </PagerContext>
  );
}
