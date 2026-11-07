---
phase: 1
slug: design-gate
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-11-06
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source: `01-RESEARCH.md` § Validation Architecture. This phase writes no product code, so validation is shell checks plus human checkpoints.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none: POSIX shell + grep, awk, git, pdftotext, pdfinfo, exiftool, magick |
| **Config file** | none |
| **Quick run command** | the SC row(s) touched by the task (table below) |
| **Full suite command** | `bash .planning/phases/01-design-gate/check.sh` (optional wrapper of all SC rows; planning tooling, not product code) |
| **Estimated runtime** | ~5 seconds |

Run from repo root with `D=docs/superpowers/specs/2026-11-03-portfolio-design.md`.

---

## Sampling Rate

- **After every task commit:** Run the SC rows that task touches
- **After every plan wave:** Run every automated row expected to pass by then
- **Before `/gsd-verify-work`:** All rows green plus the approval commit
- **Max feedback latency:** 10 seconds

---

## Per-Criterion Verification Map

Task IDs are filled in by the planner; rows map to roadmap success criteria (SC-1 to SC-5). No REQ IDs (design gate).

| Check | SC | Threat Ref | Secure Behavior | Type | Automated Command | Exists | Status |
|-------|----|------------|-----------------|------|-------------------|--------|--------|
| SC-1a | 1 | — | N/A | grep | `grep -q 'revision 5' $D && grep -q '#0b0b0b' $D && grep -qi 'horizontal' $D` | ❌ | ⬜ pending |
| SC-1b | 1 | — | N/A | awk | `awk '/^## .*Retired/{r=1} !r && /#f8f8f8\|viscous\|folder stack\|Sableye\|GitHub Pages\|CNAME/{print NR": "$0; bad=1} END{exit bad}' $D` | ❌ | ⬜ pending |
| SC-1c | 1 | — | N/A | grep+git | `grep -Eq '^Status: APPROVED by Yahya, 20[0-9]{2}-[0-9]{2}-[0-9]{2}' $D && git log -1 --format=%s -- $D` (human gate) | ❌ | ⬜ pending |
| SC-2a | 2 | — | N/A | grep | `test -f docs/reference/font-trial.html && for f in 'Inter Tight' 'Sofia Sans' Schibsted Hanken Instrument; do grep -q "$f" docs/reference/font-trial.html \|\| echo "missing $f"; done` | ❌ | ⬜ pending |
| SC-2b | 2 | — | N/A | grep | `grep -Eqi 'final (font\|family)' $D && grep -Eqi '(SIL Open Font License\|OFL\|web licen[cs]e)' $D && grep -q -- '--yahya-fit' $D` | ❌ | ⬜ pending |
| SC-2c | 2 | T-1-04 | No paid/test font files in git | git | `git ls-files \| grep -Ei '\.(woff2?\|otf\|ttf)$' \| grep -viE 'InterTight\|SofiaSans\|Schibsted\|Hanken\|Instrument' && echo FAIL \|\| echo ok` | ❌ | ⬜ pending |
| SC-3a | 3 | — | N/A | grep | `for p in Index Achievements Projects Experience About 'Say hi'; do grep -Eq "^#{2,4} .*$p" $D \|\| echo "no section $p"; done` | ❌ | ⬜ pending |
| SC-3b | 3 | — | N/A | grep | `grep -i 'poster device' $D \| sed 's/.*device[^:]*: *//I' \| sort \| uniq -d` prints nothing | ❌ | ⬜ pending |
| SC-3c | 3 | — | N/A | grep | `grep -Eqi 'Involvement.*(fits\|cols 6\|Heading)' $D` | ❌ | ⬜ pending |
| SC-3d | 3 | — | N/A | grep | `V=docs/reference/swiss-horizontal-v7.html; test -f $V && ! grep -qE 'example\.com\|1\.56,\|fonts\.googleapis' $V` | ❌ | ⬜ pending |
| SC-4a | 4 | — | N/A | ls | `ls docs/material/portrait*.jpg docs/material/*.pdf docs/material/links.md` | ❌ | ⬜ pending |
| SC-4b | 4 | T-1-01, T-1-03 | Resume has no phone, no stale date | pdftotext | `! pdftotext docs/material/*.pdf - \| grep -Eq '\(?[0-9]{3}\)?[ .-]?[0-9]{3}[ .-][0-9]{4}' && ! pdftotext docs/material/*.pdf - \| grep -q 'May 2023' && pdftotext docs/material/*.pdf - \| grep -q '2025'` | ❌ | ⬜ pending |
| SC-4c | 4 | T-1-02 | Images greyscale, no GPS | exiftool/magick | `exiftool -q -if '$GPSLatitude' -p '$FileName' -r docs/material` prints nothing; `magick identify -format '%[colorspace]\n' docs/material/portrait*.jpg` = `Gray` | ❌ | ⬜ pending |
| SC-4d | 4 | — | N/A | grep | `grep -q 'linkedin.com/in/' docs/material/links.md && grep -q 'github.com/Yahya-github' docs/material/links.md && grep -q '@' docs/material/links.md` | ❌ | ⬜ pending |
| SC-4e | 4 | T-1-01, T-1-05 | No private Downloads files in git | git | `git ls-files \| grep -Ei 'passport\|transcript\|client_secret\|ICPCId' && echo FAIL \|\| echo ok` | ✅ | ⬜ pending |
| SC-4f | 4 | T-1-11 | Only confirmed-safe material, or an explicit waiver | ls/grep | `for k in facturo robot atlantis; do ls docs/material/screenshots/$k-* docs/material/photos/$k-* >/dev/null 2>&1 \|\| grep -Eqi "^- Waiver: $k" docs/material/links.md \|\| echo "no $k"; done` prints nothing (waivers quote Yahya and are listed in the 01-08 approval brief) | ❌ | ⬜ pending |
| SC-5a | 5 | — | N/A | git | `git ls-files --error-unmatch docs/reference/swiss-horizontal-v6.html` | ❌ | ⬜ pending |
| SC-5b | 5 | — | N/A | grep | `for n in 1 2 3 4 5 6; do grep -Eq "Decision $n.*(Accepted\|Overruled)" $D \|\| echo "D$n missing"; done; grep -q Vercel $D` | ❌ | ⬜ pending |
| REQ-edits | — | — | N/A | grep | `grep -Eqi '^- \[ \] \*\*[A-Z]+-[0-9]+\*\*:.*cursor' .planning/REQUIREMENTS.md && ! grep -Eq '^- Contact form, custom cursor' .planning/REQUIREMENTS.md` | ❌ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Plan Mapping (filled by planner)

| Check | Turned green by | Re-checked by |
|-------|-----------------|---------------|
| SC-1a, SC-1b, SC-3a, SC-3b, SC-3c, SC-5b | 01-03 Task 1 | 01-07 Task 2, 01-08 Task 1 |
| SC-1c | 01-08 Task 3 (only after Yahya's explicit approval) | 01-08 Task 3 |
| SC-2a, SC-2c | 01-02 Tasks 1-3 | 01-05 Tasks 2-3, 01-07 Task 2 |
| SC-2b | 01-07 Task 2 | 01-08 Task 1 |
| SC-3d | 01-06 Tasks 1-3 | 01-07 Task 2 |
| SC-4a, SC-4c (portrait) | 01-01 Task 2 + 01-04 Tasks 2-3 | 01-08 Task 1 |
| SC-4b, SC-4d, SC-4f | 01-04 Tasks 2-3 (SC-4f waivers also copied into doc §9 by 01-07 Task 2) | 01-08 Task 1 |
| SC-4e, SC-5a | 01-01 Task 1 | every wave |
| REQ-edits | 01-03 Task 2 | 01-07 Task 3 |

Wave 0 items: `.gitignore`, v6 commit and `check.sh` (19 rows) are all 01-01 Task 1. Wave 1 plans 01-02 and 01-04 run beside 01-01, so their verify commands are self-contained and do not call check.sh. `metrics.py` (01-02 Task 1) is committed planning tooling, reused by 01-05 and 01-06.

---

## Wave 0 Requirements

- [ ] `.gitignore` containing `docs/reference/fonts-private/` (before any paid test font touches the repo)
- [ ] Commit `docs/reference/swiss-horizontal-v6.html` (SC-5a)
- [ ] Optional `.planning/phases/01-design-gate/check.sh` wrapping the table above

---

## Manual-Only Verifications

| Behavior | Source | Why Manual | Test Instructions |
|----------|--------|------------|-------------------|
| Final font pick | D-03, SC-2 | Taste decision by Yahya | Open `docs/reference/font-trial.html` at 1440x900, 1366x768, 390px; Yahya names the winner |
| Achievements a/b, cursor a/b/c | D-11, D-19 | Taste decision | Open v7 sketch variants; Yahya picks |
| Portrait crop | SC-4 | Visual judgement | Yahya confirms crop in About slot |
| Design doc approval | D-25, SC-1c | Only Yahya may approve; Claude never writes "APPROVED" | Yahya adds the Status line or explicitly instructs it |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
