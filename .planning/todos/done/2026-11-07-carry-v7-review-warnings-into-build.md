---
created: 2026-11-07
source: .planning/phases/01-design-gate/01-REVIEW.md
phases: [3, 4, 5]
---

# Carry v7 sketch review warnings into the build

The approved v7 sketch is a reference, not code to copy. Its review found behaviours the real build must not repeat:

- WR-04 (Phase 4, usePager): Space must not page while a button or link has focus.
- WR-05 (Phase 5, cursor): one pointer-position state; "no pointer yet" must not become (0, 0).
- WR-06 (Phase 4): on page change, move focus into the new page (or its heading) when focus was in the old one.
- WR-07 (Phase 5): hide the native cursor only after the custom cursor is running (class set by script), never from first paint.
- WR-08 (Phases 4-5): listen to prefers-reduced-motion changes live, not once at load.
- IN-01 (Phase 4): reset the wheel accumulator after the idle gap between gestures.

Also use `--yahya-fit` 2.188 with the manual Y-A kerning rule (design doc), not 2.155.

Closed in Phase 5 (2026-11-10): WR-05 (plan 08, nullable pointer position), WR-07 (plan 01 CSS rule plus plan 08 script-set attribute), and the --yahya-fit 2.188 / YA kern check (letters.module.css untouched).
