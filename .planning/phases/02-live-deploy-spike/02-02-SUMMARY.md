---
phase: 02-live-deploy-spike
plan: 02
subsystem: app-scaffold
tags: [nextjs, static-export, next-font, vitest, toolchain]
requires: []
provides:
  - buildable Next.js 16.4.5 static export (pnpm build -> out/)
  - shortSha build-info helper + Vitest jsdom scaffold
  - self-hosted Instrument Sans, portrait WebP, public resume PDF
affects: [02-03 (CI/e2e/measure-js), Vercel deploy]
tech-stack:
  added: [next@16.4.5, react@19.3.1, typescript@~6.0.3, eslint@10.14.0, eslint-config-next@16.4.5, prettier@3.9.10, vitest@5.1.0, vite@8.3.6, "@vitejs/plugin-react@6.2.1", jsdom@31.0.0, "@testing-library/*", "@playwright/test@1.65.0", "@axe-core/playwright@4.14.0", serve@14.2.7]
  patterns: [next/font/local single instance, static image import, metadata robots noindex]
key-files:
  created: [package.json, pnpm-lock.yaml, pnpm-workspace.yaml, .nvmrc, .prettierrc, .prettierignore, tsconfig.json, next.config.ts, vitest.config.mts, tests/setup.ts, tests/build-info.test.ts, lib/build-info.ts, app/fonts.ts, app/layout.tsx, app/page.tsx, app/globals.css, app/fonts/InstrumentSans-wdth-wght.woff2, app/fonts/OFL-InstrumentSans.txt, assets/portrait-800.webp, public/yahya-hallani-resume.pdf]
  modified: [.gitignore]
  missing: [eslint.config.mjs]
decisions:
  - "ESLint 10.14.0 kept (fallback to 9 not tried, because lint could not run without a config)"
  - "allowBuilds allowlist is sharp:false, unrs-resolver:false with no true entries; pnpm reported no other ignored build scripts"
metrics:
  duration: ~10min
  completed: 2026-11-07
---

# Phase 02 Plan 02: Minimal Next.js static-export placeholder Summary

A hand-written Next.js 16.4.5 static export. `pnpm build` writes `out/index.html` containing YAHYA in Instrument Sans (self-hosted with next/font/local and preloaded), a metadata-stripped 800x656 greyscale WebP portrait, a link to `/yahya-hallani-resume.pdf`, a noindex/nofollow meta tag and a `build local` SHA line. No URL points at a third party.

## Tasks

| Task | Name | Commit |
| ---- | ---- | ------ |
| 1 | Toolchain, pins, configs, install | 7c07660 |
| 2 (RED) | Failing shortSha tests | 7e5e930 |
| 2 (GREEN) | shortSha helper | 7886c54 |
| 2 | Placeholder page and self-hosted assets | 9868efc |

## Verification (run in worktree)

- `pnpm format:check`, `pnpm typecheck`, `pnpm test` (5/5) and `pnpm build`: all exit 0
- `out/index.html` contains: YAHYA, `name="robots" content="noindex, nofollow"`, `build local`, `href="/yahya-hallani-resume.pdf"` and `<link rel="preload" ... as="font" type="font/woff2">`
- `out/_next/static/media/` holds one `.woff2` and one `.webp`. `cmp` of the resume against `docs/material/resume-public.pdf` shows the files are identical
- `grep -Eo '(src|href)="https?://' out/index.html` prints nothing
- `exiftool assets/portrait-800.webp | grep -iE "GPS|Camera Model"` prints nothing
- No `next` command created AGENTS.md, and the build left tsconfig.json unchanged

## Deviations from Plan

### Blocked

**1. eslint.config.mjs not created, so `pnpm lint` cannot pass yet**
- **Found during:** Task 1
- **Issue:** The `config-protection` PreToolUse hook from the everything-claude-code plugin refused the Write with "Modifying eslint.config.mjs is not allowed ... disable the config-protection hook temporarily". The hook is a user-level guardrail, so I did not bypass it (no shell write) and did not disable it.
- **Needed:** Either the user creates the file, or the user temporarily disables the hook and an agent writes it. The intended content is the research Code Examples config plus the extra ignores:
  ```js
  import { defineConfig, globalIgnores } from "eslint/config";
  import nextVitals from "eslint-config-next/core-web-vitals";
  import nextTs from "eslint-config-next/typescript";

  export default defineConfig([
    ...nextVitals,
    ...nextTs,
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "playwright-report/**", "test-results/**", "docs/**", ".planning/**"]),
  ]);
  ```
  Then run `pnpm format && pnpm lint`. If ESLint 10 crashes, fall back to `eslint@9.39.5`.

### Process notes

- A hook blocks `git commit --no-verify`, so commits ran without the flag. No repo-level git hooks are installed, so this changed nothing.
- Expected unmet-peer warnings: eslint-plugin-import, jsx-a11y and react want `eslint <=9`.

## Known Stubs

None. The placeholder page is deliberately bare (D-09).

## Self-Check: PASSED (except the documented eslint.config.mjs blocker)

- All created files listed above exist, apart from eslint.config.mjs as documented
- Commits 7c07660, 7e5e930, 7886c54 and 9868efc are in `git log`
