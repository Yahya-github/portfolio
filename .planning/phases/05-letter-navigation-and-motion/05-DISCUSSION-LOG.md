# Phase 5: Letter Navigation and Motion - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-09
**Phase:** 05-letter-navigation-and-motion
**Areas discussed:** Opening animation, First-visit hint, Letter glide choreography, Cursor and rail labels

---

## Opening animation

| Option | Description | Selected |
|--------|-------------|----------|
| Letters slide in | Five YAHYA letters slide in horizontally with 30ms stagger, land in hero spots, then chrome appears | ✓ |
| Ink curtain wipe | White panel sweeps left to right revealing the Index | |
| Grid lines draw in | 12 column hairlines draw, then letters land between them | |

**User's choice:** Letters slide in.

| Option | Description | Selected |
|--------|-------------|----------|
| Index only | Plays only when the first view is `/`; deep links show content at once | ✓ |
| Any first entry | Plays on whichever route is first | |

**User's choice:** Index only.

| Option | Description | Selected |
|--------|-------------|----------|
| localStorage, forever | One key; safe if storage throws | ✓ |
| sessionStorage | Replays each new browser session | |
| Cookie with expiry | Replays after ~30 days | |

**User's choice:** localStorage, forever.

| Option | Description | Selected |
|--------|-------------|----------|
| Hide until script runs | Inline script sets a class before first paint only when flag unset; JS off = no opening | ✓ |
| Cover layer on top | Server HTML always has a black cover removed by JS | |

**User's choice:** Hide until script runs.

| Option | Description | Selected |
|--------|-------------|----------|
| No, never after a deep link | Any first landing marks it seen | |
| Yes, on first Index view | Deep link does not set the flag; plays instead of the glide that one time | ✓ |
| Only on a fresh load of / | Paging back never replays | |

**User's choice:** Yes, on first Index view.

| Option | Description | Selected |
|--------|-------------|----------|
| Click, tap, any key except Tab | Skip consumes the input | ✓ |
| Any input incl. wheel and swipe | Wheel/swipe also skip | |

**User's choice:** Click, tap, any key except Tab.

---

## First-visit hint

| Option | Description | Selected |
|--------|-------------|----------|
| Footer label + Next nudge | Short Label line near Next; Next arrow shifts a few px | ✓ |
| Page peek | Track nudges ~24px and returns once | |
| Edge sliver | 4px strip of the next page at the right edge | |

**User's choice:** Footer label + Next nudge.

| Option | Description | Selected |
|--------|-------------|----------|
| First page change or 8 seconds | Never reappears (own flag) | ✓ |
| First page change only | Stays until paged | |
| Fixed 5 seconds | Always disappears after 5s | |

**User's choice:** First page change or 8 seconds.

| Option | Description | Selected |
|--------|-------------|----------|
| Per-device text | Fine pointer: "Scroll or use the arrow keys"; touch: "Swipe sideways" | ✓ |
| One neutral line | "Pages move sideways" everywhere | |
| Let me type the wording | User supplies exact wording | |

**User's choice:** Per-device text.

| Option | Description | Selected |
|--------|-------------|----------|
| After opening, every route | ~1s after opening ends/skipped, ~1.5s after load otherwise | ✓ |
| Index only | Deep-link visitors never see it | |

**User's choice:** After opening, every route.

---

## Letter glide choreography

| Option | Description | Selected |
|--------|-------------|----------|
| Horizontal leads | X on page easing for full 600ms; Y and shrink finish ~100ms later, gentler ease | ✓ |
| Straight diagonal | Plain FLIP, x/y/scale together | |
| Two-step: slide then stack | Slide to rail column, then drop into slots | |

**User's choice:** Horizontal leads.

| Option | Description | Selected |
|--------|-------------|----------|
| Captions fade, rest rides off | Captions fade at slide start; role line and grid lines ride with page 00 | ✓ |
| Everything rides with page 00 | Captions slide away with the page | |

**User's choice:** Captions fade, rest rides off.

| Option | Description | Selected |
|--------|-------------|----------|
| Y first both ways | Reading order in both directions | ✓ |
| Leader follows travel | Order flips with direction | |
| No stagger | All five together | |

**User's choice:** Y first both ways.

| Option | Description | Selected |
|--------|-------------|----------|
| Glide with the slide | Shares the track's 600ms whatever the distance | ✓ |
| Glide after landing | Track first, letters after | |

**User's choice:** Glide with the slide.

---

## Cursor and rail labels

| Option | Description | Selected |
|--------|-------------|----------|
| Letters + all links/buttons | Plus an opt-in attribute for Phase 6 targets | ✓ |
| Letters and nav only | Content links stay a plain dot | |

**User's choice:** Letters + all links/buttons.

| Option | Description | Selected |
|--------|-------------|----------|
| Letters and external links | Tag on letters, external links, Resume; internal chrome snaps without a tag | ✓ |
| Every snap target | Tag everywhere | |

**User's choice:** Letters and external links.

| Option | Description | Selected |
|--------|-------------|----------|
| Same Label tag beside letter | Keyboard focus on a rail letter shows the cursor's tag, static | ✓ |
| Swap the vertical name | The vertical "now" name switches to the focused letter | |

**User's choice:** Same Label tag beside letter.

| Option | Description | Selected |
|--------|-------------|----------|
| Difference blend | `mix-blend-mode: difference` on square and dot | ✓ |
| Plain ink only | Always white | |

**User's choice:** Difference blend.

---

## Todos

| Option | Description | Selected |
|--------|-------------|----------|
| Fold WR-05 + WR-07 | Cursor pointer-state and native-cursor-hiding bugs become requirements | ✓ |
| Don't fold | Leave todo pending | |

**User's choice:** Fold WR-05 + WR-07.

## Claude's Discretion

- Resize mid-flight handling, phone glide details, exact easing values and the 100ms Y lag
- Cursor mechanics (native cursor gating, snap release and re-take, tag clamping, pointer leaving the window)
- Reduced-motion implementation across the opening, glide, hint and cursor
- Accessibility treatment of the opening, hint and cursor
- NAV-05 verification against the new choreography

## Deferred Ideas

None.
