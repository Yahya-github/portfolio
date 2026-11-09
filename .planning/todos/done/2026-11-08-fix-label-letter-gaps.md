---
created: 2026-11-08
source: .planning/phases/03-static-design-system-and-pages/03-10-SUMMARY.md
phases: [4, 6]
---

# Fix gaps inside words in small uppercase labels

Seen in the approved Phase 3 baselines (`e2e/visual.spec.ts-snapshots/index-1440x900-visual-linux.png`, Chromium on Linux): small uppercase Label text shows gaps inside words, for example "YAHYA HALL ANI", "RESU ME (PDF)", "SOFTWARE ENGINE ERING", "NE XT, ACHIE VEMENTS", "EXPERI ENCE". The giant YAHYA and body text are fine.

Likely cause is in the Label role (letter-spacing, `font-kerning`/feature settings, or the Instrument Sans subset). Check in Yahya's own Chrome too.

Done when: labels render without inner-word gaps, `pnpm test:e2e` passes, and the visual baselines are regenerated in the Playwright container (command in 03-10-SUMMARY).

Resolved (Phase 4, plan 04-14): `.t-label` gets `text-rendering: geometricPrecision; font-kerning: normal` (commit 0d6714d). Signal: "fixed" (the coordinator checked Chrome at dpr 1.33 for Yahya; there all glyph advances are fractional, but the original gap did not reproduce in that Chrome). The 1x container baselines no longer show "ACHIE VEMENTS" or "00 /05". Baselines regenerated in the container.
