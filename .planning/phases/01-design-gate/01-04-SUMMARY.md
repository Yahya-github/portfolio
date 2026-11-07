---
phase: 01-design-gate
plan: 04
subsystem: material
tags: [material, resume, photos, screenshots, links]
requires: []
provides:
  - docs/material/resume-public.pdf (public resume, no phone, no contest-platform bullet)
  - docs/material/links.md (contacts, project and proof links, inventory, missing list)
  - docs/material/photos/ (4 event photos + robot CAD thumbnail, each with -grey derivative)
  - docs/material/screenshots/ (10 Facturo demo screenshots, each with -grey derivative)
affects: [01-06 v7 sketch, 01-07 decisions, Phase 6 media, Phase 7 copy]
tech-stack:
  added: []
  patterns: ["magick -auto-orient -strip (+ -colorspace Gray for -grey derivatives)", "resume re-render from source JSON in a container temp dir"]
key-files:
  created:
    - docs/material/resume-public.pdf
    - docs/material/links.md
    - docs/material/photos/
    - docs/material/screenshots/
  modified: []
decisions:
  - "Public resume re-rendered from the JobOps resume JSON (read-only) with the same ultra-compact Typst theme instead of a Studio re-export; JobOps source untouched"
  - "AG logo not used; Atlantis = 2-3 greyscale screenshots + repo link; CCC 75/75 a regular line (Claude recommendations, Yahya may override at 01-07)"
metrics:
  duration: 12 min
  completed: 2026-11-07
  tasks: 3
  files: 33
---

# Phase 1 Plan 04: Collect the real material Summary

Public resume re-rendered from JobOps source without the phone and contest-platform bullet, four metadata-stripped event photos, a robot CAD thumbnail and ten fictional-data Facturo screenshots (each with a greyscale derivative), plus `links.md` with every contact, project and proof link checked live.

## Task 1 reply (Yahya, verbatim)

> "resume: I changed the 2025 and you can import it from job ops remove the phone, add Yahya Hallani as author; crc-bullet: removed; email: ok; facturo: it's inside the github README (https://github.com/Yahya-github/facturo-demo); robot: here's the CAD (https://cad.onshape.com/documents/abedb5644d206f1966ceab07/w/16e1ac37475a79f8f8a83c91/e/fa98af52c3491c90afc18920); atlantis: there's the Godot game on the repo, so you tell me if we do screenshots or something else; ag-logo: see if it's necessary or it would be noise. ccc: there is no technical proof of that so that's why no need to make it giant or the main thing in particular. Give me your honest opininion; game-competition: https://www.neomedia.com/vaudreuil-soulanges/actualites/education/657299/l-intercollegial-de-creation-de-jeux-video-au-cegep-de-valleyfield [Image #2], https://www.cegepvalleyfield.ca/le-college-andre-grasset-grand-gagnant-de-la-10e-edition-de-licjv/ (2 articles with my face and team showing us as the winners); diro-hackathon: https://diro.umontreal.ca/departement/nouvelles/nouvelle/news/detail/News/une-participation-remarquable-au-hackathon-2026-du-diro/, https://www.addiroum.org/nouvelles/hackathon-du-diro-edition-2026 and the linkedin post with my face https://lnkd.in/p/gTbbxFTJ [Image #1]; crc-2026: [Image #3] all the trophies of CRC of the team, [Image #6] Winning our school Club of the Year; github-links: the robot code needs to be private, atlantis is public, hackathon diro also needed to be private during the competition so no github."

Claude recommendations given to Yahya (Yahya may override at 01-07):
- Atlantis: 2-3 greyscale screenshots from the Godot project + public repo link; later a short muted loop clip; no in-page playable embed (at most a "Play" link later).
- AG logo: no (noise; team identity already visible on the shirts in the CRC photo).
- CCC: keep 75/75 as a regular line, not the giant poster number, because it has no public proof link; leans Achievements variant (b). Design doc not edited (01-07 owns that choice).

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Yahya names his material (checkpoint) | n/a (answered via orchestrator) | none |
| 2 | Copy material, strip metadata, verify resume | fd5e14f | resume-public.pdf, photos/ (10 files), screenshots/ (20 files) |
| 3 | Write links.md | ec68f74 | docs/material/links.md |

## Resume

- Source: resume JSON from `design_resume_documents.resume_json` in `/home/atlas/services/jobops/data/jobs.db`, opened with `sqlite3 'file:...?mode=ro'`. The edited copy lived in the scratchpad; the render ran in the `job-ops` container under `/tmp/portfolio-public` (not a mounted path) with the app's own `buildResumeRenderDocument` + `buildTypstDocument` and the `ultra-compact` theme, then `typst compile`. The temp dir was deleted afterwards. **Nothing was written under /home/atlas/services/jobops.**
- Text diff against the current JobOps export (`design_resume_current.pdf`): exactly two changes, the phone dropped from the header line and the "Built 6 full-stack features for the contest platform ..." bullet removed. The header renders cleanly (`email | LinkedIn | GitHub`, no dangling separator); still one page.
- Checks: no phone pattern, no "May 2023", no "contest platform"; `pdfinfo` Author = Yahya Hallani, Title "Yahya Hallani - Resume", Creator Typst 0.14.2; XMP has only title/creator/dates/hash-based document ids (no tenant or job ids); `strings | grep -c 'M K'` = 0.
- Freelance entry ("Self-Employed, Freelance Software Developer") reads **"May 2025 - Present"** (the plan wording was "2025 – Present"; the month is included).
- Notes on remaining resume claims vs site facts (not edited, for Phase 7 copy): the awards line reads "1st Place - Canadian Robotics Competition, Programming (lead programmer); 2nd Place the next year" dated "2025, 2026", while the robot project line says "1st Place | Sep 2025 - Feb 2026"; the resume does not list "CRC robot 1st 2026" as its own award. The CRC experience entry still mentions authoring problems "for the upcoming CRC 2027 provincial programming competition", which is consistent with the site rule.

## Deviations from Plan

1. **[Rule 3 - Blocking] Resume made by re-rendering instead of a Studio re-export.** The plan assumed Yahya would re-export; he asked Claude to import from JobOps. The DB is read-only for Claude, so the public copy was re-rendered from the source JSON with the identical theme (see Resume). The exiftool + Ghostscript metadata steps were unnecessary because Typst already wrote Author "Yahya Hallani" and no old revision exists.
2. **Material came as a repo README, a CAD link and pasted images, not file paths.** Facturo screenshots were downloaded from `raw.githubusercontent.com/Yahya-github/facturo-demo/main/docs/screenshots/*.webp` (all 10 referenced in the README), viewed, confirmed fictional ("Demo Transport Inc."; the README states all data is fictional), converted to PNG and stripped. Photos were the four distinct pasted images (4.png and 5.png are byte-identical to 6.png, ignored), saved as JPG q90 with descriptive names.
3. **Robot: Onshape thumbnail captured.** The CAD document allows anonymous link access, so its 600x340 document thumbnail was fetched from the Onshape thumbnail API without login and saved as `photos/robot-cad-01.png` (+ grey). A higher-resolution capture is listed as "to capture".
4. **Atlantis: no images.** Godot is not installed here, so no screenshots were captured or fabricated; links.md lists them as "to capture" and carries the SC-4f waiver line quoting Yahya.
5. The plan's "Atlantis (fork)" entry was kept after confirming the repo is a public fork of `plastikup/atlantis`.

## Link checks (2026-11-07)

All returned 200 (lnkd.in after 1 redirect to a linkedin.com/posts URL), except the LinkedIn profile, which returns 999 to scripted requests (LinkedIn bot wall, not a broken link). No failures.

## Verification

- Task 2 verify command: OK. `exiftool -if '$GPSLatitude'` sweep: empty. All `*-grey.*` files are `Gray`. One PDF at the top level. No passport/transcript/client_secret/ICPCId in `git ls-files`. Nothing taken from ~/Downloads.
- Task 3 acceptance: all greps pass; phone pattern count 0; every file in docs/material is named in links.md; SC-4f loop prints nothing.
- `check.sh SC-4a SC-4b SC-4c SC-4d SC-4e SC-4f`: six PASS lines.

## Known Stubs

None. Missing items (Atlantis screenshots, higher-res robot CAD capture, physical robot photo, CRC article, CCC proof, original portrait) are listed by name in links.md "Still missing".

## Threat Flags

None. The photos are group photos with teammates, already public through the listed articles/posts (noted in links.md).

## Self-Check: PASSED
