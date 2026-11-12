---
phase: 05-letter-navigation-and-motion
verified: 2026-11-10T12:00:00Z
status: human_needed
score: 5/5 roadmap success criteria verified in code and automated tests; remaining items are environment-only checks (visual baselines, non-chromium browsers, phone glide) and a tracking fix
overrides_applied: 0
gaps: []
deferred: []
human_verification:
  - test: "Re-run the visual spec in the Playwright container: VISUAL=1 pnpm exec playwright test e2e/visual.spec.ts (update baselines if the 05-12 hint change moved pixels)"
    expected: "Baselines match, or are intentionally regenerated, after the 05-12 hint/footer change"
    why_human: "No container runtime on the dev host; the visual spec status after 05-12 is unconfirmed"
  - test: "Run ALL_BROWSERS=1 (webkit, firefox) in the container for pager-wheel, letters-glide, cursor, first-visit"
    expected: "All pass; in particular the hardened wheel-stream test at e2e/pager-wheel.spec.ts:45 in webkit"
    why_human: "Non-chromium browsers only run in the container; not run after 05-12/05-13"
  - test: "On a real phone, scroll the Index partway then swipe to the next page"
    expected: "Letters start the glide with no jump (Pitfall 6)"
    why_human: "The e2e test is skipped because the Index does not scroll at 390x844"
---

# Phase 5: Letter Navigation and Motion Verification Report

**Phase Goal:** The signature experience works: the name is the map, every motion follows one horizontal rule, and visitors always know where they are and that the site moves sideways
**Status:** human_needed (no code gaps found)
**Re-verification:** No, initial verification

## Goal Achievement

### Observable Truths (ROADMAP success criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Letters glide and shrink into a left rail and grow back; no stranding on fast paging or resize | VERIFIED | `components/letters/LetterNav.tsx` (one nav, data-mode hero/rail), `useGlide.ts`, `lib/letters/glide.ts`; e2e `letters-glide.spec.ts` passes (order, no overshoot, ends under 1s, shares the track start); UAT test 4 pass |
| 2 | Rail labels on hover/focus; current letter accent plus non-colour cue; phone rail inset; cursor 1:1 with snap and in-viewport tag; touch keeps native cursor | VERIFIED | Rail CSS (`letters.module.css` hover/focus/aria-current rules, `.now` numbered vertical name, 24px phone inset); accent derived from `aria-current` on pager target only; cursor chunk gated on fine pointer and not forced-colors in `PagerProvider.tsx`; `letters-labels`, `cursor`, `letters-glide` phone LTR-06 tests pass; UAT 5, 6 pass |
| 3 | Footer 00 / 05 counter, Next, progress bar track the page; quiet first-visit hint | VERIFIED | `components/frame/Footer.tsx`, `useHint.ts`, `lib/first-visit/hint.ts`; `first-visit-hint.spec.ts` passes (ink 16px centred, nudge, seen rule, footer still tracks); UAT 1, 2 re-checked and approved after 05-12 |
| 4 | Opening under about 1s, content loaded underneath, any click or key skips, never replays | VERIFIED | `lib/first-visit/opening.ts`, failsafe test; `first-visit.spec.ts` passes (skip, reload no replay, blocked storage, failsafe); UAT 3 pass |
| 5 | All motion horizontal, fast, no bounce; reduced motion makes everything instant | VERIFIED | All easings in `styles/tokens.css` stay in the unit square (no overshoot); glide e2e "no overshoot"; `reduced-motion.spec.ts` passes; controller passes `reduced` to animator; UAT 7 pass |

**Score:** 5/5

### Spot-checks run by the verifier

| Check | Result |
|-------|--------|
| `pnpm exec vitest run` | 530 passed |
| `pnpm typecheck`, `pnpm lint` | clean |
| `pnpm build` | success |
| Playwright chromium (letters-glide, letters-labels, first-visit, first-visit-hint, cursor, pager-wheel, reduced-motion) on port 4416 | 65 passed, 1 skipped (phone scroll glide) |

Pager core read directly: `lib/pager/controller.ts` (commit, scroll, animate, focus order; stale slide ids ignored; abandoned slides still land; held-key gate), `components/shell/PagerProvider.tsx` (initial index from the server prop, reduced-motion listener, cursor lazy-load with failure fallback), `LetterNav.tsx` (single nav, accent from aria-current only). No stubs, TODOs or placeholders found in lib/components/app. The Phase 4 pager behaviour still passes (pager-wheel in the run above), so no regression found.

### Requirements Coverage

All 10 IDs appear in plan frontmatter and in REQUIREMENTS.md as Phase 5: LTR-03, LTR-04, LTR-05, LTR-06, NAV-05, NAV-06, DSGN-04, EXP-01, EXP-03, A11Y-04. NAV-01 (Phase 4) is claimed by gap plan 05-13. No orphaned requirements.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| LTR-03 | SATISFIED | glide specs, UAT 4 |
| LTR-04 | SATISFIED | labels spec, UAT 5 |
| LTR-05 | SATISFIED | aria-current-only accent, `.now` cue, labels spec |
| LTR-06 | SATISFIED | phone 24px inset e2e on chromium-touch |
| NAV-05 | SATISFIED | footer tracking e2e |
| NAV-06 | SATISFIED | hint specs, UAT 1-2 |
| DSGN-04 | SATISFIED | easing tokens, no-overshoot e2e |
| EXP-01 | SATISFIED | first-visit spec |
| EXP-03 | SATISFIED | cursor spec, UAT 6 |
| A11Y-04 | SATISFIED | reduced-motion spec, UAT 7 |
| NAV-01 | SATISFIED (05-13 test hardening only; wheel stream test passes; Phase 4 owns the product behaviour) | pager-wheel passes |

**Tracking issue to fix (not a code gap):** REQUIREMENTS.md still shows LTR-04, LTR-05, LTR-06 as unchecked / "Pending" in both the checklist and the traceability table, and NAV-01 as Pending. Evidence above supports ticking LTR-04/05/06. NAV-01 hinges on the Phase 4 real-hardware checks still open there.

### Open items, classified

| Item | Classification |
|------|----------------|
| (a) Visual baselines not re-run after 05-12 | Human/environment needed (container) |
| (b) webkit/firefox not run after 05-12/05-13 | Human/environment needed (container) |
| (c) Phone-scroll glide test skipped | Human check on a real device; mechanism covered by unit tests |
| (d) Letter 0 "moves first" cannot be asserted | Accepted limitation; stagger covered for horizontally moving letters |
| (e) Flake in pager-motion.spec.ts about line 195 under heavy load | Warning, test-only, not product |
| (f) CSP `script-src 'unsafe-inline'` | Info |
| Review WR-01 (cursor tag can reappear after pointer leaves window) | Warning, cosmetic, recommend a small follow-up |
| Review WR-03 (opening not recorded after failsafe) | Warning, behaviour question (opening may replay once after a failsafe) |
| Review coverage partial (12 of 57 files) | Verifier spot-checked pager core, LetterNav, PagerProvider; found no blockers |
| Phase 4 real-hardware trackpad/mouse checks | Still owned by Phase 4 human verification |

### Anti-Patterns

None blocking. No placeholder/TODO text; no bounce easings.

### Gaps Summary

No gaps blocking the goal. The phase goal is achieved in code and automated tests, and the user approved the full feel check in UAT. Status is human_needed only because the container-only checks (visual baselines, webkit/firefox) could not be run here and should be confirmed before closing the phase.

---

_Verified: 2026-11-10T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
