---
phase: 06-page-compositions-and-content
depth: standard
files_in_scope: 58
files_reviewed: 20
critical: 0
warning: 5
info: 3
total: 8
status: issues_found
---

# Phase 6 Code Review

Standard-depth review of the 58 production source files from the phase SUMMARYs (tests, CSS and the generated media manifest excluded).

**Coverage caveat:** the reviewer read about 20 files in full, mostly the lazy `lib/*/mount.ts` modules, `useFeatures`, `useHint`, `Walkthrough`, `Photo`, `SayHiPage`, `Footer` and `StandaloneClient`. The rest got grep-level checks only (`innerHTML`, `dangerouslySetInnerHTML`, `aria-hidden`, `href`, `target`). Not read in full: `content/*.ts`, `AboutPage`, `AchievementsPage`, `ExperiencePage`, `IndexPage`, `ProjectsPage`, `EdgeNumber`, `MarginNames`, `OrgMark`, `ProofPreview`, `Twin`, `PortraitToggle`, `PagerProvider`, `Track`, `build-media.mjs`, `metadata.ts`, `package.json` and the small lib files.

The findings below are the reviewer's claims and have not been independently reproduced by the orchestrator.

## Clean checks
- No `innerHTML` or `dangerouslySetInnerHTML` in scope; status and tag text is written with `textContent`.
- Every `target="_blank"` has `rel="noopener noreferrer"`.
- `href`s come from static typed content (`mailto:`, https, relative paths).
- `aria-hidden` appears only on decorative nodes and on non-current walkthrough frames, which contain no focusable content.
- The `seq` guard in the walkthrough is correct for superseded `show()` calls.
- Listener cleanup is complete in previews, toggles, cursor, `motion/devices`, `useHint` and `autoload`.

## Warnings

### WR-01: Failed clipboard copy never resets, and the native mailto is suppressed
`lib/copy-email/mount.ts:51-64`
`preventDefault()` runs before the copy is attempted. If `navigator.clipboard` is missing (insecure context) or `writeText` rejects, `fail()` sets the failed message and `line.dataset.copy = "failed"` but never schedules `reset`, so the state persists until the next click. The visitor also loses the native `mailto:` because the default was already prevented.
Fix: schedule `reset` in `fail`, and fall back to the link's native behaviour (e.g. `window.location.href = link.href`), or call `preventDefault` only once the copy succeeds.

### WR-02: A repeat copy click within 4 s is not announced
`lib/copy-email/mount.ts:59-63`
A second click while "Copied" is showing writes an identical `textContent` to the `aria-live="polite"` region (`SayHiPage.tsx:28-32`), so screen readers announce nothing. The `.then` and `fail` callbacks can also write to DOM nodes after unmount if cleanup ran while `writeText` was pending.
Fix: clear `status.textContent` first and set the text in a `requestAnimationFrame`/`setTimeout(0)`; add a `disposed` flag the callbacks check.

### WR-03: The walkthrough can stall if a lazy frame never loads
`lib/walkthrough/mount.ts:98-102, 181-190`
`loadDeferred` sets `src`, but `Photo.tsx:41` renders deferred frames with `loading="lazy"` and `decodeImages` skips `[data-defer]`. `show()` awaits `img.decode()` with no timeout, so a frame outside the viewport or on a slow network stalls auto-advance silently until the user presses a button.
Fix: set `img.loading = "eager"` in `loadGrey`/`loadColour` and race the decode against a timeout (e.g. 1500 ms).

### WR-04: Rapid next/previous clicks lose steps, and status text can disagree with the frame
`lib/walkthrough/mount.ts:192-196`
`step()` computes `next` from `index`, which only changes after the async `decode()` in `show()`. Two quick clicks compute the same `next`, so the second is dropped. `status.textContent` is written before `commit`, so the announcement can name a frame that is never committed if superseded.
Fix: track a `pending` target index updated synchronously in `step()`, and write the status inside `show()` after `commit`.

### WR-05: Walkthrough cleanup leaves DOM state behind and ignores retired animations
`lib/walkthrough/mount.ts:319-331`
Animations passed to `retire()` have their cancel timers cleared on unmount but are never cancelled, so they keep `fill: forwards` transforms. Cleanup does not restore `data-current`/`aria-hidden` on frames, the `pause.hidden` and Play/Pause label, or `touchHold`/`userPaused`. If `useFeatures` remounts after a failed mount the DOM can be inconsistent.
Fix: keep retired animations in a set and cancel them in cleanup; restore frame 0 as current and the others as `aria-hidden`.

## Info

### IN-01: Reduced-motion preference is captured once at mount
`lib/walkthrough/mount.ts:62, 170, 255`
`reduced` is read once; switching `prefers-reduced-motion` off mid-session never starts auto-advance. Acceptable as is, or subscribe to the media query.

### IN-02: A throwing `mount` can be retried and double-bind listeners
`components/shell/useFeatures.ts:32-38`
If `m.mount(root, ctx)` throws after partially attaching listeners, `.catch` deletes the job id and the next `onSlideStart` mounts again with no cleanup of the first attempt.

### IN-03: Previews leave inline CSS variables on unmount
`lib/previews/mount.ts:41, 53, 63-71`
Cleanup removes listeners and `data-quiet` but leaves `--pv-y` on each figure. Only relevant if remounts are possible.
