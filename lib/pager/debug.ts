/**
 * Debug event sink for the input layer (D-14, T-04-29). The input hook emits
 * frames of local input numbers; only the `?debug` overlay sets a sink, so
 * without the flag `emitDebug` is a no-op and nothing leaves the page.
 */
export interface DebugFrame {
  readonly wheel?: {
    readonly t: number;
    readonly dx: number;
    readonly dy: number;
    readonly mode: number;
    readonly legacy?: number;
  };
  readonly accum?: number;
  readonly gesture?: { readonly id: number; readonly open: boolean };
  readonly edge?: "top" | "bottom" | "none";
  readonly swipe?: {
    readonly dx: number;
    readonly v: number;
    readonly lock: "none" | "h" | "v";
  };
}

type Sink = (frame: DebugFrame) => void;

let sink: Sink | null = null;

export function setDebugSink(next: Sink | null): void {
  sink = next;
}

export function emitDebug(frame: DebugFrame): void {
  sink?.(frame);
}
