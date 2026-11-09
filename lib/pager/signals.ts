/** Slide-started / landed signals (Phase 4), consumed by the Phase 5 choreography. */
import type { PagerSignals, SlideStartEvent } from "@/lib/pager/types";

export interface SignalHub extends PagerSignals {
  emitSlideStart(event: SlideStartEvent): void;
  emitLanded(index: number): void;
}

interface Channel<T> {
  on(listener: (value: T) => void): () => void;
  emit(value: T): void;
}

function channel<T>(): Channel<T> {
  const listeners = new Set<(value: T) => void>();
  return {
    on(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    emit(value) {
      // Iterate over a copy so listeners added or removed mid-emit are safe.
      for (const listener of [...listeners]) listener(value);
    },
  };
}

export function createSignals(): SignalHub {
  const slideStart = channel<SlideStartEvent>();
  const landed = channel<number>();
  return {
    onSlideStart: slideStart.on,
    onLanded: landed.on,
    emitSlideStart: slideStart.emit,
    emitLanded: landed.emit,
  };
}
