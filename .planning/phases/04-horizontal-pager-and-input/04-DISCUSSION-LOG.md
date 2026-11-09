# Phase 4: Horizontal Pager and Input - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-09
**Phase:** 04-horizontal-pager-and-input
**Areas discussed:** Paging feel, Overflow & edges, Chrome before Phase 5, Device testing

---

## Todos

| Option | Description | Selected |
|--------|-------------|----------|
| v7 review warnings | Phase 4 parts: WR-04, WR-06, WR-08, IN-01 | ✓ |
| Label letter gaps | Fix inner-word gaps in uppercase labels, regenerate baselines | ✓ |

**User's choice:** both folded.

---

## Paging feel

| Option | Description | Selected |
|--------|-------------|----------|
| Retarget | Second press mid-slide extends to page +2 from the current position | ✓ |
| Ignore until landed | Input during the slide dropped | |
| Queue one | One extra step queued, run after landing | |

| Option | Description | Selected |
|--------|-------------|----------|
| Hard stop | Nothing moves at 00 / 05 | ✓ |
| Small nudge | ~24px push and snap back | |
| Wrap around | 05 → 00 and 00 → 05 | |

| Option | Description | Selected |
|--------|-------------|----------|
| Slide through, same 600ms | Track crosses intermediate pages in one 600ms move | ✓ |
| Slide through, longer | Duration grows with distance | |
| Direct | Only from/to pages move | |

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, both axes | Vertical and horizontal wheel deltas page; dominant axis wins | ✓ |
| Vertical only | Only up/down pages | |

**Notes:** horizontal wheel needs the macOS back-swipe suppressed (overscroll-behavior-x).

---

## Overflow & edges

| Option | Description | Selected |
|--------|-------------|----------|
| Fresh gesture at edge | Momentum reaching the edge is spent; a new gesture pages | ✓ |
| Edge + extra push | Overscroll past a threshold pages | |
| Immediately | Same gesture continues into a page change | |

| Option | Description | Selected |
|--------|-------------|----------|
| Top, always | Every page opens at its top | ✓ |
| Bottom when going back | Backwards lands at the bottom | |
| Where you left it | Remember scroll position | |

| Option | Description | Selected |
|--------|-------------|----------|
| Never, swipe only | Vertical reads, horizontal swipe pages | ✓ |
| Pull at bottom too | Overscroll at bottom also pages | |

| Option | Description | Selected |
|--------|-------------|----------|
| You decide | Claude picks swipe thresholds, tuned on devices | ✓ |
| Track follows finger | Page drags with the finger, snaps on release | |
| Flick only | Nothing moves during the swipe; slide on release | |

---

## Chrome before Phase 5

| Option | Description | Selected |
|--------|-------------|----------|
| Slide away + rail appears | Giant letters ride off with Index; rail appears on landing | ✓ |
| Rail always visible | Rail on every page incl. Index during Phase 4 | |

| Option | Description | Selected |
|--------|-------------|----------|
| At slide start | Header, counter, Next, rail accent switch immediately | ✓ |
| On landing | Switch when the track stops | |

| Option | Description | Selected |
|--------|-------------|----------|
| Animate now with the track | Progress bar 600ms, same easing | ✓ |
| Jump instantly | Animation waits for Phase 5 | |

---

## Device testing

| Option | Description | Selected |
|--------|-------------|----------|
| Linux touchpad | Fedora laptop | ✓ |
| iPhone | Safari + LinkedIn in-app | ✓ |
| Android phone | Chrome on Android | ✓ |
| Mac trackpad / Magic Mouse | Borrowed or owned Mac | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| Traces stand in | Recorded traces for unreachable devices; gap noted | ✓ |
| Block until tested | Every named device tested by hand | |
| Drop from criteria | Rewrite criterion 1 | |

| Option | Description | Selected |
|--------|-------------|----------|
| Vercel preview + checklist | PR preview URL, per-device checklist, ?debug overlay | ✓ |
| Local network dev server | Test over Wi-Fi | |

---

## Claude's Discretion

- History entry coalescing, Back/Forward sliding, document.title
- Keys on overflowing pages (scroll first, page at edge)
- Focus ring visibility after non-keyboard paging
- Track easing, wheel thresholds and timings, swipe thresholds
- Phase 4 reduced-motion behaviour for the track
- Code structure within the research architecture

## Deferred Ideas

- Real Windows-wheel hand test when a Windows machine is available
