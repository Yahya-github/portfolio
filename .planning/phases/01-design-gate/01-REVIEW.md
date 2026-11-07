---
phase: 01-design-gate
reviewed: 2026-11-07T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - .planning/phases/01-design-gate/check.sh
  - .planning/phases/01-design-gate/metrics.py
  - docs/reference/font-trial.html
  - docs/reference/swiss-horizontal-v7.html
findings:
  critical: 0
  warning: 8
  info: 7
  total: 15
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-11-07
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Reviewed the design-gate verification script (`check.sh`), the HarfBuzz metrics tool (`metrics.py`) and the two throwaway HTML sketches. Severity reflects that the HTML files are reference sketches. Findings in them are kept only where the behaviour is likely to be copied into the Next.js build (input paging, focus, the cursor, reduced motion).

No critical issues. Every external `target="_blank"` link has `rel="noopener"`. No secrets: the email address is public on purpose. `innerHTML` only receives static strings.

Main concerns:
- **`check.sh` can pass when it should fail.** SC-4c passes when `exiftool` is missing (I reproduced this with `exiftool` removed from PATH). The SC-4b phone regex misses a 10-digit number with no separators (reproduced). Any command name given as a row argument is run and reported as PASS (`check.sh LS` gives `PASS LS`).
- **v7 global key handler blocks Space on buttons.** It calls `preventDefault()` on Space for the whole document, so keyboard users cannot press Space to activate any button (Email copy, Pause, Previous/Next, portrait, Pause motion). Space changes the page instead.
- **v7 shares cursor and reel state by accident.** `px`/`py` are declared twice with `var` in the same scope. The second declaration resets the cursor's "no pointer yet" value (-100).
- **v7 does not move focus on page change.** Focus is not moved into the new page. If focus was inside the old page, it is lost when that page becomes `inert`.

## Warnings

### WR-01: SC-4c passes when `exiftool` is not installed (false pass on the privacy check)

**File:** `.planning/phases/01-design-gate/check.sh:27-29`
**Issue:** The GPS check runs `gps=$(exiftool ... 2>/dev/null)`. Its exit status is ignored, so if `exiftool` is missing, `$gps` is empty and `[ -z "$gps" ]` passes. The camera-tag test for `*-color.jpg` (line 29) has the same problem. Verified: with `exiftool` removed from PATH, `check.sh SC-4c` prints `PASS SC-4c`. A missing tool should fail the gate, not skip it.
**Fix:**
```bash
sc_4c() { command -v exiftool >/dev/null && command -v magick >/dev/null || { echo "exiftool/magick not installed"; return 1; }
          local gps f; gps=$(exiftool -q -q -if '$GPSLatitude' -p '$FileName' -r docs/material 2>/dev/null)
          ...
```
Add the same `command -v pdftotext` guard to `sc_4b` so its error message is clear.

### WR-02: SC-4b phone regex misses unseparated and some international numbers

**File:** `.planning/phases/01-design-gate/check.sh:26`
**Issue:** `\(?[0-9]{3}\)?[ .-]?[0-9]{3}[ .-][0-9]{4}` requires a separator between the 3-digit and 4-digit groups. `5145550199` and `514555-0199` slip through (verified: `Tel 5145550199` is not matched). The check exists so no phone number ships in the public resume, so a miss is a privacy false-pass.
**Fix:** Match on digits only, after stripping separators:
```bash
! grep -Eq '(\+?1[ .-]?)?\(?[0-9]{3}\)?[ .-]?[0-9]{3}[ .-]?[0-9]{4}' <<<"$t"
```
Or, more strictly, `tr -cd '0-9\n' <<<"$t" | grep -Eq '[0-9]{10}'` (with care for years and dates on the same line).

### WR-03: Row dispatch runs any command and reports it as PASS

**File:** `.planning/phases/01-design-gate/check.sh:42-44`
**Issue:** `fn` is built from the user's argument and run as `"$fn"`. A typo or a stale row name that happens to match a binary or builtin passes silently: `bash check.sh LS` prints `PASS LS` and exits 0. A misspelled row in automation (`SC-4C`, `true`) could also turn the gate green. This is not a security issue, since the arguments are the operator's own, but it is a correctness issue for a gate.
**Fix:**
```bash
if ! declare -F "$fn" >/dev/null; then echo "FAIL $r"; echo "     unknown row"; fail=1; continue; fi
```

### WR-04: Global Space handler blocks button activation from the keyboard

**File:** `docs/reference/swiss-horizontal-v7.html:653-659`
**Issue:** The document-level `keydown` listener calls `e.preventDefault()` on Space (and Shift+Space) whatever has focus. In Chromium and Firefox, cancelling keydown for Space on a focused `<button>` suppresses its activation. So Space on `#copy` (Email), `#rp` (Pause), `#rprev`/`#rnext`, `#portrait`, `#motion` and `#nx` changes the page instead of pressing the button. This breaks keyboard operation (WCAG 2.1.1) and is the most likely part of the sketch to be copied into `usePager`. The arrow and Page keys are hijacked the same way inside a vertically scrollable page (phones and narrow windows, `.page { overflow-y: auto }`).
**Fix:**
```js
addEventListener('keydown', function (e) {
  if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
  var t = e.target, k = e.key;
  var interactive = t.closest && t.closest('button, a[href], input, select, textarea, [contenteditable], [role="button"]');
  if (k === ' ' && interactive) return;               // let Space press the focused control
  ...
});
```
In the real build, also skip ArrowUp/ArrowDown/PageUp/PageDown/Space when the active page can still scroll in that direction.

### WR-05: `px`/`py` declared twice; the reel overwrites the cursor's sentinel

**File:** `docs/reference/swiss-horizontal-v7.html:707` and `:817`
**Issue:** Line 707 declares `var px = -100, py = -100` (cursor, "no pointer yet"). Line 817 declares `var ... px = 0, py = 0` in the same IIFE scope. With `var` these are the same variables, so when line 817 runs the sentinel becomes `0,0`. `resnap()` (line 756) checks `px >= 0 && py >= 0` to decide whether to hit-test. After the first `go(…, true)` on load, and on every page change before the mouse has moved (touch, keyboard-only), it now hit-tests `(0,0)` and can snap the cursor to whatever sits in the top-left corner. Both handlers also write the shared pair. This happens to work today, but it is fragile: changing either one changes the other.
**Fix:** Rename the reel's copies (`rx`, `ry`) and keep the cursor sentinel:
```js
var overReel = false, rx = 0, ry = 0, onFrame = false, ...
function hit() { onFrame = overReel && inFrame(rx, ry); }
function reelPointer(e) { if (e.pointerType === 'touch') return; overReel = true; rx = e.clientX; ry = e.clientY; hit(); reelSync(); }
```

### WR-06: Paging does not move focus; focus inside the old page is lost to `inert`

**File:** `docs/reference/swiss-horizontal-v7.html:619-641` (line 629)
**Issue:** `go()` sets `inert` on every page except the new one, but never moves focus. If a keyboard user is on a link inside page 01 and presses ArrowRight, the focused element becomes inert. The browser blurs it to `<body>`, and the next Tab starts from the top: skip link, header links and the five rail letters. The project requirements call for focus to move into the active page.
**Fix:** After `inert` is applied:
```js
var ae = document.activeElement;
if (!instant && (!ae || ae === document.body || pages[from].contains(ae))) {
  pages[n].setAttribute('tabindex', '-1');
  pages[n].focus({ preventScroll: true });
}
```

### WR-07: `cursor: none` applied by CSS alone; no pointer at all if the script fails or before it runs

**File:** `docs/reference/swiss-horizontal-v7.html:146-148`
**Issue:** `html, html * { cursor: none; }` applies to every fine-pointer device from first paint. The replacement `.cur` only shows after a `pointermove` adds `.on`. If the script errors, loads late or is blocked, the visitor has no visible pointer. The system cursor (I-beam over text, user cursor-size settings) is also gone everywhere.
**Fix:** Turn it on from JS once the custom cursor is live, e.g. `html.has-cur, html.has-cur * { cursor: none; }`, and add `has-cur` in the first `pointermove` handler.

### WR-08: Reduced motion is read once; switching it mid-session leaves the reel auto-advancing with no Pause button

**File:** `docs/reference/swiss-horizontal-v7.html:591-592` with CSS `:205`, `:65`
**Issue:** `reduce` is a one-shot `matchMedia(...).matches`. The CSS reacts live, so if the OS setting turns on during a visit, `.ctl #rp` and `.foot .mo` are hidden. The JS still has `reduce === false`, though, so `running()` keeps the Facturo reel auto-advancing with no way to pause it (WCAG 2.2.2). `DUR_PAGE` and `place()` also stay in the wrong mode.
**Fix:**
```js
var mq = matchMedia('(prefers-reduced-motion: reduce)'), reduce = mq.matches;
mq.addEventListener('change', function (e) { reduce = e.matches; DUR_PAGE = reduce ? 0 : 600; if (reduce && anim) { anim.cancel(); anim = null; } reelSync(); });
```
(Make `DUR_PAGE` a `var` that can be reassigned.)

## Info

### IN-01: Wheel accumulator never decays between gestures

**File:** `docs/reference/swiss-horizontal-v7.html:649-650`
**Issue:** When not locked, `acc` keeps sub-threshold deltas indefinitely. Two small, unrelated scroll nudges seconds apart (30 + 20 > 45) flip a page. The CLAUDE.md pager spec ("wheel delta accumulator with a lock and idle gap") implies a reset after the idle gap.
**Fix:** `if (t - lastWheel > 180) acc = 0;` before `acc += d`.

### IN-02: `metrics.py` always prints the OFL licence line, whatever face is measured

**File:** `.planning/phases/01-design-gate/metrics.py:201`
**Issue:** `face_section` hard-codes "SIL Open Font License 1.1, self-host allowed" for every face. Running `--faces <paid stem>` would produce a report claiming OFL for a commercial face, and that report feeds the D-08 licence decision.
**Fix:** Read the licence from the font's `name` table (nameID 13/14) or from the `KNOWN` entry, and print "unknown" for faces not in `KNOWN`.

### IN-03: "Tabular by default" is checked on the default instance only

**File:** `.planning/phases/01-design-gate/metrics.py:132-138`
**Issue:** `hmtx` gives default-master advances. In a variable font, HVAR can make digit widths diverge at the display weight (700/800) even if they are equal at the default. Hanken's "tabular by default" verdict therefore holds only at the default weight.
**Fix:** Shape `"0123456789"` digit by digit with `advance_em(c, wght)` at the display weight and compare those widths.

### IN-04: Weak or no-op checks in `check.sh`

**File:** `.planning/phases/01-design-gate/check.sh:14, 19, 31`
**Issue:** In `sc_1c`, the trailing `git log -1 ...` always succeeds, so it adds no condition. `sc_2c` passes if any one tracked file under `docs/reference/fonts` contains "OFL", not one per committed face. `sc_4d`'s `grep -q '@'` matches any `@` (for example a GitHub handle).
**Fix:** Drop or tighten each: require one OFL text per family in `OFL_FACES`, and grep for an email pattern such as `[^ ]+@[^ ]+\.[a-z]+`.

### IN-05: Multi-line failure output is indented only on its first line

**File:** `.planning/phases/01-design-gate/check.sh:44`
**Issue:** `printf '     %s\n' "$out"` passes the whole multi-line string as one argument, so only the first line gets the indent.
**Fix:** `printf '%s\n' "$out" | head -5 | sed 's/^/     /'`.

### IN-06: `now.innerHTML` built by string concatenation

**File:** `docs/reference/swiss-horizontal-v7.html:631`
**Issue:** The data is static (`data-name`), so it is safe today. This is the only `innerHTML` sink, though, and the pattern should not carry into the React build (where `dangerouslySetInnerHTML` would be the equivalent).
**Fix:** Build it with `textContent` and `createElement('span')`, or JSX in the real build.

### IN-07: Sketch-only dead ends worth not copying

**File:** `docs/reference/swiss-horizontal-v7.html:498, 464, 438/447`; `docs/reference/font-trial.html:160` (and every block)
**Issue:**
- `href="#facturo"` has no target.
- The CCC line is a focusable `div[tabindex="0"]` with no role.
- On phones two `<nav aria-label="Sections">` landmarks are exposed at once (`#fly` and `.capsm`).
- In `font-trial.html`, the "not installed: put the test files in fonts-private/" message is shown for OFL faces too, where the fix is the committed `fonts/` folder.
**Fix:** Give the deep-dive link a real target. Give the CCC row `role="group"` with a label, or make the preview reachable another way. Give the two navs distinct labels, or hide `#fly` from AT on phones. Use a per-block missing message.

---

_Reviewed: 2026-11-07_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
