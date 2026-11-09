"use client";

/**
 * `?debug` tuning overlay and wheel-trace recorder (D-14, D-13, UI-SPEC
 * "Debug Overlay"). Loaded only through a dynamic import in PagerProvider.
 * Read-only: it registers the debug sink and renders what it receives; it
 * changes no pager behaviour, threshold or timing (T-04-32). Wheel samples
 * stay on window.__pagerTrace in the trace-file format, capped (T-04-33).
 */
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { setDebugSink, type DebugFrame } from "@/lib/pager/debug";
import { WHEEL_THRESHOLD_PX } from "@/lib/pager/input/wheel";
import { usePagerController, usePagerState } from "./PagerContext";
import styles from "./debug.module.css";

const TRACE_CAP = 600;
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

// Data notation, not copy.
const NONE = "none";
const DASH = "-";
const ARROW = "→";
const DX = "dx";
const DY = "dy";
const V = "v";
const MODE = "mode";
const OPEN = "open";
const SPENT = "spent";
const FULL = "full";
const REDUCED = "reduced";

type WheelSample = NonNullable<DebugFrame["wheel"]>;
type TraceWindow = Window & { __pagerTrace?: WheelSample[] };

function record(frame: DebugFrame): void {
  if (!frame.wheel) return;
  const w = window as TraceWindow;
  w.__pagerTrace = [...(w.__pagerTrace ?? []), frame.wheel].slice(-TRACE_CAP);
}

function wheelText(wheel: DebugFrame["wheel"]): string {
  if (!wheel) return DASH;
  return `${DX} ${wheel.dx} ${DY} ${wheel.dy} ${MODE} ${wheel.mode}`;
}

function swipeText(swipe: DebugFrame["swipe"]): string {
  if (!swipe) return DASH;
  return `${DX} ${Math.round(swipe.dx)} ${V} ${swipe.v.toFixed(2)} ${swipe.lock}`;
}

/** Re-renders when the reduced-motion preference flips (WR-08 live). */
function useReducedMotionTick(): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(REDUCED_QUERY);
    const apply = () => setMatches(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return matches;
}

export function DebugOverlay() {
  const state = usePagerState(0);
  const controller = usePagerController();
  const mediaReduced = useReducedMotionTick();
  const [frame, setFrame] = useState<DebugFrame>({});

  useEffect(() => {
    setDebugSink((next) => {
      record(next);
      setFrame((f) => ({ ...f, ...next }));
    });
    return () => setDebugSink(null);
  }, []);

  const reduced = controller ? controller.isReducedMotion() : mediaReduced;
  const rows: readonly (readonly [string, string])[] = [
    [site.debug.index, `${state.current} ${ARROW} ${state.target}`],
    [site.debug.phase, state.phase],
    [site.debug.source, state.source ?? NONE],
    [site.debug.wheel, wheelText(frame.wheel)],
    [
      site.debug.accum,
      `${Math.round(frame.accum ?? 0)} / ${WHEEL_THRESHOLD_PX}`,
    ],
    [
      site.debug.gesture,
      frame.gesture
        ? `#${frame.gesture.id} ${frame.gesture.open ? OPEN : SPENT}`
        : DASH,
    ],
    [site.debug.edge, frame.edge ?? DASH],
    [site.debug.swipe, swipeText(frame.swipe)],
    [site.debug.motion, reduced ? REDUCED : FULL],
  ];

  return (
    <dl aria-hidden="true" className={`t-label tnum ${styles.overlay}`}>
      {rows.map(([name, value]) => (
        <div key={name} className={styles.row}>
          <dt className="c-dim">{name}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
