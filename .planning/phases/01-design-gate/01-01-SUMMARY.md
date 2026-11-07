---
phase: 01-design-gate
plan: 01
subsystem: planning-tooling
tags: [design-gate, gitignore, validation, portrait, wave-0]
requires: []
provides:
  - "check.sh: one command that reports PASS/FAIL for all 19 rows of 01-VALIDATION.md"
  - ".gitignore guard for docs/reference/fonts-private/, *client_secret*.json, .ruff_cache/"
  - "Tracked v6 reference sketch (SC-5a)"
  - "Greyscale portrait master docs/material/portrait-devfest-2026-grey.jpg (SC-4c)"
affects: [01-02, 01-03, 01-04, 01-05, 01-06, 01-07, 01-08]
tech-stack:
  added: []
  patterns: ["Per-row shell check functions named after VALIDATION row IDs (SC-4b -> sc_4b)"]
key-files:
  created:
    - .gitignore
    - .planning/phases/01-design-gate/check.sh
    - docs/material/portrait-devfest-2026-grey.jpg
  modified:
    - docs/reference/swiss-horizontal-v6.html (now tracked, content unchanged)
decisions:
  - "Portrait master is one full-width banner-free crop (1512x1240); About-slot framing happens in v7 with object-position 52% 10%"
metrics:
  duration: "~3 min"
  completed: 2026-11-07
  tasks: 2
  files: 4
---

# Phase 1 Plan 01: Wave 0 foundations (v6, guards, check.sh, portrait) Summary

The v6 sketch is now tracked. A `.gitignore` keeps private fonts and OAuth secrets out of git. A 19-row `check.sh` mirrors 01-VALIDATION.md. A metadata-stripped greyscale DevFest portrait master (1512x1240, banner cropped off) is in docs/material.

## Tasks

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Track v6, add .gitignore guard, add check.sh | af00188 | .gitignore, .planning/phases/01-design-gate/check.sh, docs/reference/swiss-horizontal-v6.html |
| 2 | Greyscale, banner-free portrait master | 37923f3 | docs/material/portrait-devfest-2026-grey.jpg |

## Verification

- `bash -n check.sh` passes, and the file is committed as mode 100755.
- `check.sh SC-4c SC-4e SC-5a` prints three PASS lines and exits 0.
- `git check-ignore -q docs/reference/fonts-private/x.woff2` exits 0.
- check.sh has 19 row functions. A full run prints 19 PASS/FAIL lines. The rows that depend on later plans fail for now, as expected.
- `git ls-files docs/superpowers` is empty, so the rev 4 baseline is left for plan 03.
- The portrait is `1512 1240 Gray`. It has no GPS and no Make/Model/Software tags. A visual check confirmed that the DevFest Montreal banner is gone and that the GDG backdrop and lanyard remain.

## Notes for Yahya's crop review (plan 07 checkpoint)

- (a) The lanyard badge sits at the bottom edge of the crop. Its text may be partly legible, so check whether that is acceptable.
- (b) Is there an original, higher-resolution iPhone photo? The source is only 1512x1512, and the About slot gets at most about 1.6 device px per CSS px.

## Deviations from Plan

None. The plan was executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- FOUND: .gitignore, .planning/phases/01-design-gate/check.sh, docs/material/portrait-devfest-2026-grey.jpg, docs/reference/swiss-horizontal-v6.html (tracked)
- FOUND commits: af00188, 37923f3
