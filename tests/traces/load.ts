import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { INITIAL_WHEEL, stepWheel } from "@/lib/pager/input/wheel";
import type { Direction, EdgeInfo } from "@/lib/pager/types";
import { syntheticTraces, type Trace } from "./synthetic";

export type { Trace, TraceSample } from "./synthetic";

/** Viewport height the replays assume for deltaMode 2 (page) events. */
export const REPLAY_VH = 900;

const DEFAULT_EDGE: EdgeInfo = {
  overflowing: false,
  atStart: true,
  atEnd: false,
};

// process.cwd(): jsdom breaks import.meta.url (see tests/css-guard.test.ts).
const TRACE_DIR = join(process.cwd(), "tests/traces");

export function loadJsonTraces(): readonly Trace[] {
  return readdirSync(TRACE_DIR)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => {
      const trace = JSON.parse(
        readFileSync(join(TRACE_DIR, name), "utf8"),
      ) as Trace;
      return { ...trace, device: `${trace.device} [${name}]` };
    });
}

/** Every recorded-style JSON trace (sorted by file name) plus the synthetic ones. */
export function loadTraces(): readonly Trace[] {
  return [...loadJsonTraces(), ...syntheticTraces()];
}

export interface Replay {
  readonly intents: Direction[];
  readonly prevented: boolean[];
}

/** Folds stepWheel over a trace from INITIAL_WHEEL. */
export function replay(
  trace: Pick<Trace, "samples">,
  edgeAt: (i: number) => EdgeInfo = () => DEFAULT_EDGE,
): Replay {
  const intents: Direction[] = [];
  const prevented: boolean[] = [];
  trace.samples.reduce((state, s, i) => {
    const step = stepWheel(
      state,
      {
        dx: s.dx,
        dy: s.dy,
        mode: s.mode,
        t: s.t,
        ctrl: s.ctrl ?? false,
        vh: REPLAY_VH,
        legacy: s.legacy,
      },
      edgeAt(i),
    );
    if (step.intent !== null) intents.push(step.intent);
    prevented.push(step.preventDefault);
    return step.state;
  }, INITIAL_WHEEL);
  return { intents, prevented };
}
