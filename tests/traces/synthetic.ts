/**
 * Deterministic synthetic wheel traces (D-13). No randomness: each generator
 * returns the same samples on every run, so a failing replay is reproducible.
 * Shapes follow RESEARCH Pattern 3: a fast rise, a peak, then an exponential
 * momentum tail (Chrome on macOS) that ends in a run of 1px events.
 */
export interface TraceSample {
  readonly t: number;
  readonly dx: number;
  readonly dy: number;
  readonly mode: 0 | 1 | 2;
  readonly legacy?: number;
  readonly ctrl?: boolean;
}

export interface Trace {
  readonly device: string;
  readonly browser: string;
  readonly os: string;
  readonly samples: readonly TraceSample[];
  readonly expectPages: number;
}

export interface FlickOptions {
  readonly t0?: number;
  readonly peak?: number;
  readonly decay?: number;
  readonly step?: number;
  readonly sign?: 1 | -1;
  readonly axis?: "x" | "y";
}

const RISE = [3, 8, 18, 35, 60] as const;
const TAIL_ONES = 10;
const SECOND_FLICK_DELAY_MS = 400;

const sample = (t: number, value: number, axis: "x" | "y"): TraceSample => ({
  t,
  dx: axis === "x" ? value : 0,
  dy: axis === "y" ? value : 0,
  mode: 0,
});

/** Magnitudes of one flick: rise, peak, exponential tail down to 1, then ten 1s. */
export function flickMagnitudes(peak = 72, decay = 0.93): number[] {
  const out: number[] = [...RISE, peak];
  for (let k = 1; ; k += 1) {
    const v = Math.round(peak * decay ** k);
    if (v <= 1) break;
    out.push(v);
  }
  return [...out, ...Array<number>(TAIL_ONES).fill(1)];
}

/** One Mac trackpad flick with its momentum tail. The peak is sample index 5. */
export function macFlick(options: FlickOptions = {}): Trace {
  const {
    t0 = 1000,
    peak = 72,
    decay = 0.93,
    step = 16,
    sign = 1,
    axis = "y",
  } = options;
  const samples = flickMagnitudes(peak, decay).map((m, i) =>
    sample(t0 + i * step, sign * m, axis),
  );
  return {
    device: `Mac trackpad flick (${axis}, ${sign > 0 ? "next" : "prev"})`,
    browser: "Chrome",
    os: "macOS",
    samples,
    expectPages: 1,
  };
}

/** Two flicks; the second starts 400ms after the first one's peak, inside its tail. */
export function twoFlicks(): Trace {
  const first = macFlick({ t0: 1000 });
  const peakT = first.samples[RISE.length].t;
  const secondT0 = peakT + SECOND_FLICK_DELAY_MS;
  const second = macFlick({ t0: secondT0 });
  return {
    device: "Mac trackpad, two flicks (second inside the first tail)",
    browser: "Chrome",
    os: "macOS",
    samples: [
      ...first.samples.filter((s) => s.t < secondT0),
      ...second.samples,
    ],
    expectPages: 2,
  };
}

/** Linux touchpad: short stroke, no long momentum tail. */
export function linuxTouchpad(t0 = 1000): Trace {
  const values = [4, 9, 14, 18, 20, 18, 14, 10, 6, 4, 2, 1];
  return {
    device: "Linux touchpad stroke",
    browser: "Firefox",
    os: "Linux",
    samples: values.map((v, i) => sample(t0 + i * 12, v, "y")),
    expectPages: 1,
  };
}

export function syntheticTraces(): readonly Trace[] {
  return [
    macFlick(),
    macFlick({ sign: -1 }),
    macFlick({ axis: "x" }),
    twoFlicks(),
    linuxTouchpad(),
  ];
}
