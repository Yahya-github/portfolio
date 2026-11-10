/** Stub pager ports that record every call, in order, into one log (Pitfall 12). */
import type { PagerDeps } from "@/lib/pager/types";

export interface PendingSlide {
  readonly index: number;
  resolve(finished: boolean): void;
}

export interface StubDeps {
  readonly deps: PagerDeps;
  readonly log: string[];
  readonly slides: PendingSlide[];
  readonly clock: { now: number };
}

export function createStubDeps(): StubDeps {
  const log: string[] = [];
  const slides: PendingSlide[] = [];
  const clock = { now: 0 };
  const deps: PagerDeps = {
    animator: {
      slideTo(index, { retarget, reduced }) {
        log.push(
          `animator.slideTo(${index},retarget=${retarget},reduced=${reduced})`,
        );
        return new Promise<boolean>((resolve) => {
          slides.push({ index, resolve });
        });
      },
      settle(index) {
        log.push(`animator.settle(${index})`);
      },
    },
    history: {
      push(index) {
        log.push(`history.push(${index})`);
      },
    },
    focus: {
      focusTitle(index, visible) {
        log.push(`focus.focusTitle(${index},${visible})`);
      },
    },
    scroll: {
      beforeSlide(from, to, fromRest) {
        log.push(`scroll.beforeSlide(${from},${to},${fromRest})`);
      },
      afterLand(index) {
        log.push(`scroll.afterLand(${index})`);
      },
      heldScrollY() {
        return 0;
      },
    },
    commit(fn) {
      log.push("commit");
      fn();
    },
    now: () => clock.now,
  };
  return { deps, log, slides, clock };
}
