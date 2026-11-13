# Phase 8 clearance and decisions

Nothing from Phase 8 is pushed to GitHub (no branch push, no PR; Vercel previews are public) until plan 08-17. Plans 08-02 to 08-16 read the Decisions table below.

## Decisions

| KEY | value | default | source |
|-----|-------|---------|--------|
| THRESHOLD | embed if first-play transfer <= 25 MB AND Play-to-title <= 12 s at 25 Mbps / 20 ms RTT AND warm replay <= 4 s; else try custom template; else fallback | embed if first-play transfer <= 25 MB AND Play-to-title <= 12 s at 25 Mbps / 20 ms RTT AND warm replay <= 4 s; else try custom template; else fallback | RESEARCH Threshold Proposal; replaces D-08's 10 MB / 5 s guess, which no Godot 4 stock build can meet |
| D06 | split | split: only `/games/(.*)` gets `'wasm-unsafe-eval'`, `img-src blob:`, `frame-ancestors 'self'`, `X-Frame-Options: SAMEORIGIN`; `/projects/atlantis/` keeps the site CSP and `X-Frame-Options: DENY` (frame-src falls back to default-src 'self'). Alternative `literal`: also give `/projects/atlantis/` an explicit `frame-src 'self'` and `X-Frame-Options: SAMEORIGIN` through a third disjoint rule | RESEARCH Open Questions (D-06 names the route itself, only /games/ needs the change) |
| FORK | web-branch | web-branch (branch `web` in ~/dev/forks/atlantis with the ship.tscn fix, web preset, mute bridge, exclusions; version string = fork commit SHA, 12 chars) | RESEARCH Open Questions |
| BINARIES | plain | plain (versioned folders committed as plain files at the gate). Alternative `lfs` | RESEARCH Open Questions |
| FRENCH | yes | yes (Atlantis meta gains the line "In French") | RESEARCH Open Questions |
| MUSIC | none | none (web build ships without "Mermaids in Town"; SFX kept). Alternative `ogg`, only if the source and licence are identified | RESEARCH Licences and Consent Inventory |
| ROWLINK | Play | Play. Alternative `Play Atlantis` (UI checker flag) | UI-SPEC Copywriting Contract |
| ACCENTS | facturo=#e8c547 atlantis=#5fa8f0 robot=#f2685c; scope=main+footer of each deep dive (links, focus ring, rules, Play button, footer Back link); header and rail keep green | facturo=#e8c547 atlantis=#5fa8f0 robot=#f2685c; scope=main+footer of each deep dive (links, focus ring, rules, Play button, footer Back link); header and rail keep green | Coordinator requirement 2026-11-12 |
| PICTURES | grey | grey (pictures on deep dives are pre-converted greyscale WebP, DSGN-05). Alternative `colour` | Coordinator requirement 2026-11-12 |

## Flagged deviations (coordinator requirement 2026-11-12)

- "UI-SPEC Color reserves one accent (#5fae84) for a fixed list; per-project accents replace it inside deep-dive main and footer. Measured contrast on #0b0b0b: yellow #e8c547 11.72:1 (about oklch(83% 0.15 92)), blue #5fa8f0 7.82:1 (about oklch(71% 0.13 250)), red #f2685c 6.48:1 (about oklch(68% 0.17 28)). Tokens are hex because tests/contrast.test.ts parses hex; the oklch values are documented beside them."
- "UI-SPEC says the lean routes have no section rules and the hair colour is header-only; the new requirement adds one 1px accent rule on each deep dive (Facturo: its section rules turn accent)."
- "UI-SPEC lists Play Atlantis and the footer Back link as accent on hover/focus only; the new requirement shows them in the project accent at rest."
- "D-12 'Drag to rotate' cue stays the robot page's accent text; it becomes red instead of green."
- "Pictures: Atlantis gains the existing team photo (achievements/game-competition-2026-team-grey, already public on Achievements) next to the screenshots; Robot gains the existing CRC 2026 trophies photo (achievements/crc-2026-trophies-grey) next to the CAD still. No new photo of a person is added."

## Inventory

| item | finding | status | ships if not cleared |
|------|---------|--------|----------------------|
| Atlantis repo licence | No LICENSE file; teammates' written OK needed | pending | poster + screenshots + Code link |
| Freepik vectors | Credit line required | pending | poster + screenshots + Code link |
| Black Ops One font | OFL | pending | poster + screenshots + Code link |
| Mermaids in Town.wav | Source and licence unknown; excluded by default | pending | poster + screenshots + Code link |
| spiderman.jpeg | Excluded, no decision | excluded | poster + screenshots + Code link |
| Dialogic addon | MIT notice required | pending | poster + screenshots + Code link |
| Controller Icons addon | MIT notice required | pending | poster + screenshots + Code link |
| Robot CAD | Owner is a teammate's Onshape account; consent plus owner's glTF export of "Robot Assembly" only | pending | still image only |

## Message to teammates (draft)

Hi,

I am putting together my portfolio at yahya-hallani.dev and I would like to ask you three things.

1. Atlantis: may I host a playable web build of the game on my site? It would credit all of us, it would not be sold, and there would be no download.
2. Music: where does "Mermaids in Town" come from, and what is its licence? Until I know, the web build ships without it.
3. Robot (for whoever owns the Onshape account): may I show a rotatable grey render of the CRC 2026 "Robot Assembly" on the site? I would also need a glTF export of that tab only. In Onshape, right-click the "Robot Assembly" tab, choose Export, then GLTF. I will save it as docs/material/robot.gltf or robot.glb.

A written yes by message is enough. Thanks!

Yahya

## Gate record

Atlantis: pending
Robot: pending
