import { slugAt } from "@/lib/sections";
import type { FocusPort } from "@/lib/pager/types";

type PagerFocusOptions = FocusOptions & { focusVisible?: boolean };

/** Focus lands on the page title: preventScroll always, and the ring follows the input source (Pitfalls 10, 11). */
export function createFocusPort(): FocusPort {
  return {
    focusTitle(index, visible) {
      const options: PagerFocusOptions = {
        preventScroll: true,
        focusVisible: visible,
      };
      document.getElementById(`title-${slugAt(index)}`)?.focus(options);
    },
  };
}
