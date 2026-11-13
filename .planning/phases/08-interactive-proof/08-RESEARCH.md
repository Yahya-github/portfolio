# Phase 8: Interactive Proof - Research

**Researched:** 2026-11-12
**Domain:** Godot 4.5 single-thread web export inside a static Next.js/Vercel site; CAD-to-WebGL2 model pipeline; cross-document View Transitions
**Confidence:** HIGH for the Godot export, CSP and Onshape access (measured or probed in this session); MEDIUM for the View Transition mechanics on traversal and for Vercel's on-the-fly compression of large files; LOW only where flagged.

## Summary

I exported the real Atlantis fork (`~/dev/forks/atlantis`, HEAD `7bdbcd8`) with the local Godot 4.5.1 binary and the official 4.5.1 `web_nothreads_release` template. Then I booted it in headless Chromium under CSP variants. Four findings change the plan:

1. **The fork's HEAD does not run as-is.** `scenes/ship.tscn` uses `ExtResource("28_u7rkd")` (the FishingGame scene) but no longer declares it. Merge `52ee9b7` dropped the line, and upstream `plastikup/atlantis` has the same bug. The `game_manager` autoload fails to compile, so the game world never loads. One restored line fixes it: `[ext_resource type="PackedScene" uid="uid://w28tcs617hls" path="res://scenes/ui/fishingGame.tscn" id="28_u7rkd"]`. With that line, the export boots to the title menu and "JOUER" loads the submarine level in Chromium.
2. **The stock export is far too heavy.** The engine (`.wasm`) is 38.0 MB raw, 9.26 MB gzip-9, 7.5 MB brotli q5 and 6.5 MB brotli q11. The game data (`.pck`) is **43.7 MB and does not compress** (41.6 MB brotli). That is about 53 MB on the wire. The `.pck` bloat is fixable in the fork's export settings:
   - a 37 MB WAV music track imported as QOA (7.5 MB in the pck)
   - an unreferenced `assets/station/spiderman.jpeg` (2.5 MB, and a copyright problem)
   - the Dialogic example and editor-preview assets
   - 6000+ px background JPEGs (4.1 MB and 2.4 MB)

   The engine itself can only shrink with a custom template. D-08's starting guess ("~10 MB brotli, ~5 s on throttled 4G") cannot be met by any Godot 4 build with the stock template: the engine alone is 6.5 to 9.3 MB compressed.
3. **Atlantis needs a keyboard and a mouse.** The input map uses WASD, Q (interact), E (fish), 1-4, **Tab (inventory)**, **Esc** and mouse button 1. Godot's web key handler is attached to the canvas and calls `preventDefault()` on every key, so Tab never leaves the game. Esc therefore has to be caught in the capture phase by first-party shell code before Godot sees it. This resolves D-09: phones get the screenshot fallback and "Best on desktop".
4. **The CSP needs exactly two additions, and only on the game's own path.** With the current site CSP, `WebAssembly.instantiateStreaming` is blocked (that run is the negative control). Adding `'wasm-unsafe-eval'` lets the engine start. The game then sets a custom cursor from a `blob:` URL, which needs `img-src blob:`. No `'unsafe-eval'` is needed (`eval` is only reachable through `JavaScriptBridge.eval`, which Atlantis never calls). The parent route `/projects/atlantis/` needs **no header change**: `frame-src` falls back to `default-src 'self'`, and `X-Frame-Options` only governs being framed.

For the robot, the Onshape document reads anonymously but has `anonymousAllowsExport: false`. Every export or tessellation endpoint returns 401. The document is **owned by a different Onshape account (a teammate), not Yahya**, and was created under an Education plan. So the CAD file must come from the owner or through an account the owner grants export rights to. This is the same person whose consent the plan-time gate needs.

For the row-to-deep-dive transition, **cross-document View Transitions** (`@view-transition { navigation: auto }` plus `view-transition-name`) fit the site's structure: the deep dives are separate static documents reached by plain `<a>` links. They cost about 0 kB of JavaScript (one small inline handler for skip and interrupt), and they skip automatically where unsupported (Firefox, Safari < 18.2).

**Primary recommendation:**
- Ship Atlantis as a versioned, first-party Godot 4.5.1 no-threads export at `public/games/atlantis/<version>/`, named `play.*` rather than `index.*`. Use a custom external-script shell. Give `/games/(.*)` its own non-overlapping header rule.
- Slim the `.pck` in the fork before measuring against the threshold.
- Build the robot viewer as a raw WebGL2 chunk that reads a pre-quantized binary mesh, produced at dev time by `@gltf-transform` from the owner-supplied glTF.
- Implement D-17 with CSS cross-document View Transitions.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Atlantis route page (title, poster, lines, links, screenshots) | Static HTML (build-time RSC) | — | Must work with JS off and in every fallback state (D-08) |
| Play/Exit/Mute state machine, iframe mount | Browser (client island on `/projects/atlantis/` only) | — | Loaded only on that route; nothing global |
| Godot engine + game data | CDN / Static (`public/games/atlantis/<v>/`) | Browser (iframe document) | First-party, fetched only after Play (D-05) |
| Esc capture, progress/exit/ready messages, mute bridge | Browser: the iframe's first-party shell script | Godot runtime (`onProgress`, `onExit`) | Godot swallows keys on the canvas; only code inside the frame document can intercept first |
| Per-path headers (game CSP, SAMEORIGIN, immutable cache, noindex) | CDN (`vercel.json`) | — | Static export has no server; Vercel headers are the only control |
| Robot still image | Static (WebP via `build-media.mjs`) | — | Page must be complete without the viewer (D-14) |
| Robot viewer (WebGL2, orbit, auto-rotate gate) | Browser (lazy `import()` chunk ≤12 kB gzip) | — | Raw WebGL2 per STACK.md |
| Robot mesh conversion and decimation | Build tooling (Node dev script, run locally) | — | gltf-transform and meshoptimizer never ship to the browser |
| Row-to-deep-dive transition | Browser (CSS cross-document View Transitions) | Tiny inline script (`pageswap`/`pagereveal`) | Separate documents; CSS-first keeps the JS budget at about 0 |
| Licence and consent clearance | Human checkpoint (Yahya + teammates) | — | Cannot be automated; gates the public build |

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Where each piece lives
- **D-01:** **Atlantis is a standalone route `/projects/atlantis/`**, outside the pager, same shape as `/projects/facturo/` (Phase 6 D-01): fixed header with Resume / Say hi, vertical scroll, "Back to Projects" link, no `00 / 05` counter, no pager input. Godot is requested only from this route, so "no cost on other pages" holds structurally.
- **D-02:** **The robot model is a standalone route `/projects/robot/`**, same shape. Projects rows link to both new routes (Atlantis "Play", Robot "3D model"), in addition to the existing Code and Team site links.
- **D-03:** **Lean page shape for both routes:** giant Display title, the interactive piece as the dominant element, a few verified lines, links. No Problem / What I built / Result sections (unlike Facturo). Copy comes only from verified facts (`portfolio-voice-and-facts`) in a typed file under `content/`, editable by Yahya later. Reuse the deep-dive header/footer components where they fit (see Code Context).
- **D-04:** **Both routes join `sitemap.xml` and get their own title, description and canonical** (Phase 7 patterns). Sitemap goes from 7 to 9 URLs. The never-on-the-site list still binds all copy (no Atlantis line counts, no top-1 wording, no CRC platform mention).

#### Atlantis play experience (PROOF-01)
- **D-05:** **Click to play.** The route shows a greyscale poster (Atlantis screenshots, still to capture) and a Play button. Godot's wasm and pck are fetched only on that click, never on arrival.
- **D-06:** **Same-origin iframe** loads Godot's own HTML shell from a first-party path. Header changes apply to `/projects/atlantis/` (and the game files' path) only: `X-Frame-Options: SAMEORIGIN`, `frame-src 'self'`, `frame-ancestors 'self'`, and the CSP additions Godot needs (`'wasm-unsafe-eval'` and whatever research proves necessary). Every other route keeps today's strict CSP and `X-Frame-Options: DENY`. `tests/vercel-config.test.ts` is extended to pin both cases, with a negative control.
- **D-07:** **Game audio is on after the Play click** (the click is the required user gesture), with a visible mute control beside the game. The "no sound" rule in the design applies to the site chrome, not the game.
- **D-08:** **The "too heavy" threshold is decided after measuring the real export.** Starting guess for research to confirm or replace: over ~30 MB raw, ~10 MB brotli, or over ~5 s to playable on throttled 4G falls back. The fallback is screenshots plus the repo link. Screenshots plus link are also what no-JS visitors and failed loads see, so that content always exists on the page.
- **D-09:** **Touch devices: research decides from Atlantis's controls.** If the game needs keyboard or mouse, phones get screenshots, the repo link and a "Best on desktop" line instead of the embed; if it is playable by touch, it embeds. Recorded as an open item, not a preference for either outcome.
- **D-10:** **Keyboard escape:** a visible "Exit game" button sits before the iframe in tab order, and Esc returns focus to the Play button (the standalone route has no pager keys to conflict with). No keyboard trap in any state. Single-thread export only (no SharedArrayBuffer, so no COOP/COEP headers).

#### Robot model (PROOF-02)
- **D-11:** **Look: plain greyscale shaded material** on the black ground, lit from one side. The model is a render of his CAD, not a photo, and follows the greyscale system without needing a DSGN-05 exception.
- **D-12:** **Green is a cue only:** focus outline and the "Drag to rotate" hint. Not an edge highlight on the model, so the accent does not gain a fifth decorative use (Phase 1 P07 logged four).
- **D-13:** **Controls: pointer and touch drag orbit, arrow keys rotate when the viewer is focused, a Reset control, slow auto-rotate until the first touch.** Auto-rotate is off entirely under reduced motion and under the footer Pause control. No zoom, no pan, no scroll-hijack (horizontal-first drag, vertical scroll stays with the page on touch). Keyboard focus never traps.
- **D-14:** **Static image first, viewer lazy.** The page renders fully without the viewer: a greyscale render of the model as `<img>` with width and height, plus caption and links. WebGL2 viewer loads by dynamic import on this route only (on click or when near the viewport; planner chooses). WebGL unsupported or the chunk failing leaves the static image and nothing else breaks.
- **D-15:** **Viewer is raw WebGL2 (per STACK.md); research decides model format, decimation and size.** Escalate to OGL only if raw WebGL2 cannot meet the per-chunk cap or the format forces it; three.js only for loaders or post-processing the cap makes unaffordable. The viewer chunk obeys the per-lazy-chunk gate from Phase 6 D-08 (extend `scripts/measure-js.mjs`); the model file is a separate data asset with its own size budget set by research.
- **D-16:** **CAD source:** Yahya's Onshape document, opened by link without login: `https://cad.onshape.com/documents/abedb5644d206f1966ceab07/w/16e1ac37475a79f8f8a83c91/e/fa98af52c3491c90afc18920` (he also supplied the same element with `?renderMode=0&uiState=6aee41af6c245c3af0ec578d`). Research tries the anonymous export route first (glTF or STEP to mesh). If that is not reachable without credentials, Yahya exports a file into `docs/material/`; the plan then builds against a placeholder mesh until it exists. Not a new decision to publish: see the gate below.

#### Projects to deep-dive transition (added after the first context commit)
- **D-17:** **Row grows into the page.** Clicking a Projects row (Facturo, Atlantis, Robot firmware) expands that row to fill the screen and it becomes the deep-dive route's Display title (FLIP, same family as letters-to-rail). Back to Projects plays it in reverse, shrinking the title back into its row.
- **D-18:** **Scope is all three deep dives: Facturo, Atlantis, Robot.** This changes the shipped Facturo route (Phase 6): its Projects link, Back link, tests and visual baselines are updated. Plans must keep the Facturo deep dive working without the animation.
- **D-19:** **Constraints for planner/research:** (a) scale/size growth deviates from the one-motion-rule (horizontal, fast, no bounce); treat it as a deliberate, user-chosen exception, keep it fast and bounce-free, animate transform/opacity/clip-path only, and log the exception in PROJECT.md Key Decisions. (b) Routes are separate static pages: research must pick the mechanism (cross-document View Transitions with `@view-transition`, or a small client FLIP with the row measured before navigation) against browser support (Safari, LinkedIn in-app) and the JS budget. (c) Under reduced motion, and wherever the mechanism is unsupported, navigation is an instant change; no-JS is a plain link. (d) Interrupted/Back-button/mid-transition navigation must not leave inert or focus broken; focus lands on the deep-dive heading as in Phase 4. (e) The transition code is shared and obeys the 150 kB initial / ~12 kB lazy-chunk gates.

### Claude's Discretion
- Route-level layout details (title size, where the piece sits on the 12-column grid, caption wording) within the dark Swiss rules.
- Whether the Atlantis iframe fills the viewport width or sits on a grid span; aspect ratio from the game's native resolution.
- Exact per-chunk cap for the viewer, loading trigger (click vs near viewport), and the pipeline from CAD to the committed model asset.
- Names and location of new components (`components/proof/` or alongside `components/deep-dive/`) and of the model/game asset folders under `public/`.
- Visual regression baselines for the new routes and states (1440x900, 1366x768, 390x844, 320).
- Footer Pause control reuse for auto-rotate (see D-13).

### Plan-time gate (not discussed, must be resolved before publishing)
- **Licences and consent were not discussed in this session.** Success criterion 1 requires the asset licences of Atlantis (a fork of `plastikup/atlantis`) and teammates' consent to be confirmed before the game is published. Success criterion 2's robot CAD may belong to the CRC team; confirm Yahya may publish it. The planner must make "cleared" an explicit checkpoint plan with Yahya before any public build ships, and define what ships if a piece is not cleared (Atlantis: screenshots plus link; Robot: static image only).

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope. (Licences and consent were skipped by choice and are captured as a plan-time gate above, not deferred scope.)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PROOF-01 | Visitor can play Atlantis in the browser on its project page (single-thread Godot web export, loaded only on that page, with a screenshot and link fallback if too heavy; asset licences and teammates' consent checked first) | Measured export sizes and the fixes needed (Godot section); the broken-scene fix; exact CSP and headers proven in Chromium; Esc/Tab handling; touch verdict (keyboard required); the licence inventory (Freepik attribution, unknown music source, unreferenced Spider-Man image, Dialogic MIT notice); proposed threshold; e2e strategy with a stub game plus one real boot |
| PROOF-02 | Visitor can rotate a 3D model of the real CRC robot on the robot project (from Yahya's CAD file; lazy-loaded, static image first, page works without it) | Onshape probe (anonymous read yes, export no, owner is a teammate); glTF to quantized binary pipeline with gltf-transform 4.5.1 and meshoptimizer 1.3.0; mesh budget; raw WebGL2 viewer shape under 12 kB; still rendered by the same shader through Playwright; load trigger recommendation |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Next.js 16.4 App Router, React 19.3, TypeScript 6.0, `output: 'export'`, `trailingSlash: true`, deployed by the Vercel Git integration. No basePath. Headers (CSP, HSTS, etc.) live in `vercel.json`.
- CSS Modules plus `styles/tokens.css`, a 12-column grid. **No Tailwind**, no component kits.
- **No gesture or smooth-scroll library.** WebGL: **raw WebGL2** in a lazily `import()`ed client module with a static poster fallback. OGL only for meshes or point clouds that need it; three.js only for loaders or post-processing.
- **Self-host everything** (fonts, media); no hotlinked assets; strict first-party CSP.
- **Content: only verified, real facts**; no invented numbers. The game size line must be measured, never typed.
- **Accessibility:** WCAG contrast, keyboard, reduced motion.
- Testing: Vitest 5 (jsdom + Testing Library), Playwright 1.65 against built `out/`, `@axe-core/playwright`, Lighthouse CI. ESLint 10 flat config, Prettier 3.
- Initial JS ≤150 kB gzip per route; each lazy chunk ≤12 kB gzip (`pnpm measure:js`).
- GSD workflow: file changes only through GSD commands.
- Global rules: immutability, files <800 lines, functions <50 lines, TDD, 80% coverage, no hardcoded secrets, conventional commits, **no Co-Authored-By trailer** (user memory).

## Standard Stack

### Core

| Library / Tool | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Godot editor (local) | 4.5.1.stable.official.f62fdbde1 at `~/apps/godot-4.5.1` (not on PATH) [VERIFIED: `--version`] | Export Atlantis for the web | Matches the project's `config/features "4.5"`; renderer already `gl_compatibility` [VERIFIED: project.godot] |
| Godot web template | `web_nothreads_release.zip` from `Godot_v4.5.1-stable_export_templates.tpz` [VERIFIED: godot-builds release] | Single-thread engine (Emscripten 4.0.10) | No-threads is the default since 4.3 and needs no COOP/COEP [CITED: docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html] |
| Raw WebGL2 | browser built-in | Robot viewer | STACK.md decision; one mesh and one Lambert shader need no library |
| `@gltf-transform/core` + `functions` + `extensions` (dev only) | 4.5.1 [VERIFIED: npm registry, 2026-09-28] | Flatten, join, weld, simplify, quantize the CAD glTF at dev time | The standard glTF processing SDK; Node-only, never shipped |
| `meshoptimizer` (dev only) | 1.3.0 [VERIFIED: npm registry, 2026-09-25] | `MeshoptSimplifier` for `simplify()` | The simplifier gltf-transform uses [CITED: Context7 /donmccurdy/gltf-transform] |
| CSS cross-document View Transitions | Chrome/Edge 126+, Safari 18.2+, Android WebView mirrors Chrome; Firefox: preview only [VERIFIED: mdn/browser-compat-data `css.at-rules.view-transition`] | Row-to-title morph (D-17) | Zero JS, progressive; unsupported browsers navigate instantly, as D-19c requires |

### Supporting

| Tool | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@playwright/test` (existing) | 1.65.0 | Render the robot still at the start pose from the real shader; boot-test the game | Dev script and e2e |
| `sharp` / `scripts/build-media.mjs` (existing) | 0.35.5 | Grey WebP for the poster, screenshots and robot still | Existing pipeline |
| `DecompressionStream('gzip')` | browser built-in (Chrome 80, Safari 16.4, Firefox 113) [ASSUMED] | Optional: ship the mesh as `.bin.gz`, because Vercel does not compress `application/octet-stream` | Only if the raw mesh exceeds the budget |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Stock 4.5.1 web template | Custom template built with `scons platform=web threads=no disable_3d=yes optimize=size` plus disabled modules | Community reports put the engine at about 17 MB raw and 3-5 MB brotli [CITED: popcar.bearblog.dev/how-to-minify-godots-build-size] versus 6.5-9.3 MB measured here. It needs emscripten 4.0.10 and scons in a Podman container, which takes hours to set up. Atlantis has no 3D nodes [VERIFIED: grep of scenes], so `disable_3d` is safe. Use it only if the slimmed total stays over the threshold. |
| Custom binary mesh | `.glb` with KHR_mesh_quantization plus a hand GLB parser | A GLB parser costs about 1-2 kB more and the format adds nothing the viewer needs |
| Custom binary mesh | three.js `GLTFLoader` | three.js core alone is far above the 12 kB chunk cap; ruled out by D-15 |
| CSS cross-document VT | Client FLIP (measure the row, store it in `sessionStorage`, animate on the next document) | It needs JS on both documents, a hand-made snapshot of the old page (the old document is gone once the new one paints) and its own reduced-motion and interrupt logic. VT gives the old-page snapshot for free. |
| Same-origin iframe | Mount Godot directly in the page | The page would then need `'wasm-unsafe-eval'` and `blob:` in its CSP, and Godot's global listeners and canvas would leak into the site's DOM and focus model. The iframe isolates both (D-06 is locked anyway). |

**Installation (dev only):**
```bash
pnpm add -D @gltf-transform/core@4.5.1 @gltf-transform/functions@4.5.1 @gltf-transform/extensions@4.5.1 meshoptimizer@1.3.0
```
Nothing is added to `dependencies`.

## Measured Godot Export (Atlantis fork, 2026-11-12)

The export used `variant/thread_support=false`, `export_filter="all_resources"`, the stock template and the scratchpad clone of the fork (HEAD `7bdbcd8`) [VERIFIED: local export and measurement]:

| File | Raw | gzip -9 | brotli q5 (close to CDN on-the-fly) | brotli q11 |
|------|-----|---------|------|------|
| `index.wasm` (engine) | 38.03 MB | 9.26 MB | 7.61 MB | 6.50 MB |
| `index.pck` (game data) | 43.68 MB | 42.22 MB | — | 41.61 MB |
| `index.js` (loader) | 305 kB | 77 kB | — | 66 kB |
| worklets, html, icons, splash png | ~0.45 MB | — | — | — |

What fills the pck (imported sizes in `.godot/imported`) [VERIFIED]:

| Item | Size in pck | Fix (in the fork, web build only) |
|------|-------------|------------------------------|
| `assets/audio/music/Mermaids in Town.wav` (37 MB source, `compress/mode=2` = QOA) | 7.5 MB | Re-encode to Ogg Vorbis at about 96 kbps (track ≈ 211 s, so ≈ 2.5 MB). Source and licence are unknown (see Licences) |
| `assets/landing/beach.jpg` 6297×3529 | 4.1 MB | `process/size_limit=1920` + `compress/mode=1` (lossy) in its `.import` |
| `assets/station/spiderman.jpeg` 1280×1280, **not referenced by any scene** | 2.5 MB | Exclude (`exclude_filter`) or delete. It is also a copyright risk |
| `assets/landing/ocean_floor.jpg` 6500×2889 (Freepik) | 2.4 MB | size_limit + lossy |
| `addons/dialogic/Example Assets/**` and `Modules/**/preview.png` (editor previews) | ~3-5 MB | `exclude_filter="addons/dialogic/Example Assets/*,addons/dialogic/Modules/*/preview.png"` (check the game still runs) |
| 685 `.ctex` textures in total | 32.3 MB | Lossy WebP for photographic and painted textures; keep lossless for pixel-art tiles |

**Estimate after slimming:** a pck of roughly 15-20 MB [ASSUMED: arithmetic on the table above, to be measured], for a total transfer of about 23-30 MB with the stock engine. A custom template brings that to about 18-25 MB.

**Runtime checks in headless Chromium (swiftshader):**
- Under the current site CSP: `WebAssembly.instantiateStreaming(): ... violates ... 'unsafe-eval' is not an allowed source`; the engine never starts [VERIFIED].
- With `'wasm-unsafe-eval'`: the engine starts (`Build configuration: Emscripten 4.0.10, single-threaded, no GDExtension support`) and the title menu renders at 1280×720 [VERIFIED: screenshot].
- The remaining violation is `img-src blob:`, from the custom cursor or icon `createObjectURL(png)`. Adding `blob:` to `img-src` clears it [VERIFIED].
- After clicking "JOUER", level 1 loads with the dialogue box and the "Tab Inventaire" prompt [VERIFIED: screenshot].
- Non-fatal console errors remain:
  - `keyboard_get_keycode_from_physical: Not supported by this display server`: the key-label UI in the "TOUCHES" menu may show blank labels on the web.
  - `Node not found: "fishing_spot" (relative to /root/game_wrapper/levels/level5)`: an existing game bug.
- The game is in **French** ("JOUER / TOUCHES / QUITTER"). The native ratio is 16:9 (no `window/size` override, so 1152×648, `stretch/mode="viewport"`). `--stage-aspect: 16 / 9` is confirmed.

## Architecture Patterns

### System Architecture Diagram

```
                       Projects page (pager doc, /projects/)
                               | click row link (<a>, plain navigation)
                               v
         [pageswap: skip VT if reduced motion / motion paused / row off-screen]
                               |
      CSS @view-transition (old snapshot: row box + row name)  --unsupported/RM--> instant nav
                               v
  /projects/atlantis/ (static HTML: h1, poster, screenshots, lines, links; strict site CSP)
        |                                   |
        | GameStage island (route-only JS)  | no-JS / touch / not cleared / too heavy
        v                                   v
   WebGL2 check + (any-pointer: fine)?  --no-->  poster + "Best on desktop" / "can't run" line
        | yes
        v
   [Ready] --click Play--> create <iframe src="/games/atlantis/<v>/play.html">
                               |  (game path CSP: + 'wasm-unsafe-eval', img-src blob:, frame-ancestors 'self', XFO SAMEORIGIN)
                               v
        shell.js (first-party, external file) ---- Engine(config).startGame()
           |  capture-phase keydown on window: Escape --> postMessage {type:"escape"}
           |  onProgress(cur,total) --> postMessage {type:"progress", pct}
           |  first frame / start resolved --> {type:"ready"}
           |  onExit (QUITTER) --> {type:"exit"};  load error --> {type:"error"}
           |  message from parent {type:"mute", value} --> mute bridge
           v
   Parent (same origin, checks event.origin + event.source === iframe.contentWindow)
        progress -> status text + 2px bar | ready -> fade poster, focus iframe
        escape -> focus "Exit game"       | exit/Exit button -> remove iframe, focus "Play Atlantis"
        error -> error line + "Try again"

  /projects/robot/ (static: grey still <img>, lines, links)
        | IntersectionObserver (rootMargin 1 viewport) or click
        v
   import("viewer") [≤12 kB gz] --fetch--> /models/robot/<v>/robot.bin (quantized positions, normals, u16/u32 indices)
        | WebGL2 missing / fetch fail / context lost --> keep still, no console error
        v
   canvas crossfade over the still --> orbit (pointer/touch/keys), auto-rotate gate (RM, footer motion, in view, tab visible, untouched)
```

### Recommended Project Structure
```
app/projects/atlantis/page.tsx      # server page, mirrors app/projects/facturo/page.tsx
app/projects/robot/page.tsx
components/proof/                   # ProofRoute, ProofLinks, GameStage, ModelStage (UI-SPEC names)
lib/proof/game/                     # pure state machine (ready/loading/playing/exited/error/fallback), message protocol types
lib/proof/model/                    # orbit maths (pure), auto-rotate gate (pure), viewer.ts (WebGL2, lazy), mesh-format.ts (header parse)
lib/transition/                     # pageswap/pagereveal skip and interrupt helpers (inline script string, like JS_FLAG_SCRIPT)
content/atlantis.ts, content/robot.ts
public/games/atlantis/<version>/    # play.html, play.js, play.wasm, play.pck, play.audio*.worklet.js, shell.js
public/models/robot/<version>/robot.bin
scripts/export-atlantis.mjs         # documents and runs the Godot export (local only), writes the size JSON
scripts/build-robot-mesh.mjs        # glTF -> robot.bin (gltf-transform, dev only)
scripts/render-robot-still.mjs      # Playwright renders the start pose -> docs/material/photos/robot-still.png
godot/shell/play.html, godot/shell/shell.js   # custom HTML shell sources (copied into the export)
```

### Pattern 1: Custom Godot shell with no inline script
**What:** Set `html/custom_html_shell` to a template whose config lives in a non-executable JSON block and whose logic sits in an external `shell.js`. The game path's CSP can then drop `'unsafe-inline'` from `script-src`, which is stricter than the site's own policy.
**Placeholders available** [VERIFIED: grep of the 4.5.1 `godot.html`]: `$GODOT_URL`, `$GODOT_CONFIG`, `$GODOT_PROJECT_NAME`, `$GODOT_HEAD_INCLUDE`, `$GODOT_SPLASH`, `$GODOT_SPLASH_CLASSES`, `$GODOT_SPLASH_COLOR`, `$GODOT_THREADS_ENABLED`.
**Measured config:** `{"args":[],"canvasResizePolicy":2,"executable":"index","fileSizes":{"index.pck":43682240,"index.wasm":38034280},"focusCanvas":true,"ensureCrossOriginIsolationHeaders":true,...}`. Set `ensureCrossOriginIsolationHeaders` to false; it only matters for the PWA worker.
```html
<!-- godot/shell/play.html (export template; Godot substitutes $GODOT_*) -->
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>$GODOT_PROJECT_NAME</title>
  <style>html,body{margin:0;height:100%;background:#0b0b0b;overflow:hidden}canvas{display:block;width:100%;height:100%;outline:none}</style>
</head>
<body>
  <canvas id="canvas" tabindex="0">Atlantis</canvas>
  <script type="application/json" id="godot-config">$GODOT_CONFIG</script>
  <script src="$GODOT_URL"></script>
  <script src="shell.js"></script>
</body>
</html>
```
```js
// godot/shell/shell.js (first-party; copied next to play.html)
const ORIGIN = location.origin;
const post = (msg) => parent.postMessage(msg, ORIGIN);
// Godot's keydown listener is on the canvas and preventDefault()s every key;
// a window capture listener runs first, so Esc never reaches the game.
addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  e.preventDefault(); e.stopImmediatePropagation();
  post({ type: "escape" });
}, true);
const config = JSON.parse(document.getElementById("godot-config").textContent);
const engine = new Engine({
  ...config,
  onProgress: (cur, total) => post({ type: "progress", cur, total }),
  onExit: () => post({ type: "exit" }),
});
engine.startGame().then(() => post({ type: "ready" }), () => post({ type: "error" }));
```
Source: shape from Godot's default `godot.html` (onProgress, startGame, onExit present in `godot.js`) [VERIFIED: grep]. The `Engine` options object and the `startGame()` promise are [CITED: docs.godotengine.org HTML5 shell class reference], but check them against 4.5.1's `godot.js` while implementing.

### Pattern 2: Parent-side game controller (state machine plus message guard)
- Accept a message only when `e.origin === location.origin && e.source === iframe.contentWindow`, and the payload passes a closed `type` union check.
- Keep the states pure (`ready | loading | playing | exited | error | fallback`) in `lib/proof/game/state.ts`, unit-tested. The DOM layer only renders them.
- On **Exit**: remove the iframe (this frees the wasm heap and stops audio), restore the poster, focus "Play Atlantis".
- On **escape**: focus "Exit game" (UI-SPEC planner note).
- **Mute:** Godot calls `ctx.resume()` on its own audio context during input (`_godot_audio_resume` [VERIFIED: godot.js]), so suspending the AudioContext from outside does not hold. Two options:
  - (a) **Recommended:** a tiny GDScript autoload in the fork's web build that registers a `JavaScriptBridge` callback toggling `AudioServer.set_bus_mute(0, ...)`. Sample-playback buses honour mute (`_godot_audio_sample_bus_set_mute` exists [VERIFIED]). `JavaScriptBridge` does not need `'unsafe-eval'`; only `JavaScriptBridge.eval` does.
  - (b) A zero-game-change fallback: the shell wraps `window.AudioContext` before the engine loads and inserts a master `GainNode` between Godot's graph and `destination`. This is fragile, so use it only if the fork cannot change.

### Pattern 3: Non-overlapping Vercel header rules
Vercel's docs do not say which rule wins when two `headers` entries set the same key [VERIFIED: vercel.com/docs/project-configuration — not stated]. Negative lookahead in `source` is documented for redirects and rewrites, and capture-group syntax is required [CITED: same page]. So write disjoint rules:
```jsonc
{ "source": "/((?!games/).*)", "headers": [ /* today's strict CSP + XFO DENY + HSTS + nosniff + Referrer + Permissions */ ] },
{ "source": "/games/(.*)", "headers": [
  { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'; upgrade-insecure-requests" },
  { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
  { "key": "X-Robots-Tag", "value": "noindex" },
  { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" },  // only because the folder is versioned
  /* HSTS, nosniff, Referrer-Policy, Permissions-Policy (keep autoplay default; no camera/mic/geo) */ ] },
{ "source": "/models/(.*)", "headers": [ { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" } ] }
```
- `/projects/atlantis/` stays on the strict site rule. `frame-src` falls back to `default-src 'self'` there [ASSUMED: CSP3 fallback chain frame-src → child-src → default-src, standard]. Adding an explicit `frame-src 'self'` sitewide is optional and harmless.
- D-06 lists `X-Frame-Options: SAMEORIGIN` for the route itself. Research shows that is unnecessary, because the route is never framed. Keep DENY there and report the deviation for confirmation.
- `media-src blob:` is defensive; confirm it with the real-build CSP e2e and drop it if unused.
- Then run `curl -sI` against the preview deployment for `/`, `/projects/atlantis/` and `/games/atlantis/<v>/play.html` to confirm the headers.

### Pattern 4: Cross-document View Transition (D-17)
```css
/* styles/transition.css (global; both documents load it) */
@media (prefers-reduced-motion: no-preference) {
  @view-transition { navigation: auto; }
}
/* names are static and unique per document */
.row-atlantis-name, .dive-title-atlantis { view-transition-name: dive-title-atlantis; }
.row-atlantis-box,  .dive-surface-atlantis { view-transition-name: dive-surface-atlantis; }
::view-transition-group(*) { animation-duration: var(--dur-page); animation-timing-function: var(--ease-page); }
::view-transition-old(dive-title-atlantis) { animation: vt-out var(--dur-ui) linear both; }
::view-transition-new(dive-title-atlantis) { animation: vt-in var(--dur-ui) linear both; }
/* persistent chrome keeps its own name so it does not crossfade */
header.site-header { view-transition-name: site-header; }
```
- The group pseudo animates `transform`, `width` and `height` of a **snapshot layer**, not of live layout. For the surface, override the group animation with a `clip-path: inset()` keyframe to keep to the UI-SPEC's transform/opacity/clip-path rule.
- Support: Chrome/Edge 126+, Safari 18.2+ (iOS 18.2+), Android WebView follows Chrome; Firefox has `startViewTransition` (144) but no cross-document VT [VERIFIED: BCD]. Unsupported browsers do a plain navigation, which is exactly D-19c.
- **LinkedIn in-app:** on Android it uses the system WebView (Chromium, supported); on iOS it uses WKWebView, which uses the system WebKit, so iOS 18.2+ should work [ASSUMED: not tested inside the LinkedIn app]. It degrades to an instant change either way.
- **Inline script (≈0.5 kB, in the root layout next to `JS_FLAG_SCRIPT`):**
  - `pageswap`: `if (motionPaused || !rowInViewport(e.activation)) e.viewTransition?.skipTransition()`.
  - `pagereveal`: on `pointerdown`, `keydown` or `wheel` while `e.viewTransition` is running, call `skipTransition()` (D-19d interrupt); after `finished`, focus the h1 (Phase 4 rule).
  - `pageswap` is Chrome 124+ and Safari 18.2+; `pagereveal` is Chrome 123+ and Safari 18.2+ [VERIFIED: BCD].
- **Reverse:** "Back to Projects" is a push navigation to `/projects/`, so the pager document loads fresh. It must render the Projects page with the source row in its final place on first paint, or VT morphs to the wrong box. Use `<link rel="expect" href="#row-atlantis" blocking="render">` on `/projects/` [ASSUMED: Chrome 124+, and its Safari support is not verified] and suppress the opening animation when `document.referrer` or `navigation.activation.from` is a deep dive.
- **Browser Back** is a `traverse`. A bfcache restore fires `pagereveal` and VT can run, but scroll and pager state come back as they were left [MEDIUM].

### Pattern 5: Raw WebGL2 viewer reading a pre-baked mesh
**Binary format (`robot.bin`, little-endian):**

| Field | Layout |
|-------|--------|
| Header | 32 bytes: magic `RBT1`, `vertexCount u32`, `indexCount u32`, `indexType u8` (2 or 4), padding, `bbox min/max f32×6` |
| Positions | `Int16×4` normalized (w padding), quantized to the bbox |
| Normals | `Int8×4` normalized |
| Indices | `Uint16` or `Uint32` |

**Viewer:**
- Bind with `vertexAttribPointer(..., SHORT, true, 8, 0)` and `(BYTE, true, 4, 0)`. There is no parse step beyond typed-array views.
- Fragment shader: Lambert from the UI-SPEC key light, clamped so the unlit faces sit at `#4a4a4a` and lit faces at `#e0e0e0`. Read the clear colour from `--color-ground` with `getComputedStyle`.
- Handle `webglcontextlost` by falling back to the still.
- Run RAF only while auto-rotating or animating a step. Rendering is otherwise on demand, which saves battery and lets the page settle for e2e.

### Anti-Patterns to Avoid
- **Naming the export `index.html` under `public/`.** `scripts/measure-js.mjs` treats every `index.html` in `out/` as a route, and `/games/atlantis/<v>/` would become a crawlable URL. Export as `play.html`.
- **Relying on header-rule override order in `vercel.json`.** It is unspecified; use disjoint sources.
- **Calling `AudioContext.suspend()` from the parent for Mute.** Godot resumes it on the next input.
- **Letting `pnpm lint` and Prettier walk `public/games/**`.** The 305 kB minified Godot JS would fail `eslint . --max-warnings 0`. Add the folder to `globalIgnores` and `.prettierignore`.
- **Shipping the fork's HEAD scene unfixed.** The game world never loads.
- **Loading the real 50 MB game in every e2e test.** Stub `**/games/atlantis/**` with a fixture shell that speaks the same `postMessage` protocol, and keep one real boot test.
- **Animating `font-size` or real layout in the transition.** Use VT snapshot groups.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mesh decimation and welding | Your own edge-collapse simplifier | `@gltf-transform/functions` `weld()`, `simplify({ simplifier: MeshoptSimplifier, ratio, error })` | Topology-aware error metrics; CAD exports have thousands of tiny parts |
| glTF reading and flattening of an assembly | Custom glTF JSON walker | `NodeIO` + `flatten()` + `join()` + `dedup()` + `prune()` | Node transforms, instancing and accessor types are easy to get wrong |
| Old-page snapshot for the morph | `html2canvas`-style capture, `sessionStorage` rects | Cross-document View Transitions | The browser captures the outgoing document; nothing else can after unload |
| Engine boot, progress, audio unlock | A loader that fetches the wasm itself | Godot's `Engine` class in its own `play.js` | It handles `instantiateStreaming`, `fileSizes` progress, worklets and the IDBFS persistence that saves use |
| Game file compression | Precompressed `.br` files plus a hand-set `Content-Encoding` | Vercel's automatic compression (`application/wasm` is on the allowlist [CITED: vercel.com/docs/compression]) | A wrong `Content-Encoding` header breaks loading; the pck is incompressible anyway |
| Header verification | Trusting the `vercel.json` text | Unit pin (`vercel-config.test.ts`) plus `curl -sI` on the preview | Vercel rule matching is not fully documented |

**Key insight:** in this phase the hard parts (engine loading, snapshotting the old page, mesh simplification) are already solved by the platform or a dev-time tool. The phase's own code should be state machines, message guards and glue.

## Licences and Consent Inventory (input for the plan-time gate)

| Item | Finding | Risk | What the gate must decide |
|------|---------|------|---------------------------|
| Atlantis repo licence | No LICENSE in the fork or upstream (`licenseInfo: null`) [VERIFIED: gh] | Teammates hold copyright by default | Written OK from the teammates (upstream owner and contributors) to host a build |
| Freepik vectors (`sources.txt`: steel plates, porthole, sunken ship, metal labels) | Free Freepik/Magnific licence requires attribution and forbids redistribution or sublicensing of the content itself [CITED: magnific.com/legal/terms-of-use]; games are not explicitly covered | MEDIUM | Add a visible credit line on `/projects/atlantis/` (and in-game if possible); Yahya accepts the residual risk or the fallback ships |
| Black Ops One font (Google Fonts) | SIL OFL [ASSUMED: Google Fonts licence] | Low | None beyond keeping it embedded |
| `Mermaids in Town.wav` | No source recorded; web search found no match [VERIFIED: search, no result] | **HIGH, unknown** | Identify the source and licence, or ship the web build **without music** (also saves 7.5 MB) |
| `assets/station/spiderman.jpeg` | Unreferenced, but currently shipped in the pck [VERIFIED] | **HIGH** (third-party character art) | Exclude from the export (no decision needed) |
| Dialogic addon | MIT upstream, but **no LICENSE file in the copied addon** [VERIFIED: find] [ASSUMED: Dialogic is MIT] | Low | Include the MIT notice (credits page or `public/games/atlantis/<v>/LICENSES.txt`) |
| Controller Icons addon | MIT (`addons/controller_icons/LICENSE`, Ricardo Subtil) [VERIFIED]; icon art licence not checked [ASSUMED: CC0 Xelu pack] | Low | Include the notice |
| Robot CAD (Onshape) | Owner is **a different Onshape account (a teammate)**; `createdWithEducationPlan: true`; `anonymousAllowsExport: false`; `publicLinkable: false` [VERIFIED: anonymous API probe] | MEDIUM (consent plus Education-plan terms [ASSUMED: non-commercial use OK]) | The owner's consent and the owner's export (glTF) |

## Robot Pipeline (PROOF-02)

**Onshape access, probed anonymously on 2026-11-12** [VERIFIED]:
- `GET /api/v6/documents/{did}` returns 200 with `permission: ANONYMOUS_ACCESS`.
- `GET .../w/{wid}/elements` returns 200 with 213 elements (`Robot Assembly` = `fa98af52...`, plus many sub-assemblies, a "Field Representation" assembly and STEP blobs).
- `GET /assemblies/.../e/{eid}`, `/partstudios/.../gltf` and `/assemblies/.../gltf` all return **401 "Unauthenticated API request"**.
- **Conclusion:** the anonymous export route is closed. The D-16 fallback applies.
- **Who exports:** the owner, or Yahya signed in after the owner shares the document with export permission. In the UI: right-click the "Robot Assembly" tab, choose Export, then GLTF [CITED: help.sketchfab.com Onshape guide; onshape-public.github.io/docs/api-adv/translation]. STEP is a fallback, but it needs a STEP-to-mesh step (FreeCAD or CAD Exchanger, not installed).
- Export only the "Robot Assembly" element, not "Field Representation".

**Build script (`scripts/build-robot-mesh.mjs`, dev only):**
1. `NodeIO.read(docs/material/robot.gltf)`
2. `dedup()`, `flatten()`, `join()` (one mesh), `weld()`, then `simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.001 })` until under the triangle budget, then `prune()`
3. Drop all attributes except POSITION and NORMAL (recompute NORMAL with angle-weighting if missing)
4. Quantize into the `RBT1` layout and write `public/models/robot/<hash>/robot.bin`
5. Print triangles, vertices and bytes (raw and gzip)

**Budget (recommended, set by research):**

| Asset | Budget | Basis |
|-------|--------|-------|
| Triangles | ≤ 60,000 (target 40,000) | Visually smooth at ≤1440 px stage width for a mechanical assembly [ASSUMED] |
| `robot.bin` raw | ≤ 700 kB (≤ 65,535 vertices so Uint16 indices) | Vercel does not compress `application/octet-stream` [CITED: vercel.com/docs/compression allowlist]; 40k tris → ~0.24 MB indices + ~0.3 MB vertices |
| Viewer chunk | ≤ 6 kB gzip (gate 12 kB) | Shader strings + orbit + RAF + pointer/keys ≈ 3-5 kB [ASSUMED: estimate] |

If the raw file exceeds the budget, serve `robot.bin.gz` (still `application/octet-stream`) and decode with `new Response(res.body.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer()`. That adds no library.

**Still image:** `scripts/render-robot-still.mjs` serves `out/`, loads `/projects/robot/?still=1` (or a dev-only harness page) in Playwright Chromium, sets the start pose with auto-rotate off, and screenshots the canvas on `#0b0b0b` at 1440 wide. It writes to `docs/material/photos/robot-still.png`, and `build-media.mjs` turns that into WebP. Same shader, camera and light, so the still-to-live handoff shows no jump (UI-SPEC). Until the CAD exists, the 600×340 Onshape thumbnail is the placeholder.

**Load trigger (discretion): near-viewport.** Use `IntersectionObserver` with a one-viewport `rootMargin`. The stage is the page's dominant element and sits above the fold, so it loads on arrival. That is still lazy relative to every other route (the chunk and mesh are requested only from `/projects/robot/`), and it keeps auto-rotate (D-13) meaningful. The UI-SPEC already defaults to this.

## Atlantis Threshold Proposal (replaces the D-08 starting guess; Yahya confirms)

- **Embed if, after the fork slimming:**
  - total first-play transfer (wasm as compressed by Vercel + pck + js) is **≤ 25 MB**,
  - time from Play to the title menu is **≤ 12 s** on Playwright Chromium throttled to 25 Mbps / 20 ms RTT (a typical recruiter desktop),
  - and ≤ 4 s on a warm HTTP cache (replay).
- **Otherwise:** first try the custom template (`disable_3d`, `optimize=size`). If it still fails, ship the fallback (screenshots plus link).
- **Why not the starting guess:** "~10 MB brotli / 5 s on 4G" is unreachable. The stock engine alone is 7.6 MB at CDN-like brotli and 9.3 MB gzip, and Lighthouse "4G" (~1.6 Mbps effective) would take minutes for any Godot game. Click-to-play, a shown size and a progress bar make a 10-15 s desktop load acceptable [ASSUMED: UX judgement, needs Yahya's confirmation].
- **The size line:** `scripts/export-atlantis.mjs` writes `content/generated/atlantis-build.json` with `{ version, wasmGzip, pck, js, totalMB }`. Use the conservative total (gzip for wasm, raw for pck), and the page reads it. Never type the number by hand.

## Common Pitfalls

### Pitfall 1: The broken `ship.tscn` reference
**What goes wrong:** the game shows the title, then "JOUER" fails because the `game_manager` autoload did not compile.
**Why:** merge `52ee9b7` in the fork (and upstream) dropped the `28_u7rkd` ext_resource line.
**How to avoid:** a first fork task restores the line, re-exports, and boot-tests through to level 1.
**Warning signs:** `Parse Error ... ship.tscn:227` in the export log.

### Pitfall 2: Tab and Esc swallowed by Godot
**What goes wrong:** a keyboard trap (WCAG 2.1.2).
**Why:** Godot's canvas `keydown` handler calls `preventDefault()` on every key [VERIFIED: godot.js], and Atlantis binds Tab (inventory) and Esc.
**How to avoid:** the shell's window capture listener takes Esc, and the visible hint "Esc leaves the game" meets 2.1.2's "advised of the method" clause. Tab stays with the game. Esc's only in-game use is cancelling a key rebind (`selection_controles.gd:65`), which is an acceptable loss; optionally rebind it in the fork's web build.
**Warning signs:** an e2e test pressing Tab or Esc inside the frame never reaches "Exit game".

### Pitfall 3: Header rule overlap on Vercel
**What goes wrong:** the game path inherits `X-Frame-Options: DENY` or `frame-ancestors 'none'` and the iframe is blank; or the site gets `'wasm-unsafe-eval'`.
**How to avoid:** disjoint `source` patterns, a unit test that every route matches exactly one CSP rule, and `curl -sI` on the preview.
**Warning signs:** a "refused to display in a frame" console error.

### Pitfall 4: measure-js and the guard tests pick up the game
**What goes wrong:** `measure-js` lists `/games/atlantis/<v>/` as a route, ESLint fails on the minified engine JS, and Prettier rewrites it.
**How to avoid:** name the export `play.html`; add `public/games/**` (and `public/models/**`) to ESLint `globalIgnores` and `.prettierignore`; extend `measure-js` to report (not gate) the game payload and the model size against their own budgets.

### Pitfall 5: Big binaries in git
**What goes wrong:** each re-export adds about 40-60 MB to history.
**How to avoid:** version folders, re-export rarely, and consider Git LFS (Vercel supports LFS through a project setting [ASSUMED: verify in the Vercel dashboard]). Never let CI re-export (no Godot on Vercel or CI).

### Pitfall 6: Audio before the gesture
**What goes wrong:** the AudioContext warning appears and there is no sound.
**Why:** the iframe is created after the Play click. Whether the user activation carries into a newly created same-origin iframe varies by browser [ASSUMED].
**How to avoid:** the game's Godot audio unlock also resumes on the first in-game input (`_godot_audio_resume`). Test in Chromium and WebKit. If silent until the first key, accept it; the game needs a click anyway.

### Pitfall 7: View Transition morphs to an off-screen or not-yet-laid-out row
**What goes wrong:** the title flies in from off-screen, or the Projects pager paints the index page first.
**How to avoid:** the `pageswap` in-view check (skip if not in view); `blocking="render"` on the expected row on the reverse; suppress the opening when arriving from a deep dive.

### Pitfall 8: The robot viewer steals vertical scroll on touch
**How to avoid:** `touch-action: pan-y pinch-zoom` on the canvas, and decide on the first 8 px (UI-SPEC). Never call `preventDefault` on `touchmove` for vertical intent.

### Pitfall 9: Mesh with inverted or missing normals from the CAD
**How to avoid:** in the build script, recompute normals when absent. Render both faces (`gl.disable(gl.CULL_FACE)`) or check winding. Flat-shade fallback with `dFdx`/`dFdy` in the fragment shader if the normals look wrong.

## Code Examples

### Orbit maths (pure, unit-tested)
```ts
// lib/proof/model/orbit.ts — UI-SPEC: full-width drag = one turn, pitch clamp ±30°, key steps 15°/10°
export type Pose = Readonly<{ yaw: number; pitch: number }>;
export const PITCH_LIMIT = Math.PI / 6;
export const START_POSE: Pose = { yaw: -Math.PI / 5, pitch: Math.PI / 12 };
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export function dragTo(p: Pose, dx: number, dy: number, stageW: number, allowPitch: boolean): Pose {
  return {
    yaw: p.yaw + (dx / stageW) * 2 * Math.PI,
    pitch: allowPitch ? clamp(p.pitch + (dy / stageW) * 2 * Math.PI, -PITCH_LIMIT, PITCH_LIMIT) : p.pitch,
  };
}
export const keyStep = (p: Pose, key: string): Pose | null =>
  key === "ArrowLeft" ? { ...p, yaw: p.yaw - Math.PI / 12 } :
  key === "ArrowRight" ? { ...p, yaw: p.yaw + Math.PI / 12 } :
  key === "ArrowUp" ? { ...p, pitch: clamp(p.pitch + Math.PI / 18, -PITCH_LIMIT, PITCH_LIMIT) } :
  key === "ArrowDown" ? { ...p, pitch: clamp(p.pitch - Math.PI / 18, -PITCH_LIMIT, PITCH_LIMIT) } :
  key === "Home" ? START_POSE : null;
export const shouldAutoRotate = (s: Readonly<{ reducedMotion: boolean; motionOn: boolean; inView: boolean; visible: boolean; touched: boolean }>) =>
  !s.reducedMotion && s.motionOn && s.inView && s.visible && !s.touched;
```

### Message guard (parent)
```ts
// lib/proof/game/protocol.ts
export type GameMsg =
  | { type: "progress"; cur: number; total: number }
  | { type: "ready" } | { type: "exit" } | { type: "error" } | { type: "escape" };
export function readGameMsg(e: MessageEvent, frame: HTMLIFrameElement | null): GameMsg | null {
  if (e.origin !== window.location.origin || !frame || e.source !== frame.contentWindow) return null;
  const d = e.data as Partial<GameMsg> | null;
  switch (d?.type) {
    case "ready": case "exit": case "error": case "escape": return { type: d.type };
    case "progress": {
      const { cur, total } = d as { cur: unknown; total: unknown };
      return typeof cur === "number" && typeof total === "number" && total > 0 ? { type: "progress", cur, total } : null;
    }
    default: return null;
  }
}
```

### Godot export, scripted (local only)
```bash
# Isolate editor state from the user's config while exporting (used in this research):
XDG_CONFIG_HOME=$TMP/xdg/config XDG_DATA_HOME=$TMP/xdg/data XDG_CACHE_HOME=$TMP/xdg/cache \
  ~/apps/godot-4.5.1 --headless --path ~/dev/forks/atlantis --import
XDG_CONFIG_HOME=... ~/apps/godot-4.5.1 --headless --path ~/dev/forks/atlantis \
  --export-release "Web" public/games/atlantis/<version>/play.html
# Web preset: variant/thread_support=false, variant/extensions_support=false,
# custom_template/release=<path to web_nothreads_release.zip>, html/custom_html_shell=res://web/play.html,
# progressive_web_app/enabled=false, exclude_filter for Dialogic examples and spiderman.jpeg
```
The 9.4 MB `web_nothreads_release.zip` can be pulled from the 1.36 GB `.tpz` with HTTP range requests on the central directory, as done in this session, instead of downloading the whole archive.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Godot web needed SharedArrayBuffer and COOP/COEP | Single-thread export is the default; Web Audio "Sample" playback keeps latency low | Godot 4.3 [CITED: Godot web export docs] | No isolation headers; works in a same-origin iframe without `credentialless` |
| Godot 4 web: C# supported? | Still **no C# on web** in Godot 4 [CITED: same] | — | Atlantis is GDScript (fine) |
| SPA-only View Transitions | Cross-document VT with `@view-transition` | Chrome 126 (2024), Safari 18.2 (Dec 2024) [VERIFIED: BCD] | MPA morphs with no JS framework router |
| `'unsafe-eval'` for wasm | `'wasm-unsafe-eval'` | CSP3 (Chrome 95+, Safari 16+, Firefox 102+) [ASSUMED: versions] | Only wasm compilation is allowed; `eval` stays blocked (proven in the negative control) |

**Deprecated/outdated:**
- Godot "Forward Plus" or "Mobile" renderers on the web: unsupported; only Compatibility works [CITED]. Atlantis already sets `gl_compatibility`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Slimmed pck lands at about 15-20 MB | Measured Godot Export | The threshold decision moves; re-measure after slimming (it is a task, not a guess, in the plan) |
| A2 | 25 MB / 12 s threshold is acceptable UX for click-to-play | Threshold Proposal | Yahya may want stricter; the fallback still exists |
| A3 | User activation carries into the newly created iframe for audio | Pitfall 6 | Audio starts at the first in-game key instead; minor |
| A4 | LinkedIn iOS in-app (WKWebView) supports cross-document VT on iOS 18.2+ | Pattern 4 | It degrades to an instant navigation, which is acceptable per D-19c |
| A5 | `<link rel="expect" blocking="render">` is supported where VT is (Chrome 124+); Safari unknown | Pattern 4 | The reverse morph may target a not-yet-painted row in Safari; mitigated by the in-view and skip check |
| A6 | Viewer chunk ≈ 3-5 kB gzip | Robot Pipeline | The cap is 12 kB; plenty of margin |
| A7 | 40-60k triangles look smooth enough | Robot Pipeline | Tune the ratio; the budget is a knob |
| A8 | Freepik attribution on the page satisfies the free licence for a non-sold, non-downloadable game build | Licences | Legal ambiguity; Yahya decides at the gate (not legal advice) |
| A9 | Dialogic is MIT; controller icon art is CC0 | Licences | Credits wording |
| A10 | Onshape Education plan permits a personal, non-commercial portfolio render | Licences | Owner consent covers the practical risk |
| A11 | Vercel Git integration supports Git LFS | Pitfall 5 | Commit plain binaries instead (works, but bloats history) |
| A12 | Vercel's on-the-fly brotli for a 38 MB wasm is close to q5 and has no size cutoff | Measured Export | If not compressed, the transfer is 38 MB; **measure with `curl -sI -H 'Accept-Encoding: br'` on the preview** |
| A13 | `DecompressionStream`, `wasm-unsafe-eval` and CSP fallback versions as stated | Stack / State of the Art | Low; all are widely shipped |

## Open Questions (RESOLVED)

1. **Music provenance.** What we know: a 37 MB WAV titled "Mermaids in Town" with no recorded source. Unclear: its licence. Recommendation: ask Yahya and the teammates at the gate; default to shipping the web build muted of music (keep the SFX MP3s) if unknown. RESOLVED: gate row MUSIC in plan 08-01, default excluded, confirmed at the 08-01 checkpoint.
2. **Who exports the robot CAD.** What we know: the owner is a teammate's account, and anonymous export is off. Unclear: whether Yahya has an account with access. Recommendation: the gate plan asks the owner for a glTF export of "Robot Assembly" plus consent in one message. Until then, build against a placeholder (a simple procedural box-and-wheels mesh or the thumbnail-only still). RESOLVED: plan 08-16 checkpoint asks the owner for glTF plus consent; placeholder mesh until then (08-08).
3. **Vercel compression of the 38 MB wasm.** Measure on the first preview deployment; it determines the honest size line and the threshold check. RESOLVED: measured via `curl -sI` on the preview in plan 08-17; threshold decided at the 08-07 checkpoint.
4. **Do fork changes go to `Yahya-github/atlantis` (public) or a portfolio-only branch?** Recommendation: a `web` branch in the fork with the scene fix, web preset, shell, mute autoload and exclusions. The built export is committed into the portfolio repo under a version folder, and the version string is the fork commit SHA. RESOLVED: gate row FORK in 08-01 (default `web` branch in the fork), implemented in 08-06.
5. **The game is in French.** Should the Atlantis page say so (e.g. meta line "In French")? This is a copy decision for Yahya, and it is a verified fact. RESOLVED: gate row FRENCH in 08-01, applied in 08-09.
6. **D-06 header wording vs research.** Research recommends no header change on `/projects/atlantis/` itself (only `/games/**`). This needs the user's acknowledgement because D-06 named the route. RESOLVED: gate row D06 in 08-01; header split implemented in 08-05.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Godot editor | Atlantis export | ✓ (not on PATH) | 4.5.1.stable at `~/apps/godot-4.5.1` | — |
| Godot web export template | Export | ✗ (export_templates dir empty) | — | Range-extract `web_nothreads_release.zip` (9.4 MB) from the 4.5.1 `.tpz`, as done in research; or install templates from the editor |
| Atlantis fork | Export | ✓ | `~/dev/forks/atlantis` HEAD `7bdbcd8` (needs the scene fix) | — |
| Node / pnpm | Scripts | ✓ | 22.22.2 / 12.11.2 | — |
| Playwright Chromium | e2e, still render, game boot | ✓ | chromium-1254 cached; WebKit/Firefox only in the CI container | — |
| Podman / Docker | Custom Godot template (optional), visual baselines | ✓ | 5.8.8 / 29.9.2 | — |
| emscripten 4.0.10 + scons | Custom template only | ✗ | — | Container image if the custom template is needed; otherwise skip |
| Blender / FreeCAD | STEP→mesh only | ✗ | — | Use the Onshape glTF export (no STEP step needed) |
| Robot glTF from Onshape | PROOF-02 model | ✗ | — | Placeholder mesh plus thumbnail still until the owner exports |
| Atlantis screenshots | Poster and strip | ✗ (`links.md` "Still missing") | — | Capture from the real web build with Playwright (this research produced 1280×720 frames that way), then grey them with `build-media.mjs` |

**Missing dependencies with no fallback:** none blocking the code. Publishing is blocked only by the licence and consent gate and by the CAD file for the live model.

**Missing dependencies with fallback:** export template (range extract), screenshots (Playwright capture from the build), CAD (placeholder).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 5.1.0 (jsdom) + Playwright 1.65.0 (+ `@axe-core/playwright` 4.14.0) |
| Config file | `vitest.config.ts`, `playwright.config.ts` (webServer `serve out -l 4173`) |
| Quick run command | `pnpm test -- tests/proof-*.test.ts tests/vercel-config.test.ts` |
| Full suite command | `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm measure:js -- --max-gzip-kb 150 --max-chunk-kb 12 && pnpm test:e2e` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROOF-01 | Game state machine (ready/loading/playing/exited/error/fallback) transitions | unit | `pnpm test -- tests/proof-game-state.test.ts` | ❌ Wave 0 |
| PROOF-01 | Message guard rejects foreign origin, foreign source and malformed payloads | unit | `pnpm test -- tests/proof-game-protocol.test.ts` | ❌ Wave 0 |
| PROOF-01 | `/games/(.*)` CSP has `'wasm-unsafe-eval'`, `img-src blob:`, `frame-ancestors 'self'`, XFO SAMEORIGIN; every other path keeps the strict CSP and DENY; each path matches exactly one CSP rule; negative control | unit | `pnpm test -- tests/vercel-config.test.ts` | ✅ extend |
| PROOF-01 | No request to `/games/` on any route except after the Play click; none before Play on `/projects/atlantis/` | e2e | `pnpm test:e2e -- e2e/proof-isolation.spec.ts` | ❌ Wave 0 |
| PROOF-01 | Play, loading (progress), playing, Esc to "Exit game", Exit back to poster with focus on Play; Mute label toggles; no Tab trap outside the frame (stub game fixture) | e2e | `pnpm test:e2e -- e2e/atlantis.spec.ts` | ❌ Wave 0 |
| PROOF-01 | Real export boots to the title under the game CSP with zero violations (one slow test) | e2e | `pnpm test:e2e -- e2e/atlantis-real.spec.ts` | ❌ Wave 0 |
| PROOF-01 | Touch (`chromium-touch` project) shows the fallback line and no Play; JS off shows poster, screenshots, links and the noscript line | e2e | `pnpm test:e2e -- e2e/atlantis.spec.ts --project=chromium-touch` and `routes.spec.ts` (nojs) | ✅ extend `routes.spec.ts` |
| PROOF-01 | Size line equals the generated build JSON; content passes the never-on-the-site list | unit | `pnpm test -- tests/content.test.ts` | ✅ extend |
| PROOF-02 | Orbit maths: drag→yaw, pitch clamp, key steps, Home, touch yaw-only; auto-rotate gate truth table | unit | `pnpm test -- tests/proof-orbit.test.ts` | ❌ Wave 0 |
| PROOF-02 | Mesh header parse and quantized view sizes (fixture `.bin`) | unit | `pnpm test -- tests/proof-mesh.test.ts` | ❌ Wave 0 |
| PROOF-02 | Still renders with width/height; viewer chunk requested only on `/projects/robot/`; WebGL2 disabled (`--disable-webgl` launch arg or `getContext` stub) leaves the still and no console error; arrow keys and Reset change the pose; auto-rotate off under reduced motion and after Pause | e2e | `pnpm test:e2e -- e2e/robot.spec.ts` | ❌ Wave 0 |
| PROOF-02 | Viewer chunk ≤12 kB gzip; mesh ≤ budget | build gate | `pnpm measure:js -- --max-chunk-kb 12` (+ new `--max-model-kb`) | ✅ extend |
| D-17/18 | Forward and reverse transition: focus on h1 or the opening link; reduced motion = no `::view-transition` animation; interrupted transition leaves no transform or inert; Facturo works with VT disabled | e2e | `pnpm test:e2e -- e2e/dive-transition.spec.ts` (Chromium host; WebKit in the CI container) | ❌ Wave 0 |
| All | axe on both new routes (ready, playing-stub, live) at 1440×900 and 390×844; CSP zero violations on both routes | e2e | `pnpm test:e2e -- e2e/a11y.spec.ts e2e/csp.spec.ts` | ✅ extend |
| All | Sitemap has 9 URLs; robots disallows `/games/` | unit | `pnpm test -- tests/robots-sitemap.test.ts` | ✅ extend |
| All | New `"use client"` files on the allowlist | unit | `pnpm test -- tests/source-guard.test.ts` | ✅ extend |

### Sampling Rate
- **Per task commit:** the quick run command (unit tests touched by the task).
- **Per wave merge:** the full suite command.
- **Phase gate:** full suite green, plus `curl -sI` header checks on the Vercel preview and a manual play-through on desktop Chrome and Safari, before `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `e2e/fixtures/game-stub/play.html` + `shell.js`: speaks the `progress/ready/exit/error/escape` protocol with no wasm; served through `page.route('**/games/atlantis/**')`
- [ ] `tests/proof-game-state.test.ts`, `tests/proof-game-protocol.test.ts`, `tests/proof-orbit.test.ts`, `tests/proof-mesh.test.ts` (+ a tiny fixture `.bin`)
- [ ] `e2e/proof-isolation.spec.ts`, `e2e/atlantis.spec.ts`, `e2e/atlantis-real.spec.ts` (tagged slow), `e2e/robot.spec.ts`, `e2e/dive-transition.spec.ts`
- [ ] `e2e/csp.spec.ts`: inject the **path-specific** CSP (route the document by URL to the matching vercel.json rule), and add the game-path negative control (no `'wasm-unsafe-eval'` must produce a `script-src` violation)
- [ ] ESLint and Prettier ignores for `public/games/**` and `public/models/**`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No accounts |
| V3 Session Management | no | — |
| V4 Access Control | no | Static public content |
| V5 Input Validation | yes | `postMessage` guard (origin + source + closed type union); pointer and key input is numeric only |
| V6 Cryptography | no | — |
| V12 Files and Resources | yes | Only first-party versioned files; no user uploads; mesh parsed with bounds checks on header counts vs `byteLength` |
| V14 Configuration | yes | Per-path CSP in `vercel.json`, pinned by unit tests and verified on the preview; `frame-ancestors 'self'` only on `/games/**`; `X-Robots-Tag: noindex` on game files |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Clickjacking the game frame from another site | Tampering | `frame-ancestors 'self'` + `X-Frame-Options: SAMEORIGIN` on `/games/**` only; DENY everywhere else |
| Spoofed `postMessage` driving the parent UI | Spoofing | Check `e.origin === location.origin` and `e.source === iframe.contentWindow`; target origin set explicitly in the shell's `postMessage(msg, location.origin)` |
| CSP widening leaking to the whole site | Elevation | Disjoint header sources; a unit test that `'wasm-unsafe-eval'` appears in no rule except `/games/(.*)`; the existing negative control kept |
| `eval` reachable from wasm via `JavaScriptBridge.eval` | Elevation | No `'unsafe-eval'` in any policy (verified unnecessary); the mute bridge uses `create_callback`, not `eval` |
| Malformed mesh causing an out-of-bounds typed-array view | DoS | Validate header counts against `byteLength` before creating views; on mismatch, keep the still |
| Third-party copyrighted asset shipped in the pck | Repudiation/legal | Exclude `spiderman.jpeg`; licence gate; credits |

## Sources

### Primary (HIGH confidence)
- Local measurement: Godot 4.5.1 export of the Atlantis fork with the official `web_nothreads_release.zip`; gzip, brotli and Chromium CSP runs (this session)
- `github.com/godotengine/godot-builds` release `4.5.1-stable` (template asset sizes)
- `godot.js` 4.5.1 source (key handler `preventDefault`, `_godot_audio_resume`, `onExit`/`onProgress`, eval only in `_godot_js_eval`, worklet `addModule`)
- Onshape REST API anonymous probes on the document (2026-11-12)
- mdn/browser-compat-data: `css.at-rules.view-transition`, `api.Window.pagereveal_event` / `pageswap_event`, `api.Document.startViewTransition`
- https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html (4.7 docs: threads, Compatibility renderer, sample playback, custom shell, no C#)
- https://vercel.com/docs/compression (compression allowlist includes `wasm`, not `octet-stream`)
- https://vercel.com/docs/limits (static file uploads 100 MB on Hobby, CLI)
- npm registry: @gltf-transform/* 4.5.1, meshoptimizer 1.3.0
- Context7 `/donmccurdy/gltf-transform` (simplify, flatten, join usage)

### Secondary (MEDIUM confidence)
- https://vercel.com/docs/project-configuration/vercel-json#headers (no stated precedence; negative lookahead documented for redirects and rewrites)
- https://www.magnific.com/legal/terms-of-use (Freepik free licence: attribution, no redistribution)
- https://help.sketchfab.com/en/articles/16152761-onshape and https://onshape-public.github.io/docs/api-adv/translation (Onshape glTF export)
- https://popcar.bearblog.dev/how-to-minify-godots-build-size/ (custom template size reductions)

### Tertiary (LOW confidence)
- Godot forum and Reddit progress reports on 4.3 web wasm sizes (≈40 MB raw, ≈5 MB brotli), consistent with the local measurement
- Web search for "Mermaids in Town" (no match found)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH. Versions verified; Godot measured locally.
- Godot export and CSP: HIGH. Proven in Chromium with a negative control.
- Robot pipeline: MEDIUM. Access is verified, but there is no CAD file yet, so the triangle and size budgets are estimates.
- View Transitions: MEDIUM. Support is verified in BCD; reverse and traverse behaviour with the pager needs a spike.
- Licences: MEDIUM to LOW. Findings are verified; interpretation needs Yahya and the teammates.

**Research date:** 2026-11-12
**Valid until:** 2026-12-12 (Godot 4.5.1 pinned; re-check VT support and Vercel docs if delayed)
