---
phase: 08-interactive-proof
plan: 06
status: partial
requirements: [PROOF-01]
key-files:
  created:
    - godot/shell/play.html
    - godot/shell/shell.js
    - scripts/export-atlantis.mjs
    - scripts/lib/atlantis-build.mjs
    - scripts/lib/atlantis-build.d.mts
    - tests/atlantis-build.test.ts
    - content/generated/atlantis-build.ts
  modified:
    - .gitignore
    - .prettierignore
    - package.json
---

# Phase 8 Plan 06: Atlantis web export Summary

Status: PARTIAL. Task 1 (minus one file) and the code half of Task 3 are done. Task 2 (fork `web` branch) and the real export were not done; they are blocked by sandbox limits described below.

## Commits

- bf11755: feat(08-06) first-party Godot shell and ignore rules (play.html, shell.js, .gitignore, .prettierignore)
- 5cd0c94: feat(08-06) export script and measured build module (helpers, 4 passing tests, `pnpm game:export`, null generated module)

## Deviations and blockers

1. **eslint.config.mjs not edited (blocked).** A config-protection hook refused the edit to add `public/games/**` and `public/models/**` to `globalIgnores`. I did not bypass it. `pnpm lint` passes today only because those folders do not exist yet. Needed before any export is lint-run: add the two globs to `globalIgnores` (Godot's `play.js` would otherwise be linted). `godot/shell/shell.js` lints clean with its `/* global Engine */` comment.
2. **Task 2 not done (blocked).** The fork `~/dev/forks/atlantis` is outside this worktree. The harness refuses any git command targeting another repo from this worktree-isolated agent, so I could not create the `web` branch or commit. Not done: ship.tscn ext_resource fix, `web/play.html` copy (must be byte-identical to `godot/shell/play.html` after prettier formatting, which I applied), `web/web_bridge.gd` + WebBridge autoload, "Web" preset, music removal (MUSIC=none), jpg import limits. No fork SHA exists yet.
3. **Real export not run.** Depends on Task 2 and on the Godot 4.5.1 `web_nothreads_release.zip` template, which is not present (`~/.local/share/godot/export_templates` is empty and the script's XDG cache has none). No size table to report. `content/generated/atlantis-build.ts` stays `null`.
4. **Typecheck not verified.** The generated module imports `AtlantisBuild` from `content/types.ts`, which plan 08-02 adds in a parallel worktree. `pnpm typecheck` will pass once 08-02 is merged. I did not add the type here to avoid a merge conflict.
5. **Pre-existing:** `pnpm format:check` flags `lib/proof/game/state.ts` (from earlier plan); out of scope.
6. The commit-attribution reminder asked for a Co-Authored-By trailer; the user's memory rule forbids it, so none was added.

## Verification run

- `vitest tests/atlantis-build.test.ts`: 4/4 pass. `pnpm lint`: clean. Prettier clean on my files. `git check-ignore public/games/x public/models/x`: not run after the final edit (ignore lines added to .gitignore).

## Remaining for a follow-up run (outside the sandbox restriction)

Do Task 2 in the fork, install the template, add the eslint ignores, run `pnpm game:export`, record the table and fork SHA, commit the regenerated module.

## Self-Check: PASSED for delivered files (all listed files exist, commits bf11755 and 5cd0c94 exist). Plan overall NOT complete.
