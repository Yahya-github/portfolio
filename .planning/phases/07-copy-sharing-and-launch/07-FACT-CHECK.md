# Phase 7 Fact Check

Sources: public/yahya-hallani-resume.pdf (sha256 b7b7bf90a32d40d4df12f83c4f052d641f8ecf1740dfa2c6d01cb313efa6dbfa), docs/material/links.md, portfolio-voice-and-facts skill. Created 2026-11-12.

Status key: consistent (site and source agree), MISMATCH (site and source disagree), omission (source has it, other side lacks it), needs-confirmation (number or fact Yahya must confirm, D-03), unsourced (no written source found).

## Claims

| ID | Claim (verbatim) | Where | Source | Status | Confirmed by Yahya |
|----|------------------|-------|--------|--------|--------------------|
| C-01 | 75/75, Canadian Computing Competition, perfect score, 2026 | content/achievements.ts lines[0] | Resume: "Perfect Score - 75/75, Canadian Computing Competition, University of Waterloo ... 2026" | confirmed | confirmed 2026-11-12 |
| C-02 | 1st of 18 teams from 9 CEGEPs, $2,500 team scholarship, 2026 (DIRO Hackathon, Université de Montréal) | content/achievements.ts lines[1] | Resume: "1st Place - DIRO Hackathon, Université de Montréal (1st of 18 teams from 9 CEGEPs; $2,500 team scholarship) 2026" | confirmed | confirmed 2026-11-12 |
| C-03 | DIRO article link and photo caption "The winners with their certificates" | content/achievements.ts lines[1].href, preview | Skill fact (DIRO win); article URL not in resume | confirmed | confirmed 2026-11-12 |
| C-04 | 1st, Intercollegiate Video Game Creation Competition, with Atlantis, a 2D game in Godot 4, 2026 | content/achievements.ts lines[2] | Resume: "1st Place - Intercollegiate Video Game Creation Competition (Atlantis, 2D game built in Godot 4) 2026" | consistent | |
| C-05 | 1st, Canadian Robotics Competition, robot competition, 2026 | content/achievements.ts lines[3] | Skill: CRC robot 1st in 2026 (confirmed by Yahya). Resume: "CRC 2026 Competition Robot ... 1st Place" | consistent | |
| C-06 | Photo caption "Our school's Club of the Year" | content/achievements.ts lines[3].preview | Instagram post link only; no written source | confirmed | confirmed 2026-11-12 |
| C-07 | 1st in Programming in 2025, 2nd in Senior Programming in 2026 | content/achievements.ts lines[4] | Resume: "1st Place - Canadian Robotics Competition, Programming (lead programmer); 2nd Place the next year ... 2025, 2026". Skill: confirmed by Yahya | consistent | |
| C-08 | Facturo: "more than 700 tests" | content/projects.ts flagship.lines[1]; content/facturo.ts metaDescription, sections[2]; content/site.ts sections[2].description | Resume: "backed by 700+ tests (pytest, Playwright e2e, ...)" | confirmed | confirmed 2026-11-12 |
| C-09 | Facturo, Developer, "Jun 2026 to Oct 2026", ended | content/experience.ts work[2]; content/facturo.ts meta[1] | Resume: "Facturo - Local-First Invoicing App ... Jun 2026 - Present" | MISMATCH, resolved | decision F-1: ended Oct 2026, resume re-exported with "Jun 2026 - Oct 2026" (3609cd6), site stays, 2026-11-12 |
| C-10 | Facturo is "for a Quebec trucking company", local-first, TPS/TVQ, Excel/PDF, reconciles supplier payments | content/projects.ts flagship; content/facturo.ts sections | Resume Facturo bullet 1 | consistent | |
| C-11 | Local vision model reads handwritten tickets, misreads snapped by edit distance, uncertain fields left blank | content/facturo.ts sections[1] | Resume Facturo bullet 2 (Ollama) | consistent | |
| C-12 | GitHub Actions and PyInstaller releases, SHA-256-verified in-app updates, rollback | content/facturo.ts sections[1] | Resume Facturo bullet 3 | consistent | |
| C-13 | Facturo demo repo https://github.com/Yahya-github/facturo-demo, fictional data | content/facturo.ts links.items[0] | Skill fact; docs/material/links.md | confirmed | confirmed 2026-11-12 |
| C-14 | MAME Tool Rental: tool and machine rental, admin dashboard, FastAPI and Next.js, deployed only after every test passes, "Built for MAME, in use at MAME" | content/projects.ts rows[0] | Skill fact only; not on the resume | confirmed | confirmed 2026-11-12 |
| C-15 | MAME Tool Rental, Developer, "Since Nov 2026", McGill Association of Mechanical Engineers | content/experience.ts work[0] | Skill fact; resume has no MAME entry | omission, resolved | decision F-3: MAME Tool Rental added to this repo's resume PDF only (3609cd6), 2026-11-12 |
| C-16 | MAME live site https://mame-tool-rental.vercel.app/ | content/projects.ts rows[0].link | Skill fact; docs/material/links.md | confirmed | confirmed 2026-11-12 |
| C-17 | Atlantis: 2D game in Godot 4, built with a team | content/projects.ts rows[1].lines[0] | Resume Atlantis entry; skill | consistent | |
| C-18 | Atlantis: "Architected 6 gameplay systems" | content/projects.ts rows[1].lines[1] | Resume: "Architected 6 gameplay systems" | confirmed | confirmed 2026-11-12 |
| C-19 | Atlantis: 1st place, Intercollegiate Video Game Creation Competition 2026 | content/projects.ts rows[1].lines[2] | Resume: "Atlantis ... 1st Place | Jan 2026" | consistent | |
| C-20 | CRC problems: 12 algorithmic problems for CRC 2027 | content/projects.ts rows[2].lines[0] | Resume: "Authored 12 algorithmic problems ... CRC 2027" | confirmed | confirmed 2026-11-12 |
| C-21 | CRC problems: author, volunteer since February 2026 | content/projects.ts rows[2].lines[1]; content/experience.ts work[3] ("Since Feb 2026") | Resume: "Feb 2026 - Present ... (Volunteer)" | consistent | |
| C-22 | CRC problems: reference solutions and 20+ edge-case tests each, in C++ and Python | content/projects.ts rows[2].lines[2] | Resume: "20+ edge-case tests per problem in C++ and Python" | confirmed | confirmed 2026-11-12 |
| C-23 | Robot firmware: CRC 2026 robot, embedded state machine in C/C++, PID tuning, 1st place, 2026 | content/projects.ts rows[3] | Resume: "CRC 2026 Competition Robot ... 1st Place | Sep 2025 - Feb 2026" | consistent | |
| C-24 | Team site https://agisback.crcrobotics.com/fr/ | content/projects.ts rows[3].link | Skill fact; docs/material/links.md | confirmed | confirmed 2026-11-12 |
| C-25 | Showdown AI: "In progress, nothing built yet" | content/projects.ts rows[4] | Skill fact (planned on Metamon, never shown as built) | consistent | |
| C-26 | Mercor, Coding agent evaluator, "Since Sep 2026", contractor | content/experience.ts work[1] | Resume: "Mercor ... Sep 2026 - Present, Coding Agent Evaluator (Contractor)" | consistent | |
| C-27 | Freelance developer, "Since 2025" | content/experience.ts work[4].date | Resume: "Self-Employed ... May 2025 - Present". Skill note "May 2023" is stale | consistent | decision F-2: keep Since 2025, 2026-11-12 |
| C-28 | Freelance: "12 projects for 9 clients" | content/experience.ts work[4].organisation | Resume: "Delivered 12 projects for 9 clients" | confirmed | confirmed 2026-11-12 |
| C-29 | Involvement: Software, McGill Robotics; Full-stack, GDG at McGill (subteam project); Competitor, McGill Compete, ICPC NENA | content/experience.ts involvement | Skill fact (ICPC NENA confirmed); not on the resume | confirmed | confirmed 2026-11-12 |
| C-30 | Software Engineering at McGill (role line) | content/site.ts roleLine | Resume: "Bachelor of Engineering, Software Engineering (Co-op)", McGill, May 2026 - May 2030 | consistent | |
| C-31 | Contact: yahya.hallani.email@gmail.com, linkedin.com/in/yahya-hallani, github.com/Yahya-github | content/site.ts contact | Resume header line | consistent | |
| C-32 | About paragraph (Pokemon and Chess, Pokemon Showdown, automated morning debrief, lecture notes, jobs search, Minecraft modpacks SkyFactory 4 and StoneBlock 3) | content/about.ts paragraph | Yahya's own final wording, pasted in chat 2026-11-12, placed verbatim (only a double space collapsed) | confirmed | confirmed 2026-11-12 |
| C-33 | About big title "TWO PASSIONS" (rows TWO / PASS / IONS), heading name "Two passions", lead "Strategy and automations" (replaces the "Two habits" placeholder) | content/about.ts title, titleRows, lead | Yahya, pasted in chat 2026-11-12. The 07-06 mapping: BIG TITLE to titleRows and accessible name, Title to lead | confirmed | confirmed 2026-11-12 |
| C-37 | About links: "Pokemon Showdown" to https://pokemonshowdown.com and "Minecraft" to https://www.minecraft.net | content/about.ts paragraphLinks | Yahya, chat 2026-11-12 | confirmed | confirmed 2026-11-12 |
| C-38 | About meta description "Two passions, strategy and automations: competitive Pokemon, Chess and Minecraft automation modpacks." (derived from C-32/C-33 so the old "Two habits" line is not shipped) | content/site.ts sections[4].description | Derived by Claude from Yahya's About words, no new facts | needs-confirmation | pending Yahya (flagged in 07-06 SUMMARY) |
| C-39 | Resume PDF MAME entry: "1,300+ tests", FastAPI/SQLite/Next.js/React, 20 MB drawing uploads, "Nov 2026 - Present" | public/yahya-hallani-resume.pdf Projects | Yahya's own JobOps resume JSON (read-only), read 2026-11-12 | confirmed | text is Yahya's own; F-3 approved adding it |
| C-34 | Portrait alt "Yahya Hallani at DevFest Montreal 2026" | content/about.ts portraitAlt | docs/material/portrait-devfest-2026-*.jpg filenames | confirmed | confirmed 2026-11-12 |
| C-35 | Resume PDF (public download) shows Atlantis "about 770 of 1,900 lines" of GDScript | public/yahya-hallani-resume.pdf, Atlantis bullet | Skill rule: no Atlantis line counts on the site | MISMATCH, resolved | decision F-5: counts removed on re-export, bullet now "Architected 6 gameplay systems and rebuilt save and inventory in the final 4 hours after a state-corruption bug." (3609cd6), 2026-11-12 |
| C-36 | Resume PDF (public download) shows "Montreal, QC" and email only, no phone | public/yahya-hallani-resume.pdf header | tests/resume-facts.test.ts phone check | consistent | |

## Mismatches and open decisions

All resolved on 2026-11-12 (see Confirmations). Changes land in plan 07-06.

| ID | Item | Detail | Options |
|----|------|--------|---------|
| F-1 | Facturo end date | Site: "Jun 2026 to Oct 2026", ended. Resume: "Jun 2026 - Present" (also in the resume title block). | (a) Re-export the resume with "Jun 2026 - Oct 2026" and keep the site. (b) The role is ongoing; change the site to "Since Jun 2026" and set `ended` to false. |
| F-2 | Freelance start | Resume: "May 2025 - Present". Site: "Since 2025". The skill's note that the resume reads "May 2023" is stale; the PDF reads May 2025. | (a) Keep "Since 2025". (b) Change to "Since May 2025". |
| F-3 | MAME Tool Rental missing from the resume | Site lists it in Experience and Projects; the resume has no entry. | (a) Add it on the re-export. (b) Accept the omission. |
| F-4 | Achievements meta description is 184 characters | Limit is 160 (UI-SPEC). Current text is in content/site.ts sections[1].description. Yahya supplies the shorter line (D-01). | Yahya writes a line of 160 characters or fewer. |
| F-5 | Atlantis line counts on the resume | The public PDF says "about 770 of 1,900 lines". The never-on-the-site rule bans line counts, and the PDF is downloadable from the site. | (a) Remove the counts on the re-export. (b) Keep them and relax the rule. |
| F-6 | Claims with no written source | C-03, C-06, C-14, C-29 and the link targets in C-13, C-16, C-24 rest on the skill or links.md only. | Yahya confirms each is accurate and current. |

## Never-on-the-site check

Run over `content/` on 2026-11-12.

| Rule | Command | Result |
|------|---------|--------|
| No "top 1" or CCC rank wording, no medal icons | `grep -rniE "top 1\|top-1\|top one\|medal" content/` | pass (no matches; the `rank` hits are the field name and "1st"/"75/75" values) |
| No phone number | `grep -rnE "\(?[0-9]{3}\)?[ .-][0-9]{3}[ .-][0-9]{4}" content/` | pass (no matches) |
| No CRC contest platform | `grep -rniE "dmoj\|codeforces\|contest platform" content/` | pass (no matches) |
| No Atlantis line counts | `grep -rniE "1,900\|770\|LOC" content/` | pass for content/; FAIL in the resume PDF (see F-5, C-35) |
| No "since" on an ended role | `grep -n "Since" content/experience.ts` | pass (Facturo uses "Jun 2026 to Oct 2026", `ended: true`; all "Since" rows have `ended: false`) |
| Showdown AI never shown as built | `grep -n "Showdown" content/projects.ts` | pass (reads "In progress, nothing built yet") |
| No home details | `grep -rniE "street\|avenue\|rue \|\bapt\b" content/` | pass (no matches; resume shows city only) |

## Confirmations

| Item | Yahya's answer | Date |
|------|----------------|------|
| D-03 numbers (700+ tests, 12 projects for 9 clients, 75/75, 18 teams / 9 CEGEPs / $2,500, 12 problems, 20+ edge-case tests, 6 gameplay systems) | All confirmed | 2026-11-12 |
| F-1 Facturo end date | Ended Oct 2026. Re-export the resume with the Oct 2026 end; the site stays | 2026-11-12 |
| F-2 Freelance start | Keep "Since 2025" | 2026-11-12 |
| F-3 MAME Tool Rental | Add to this repo's resume PDF on re-export only; the jobops resume is untouched | 2026-11-12 |
| F-4 Achievements meta description and About wording | Resolved 07-06 (90ad7c4). About wording pasted and placed verbatim (C-32, C-33, C-37). Achievements description: Yahya says the current 184-character text is fine; kept unchanged as an accepted deviation from D-09 / UI-SPEC Surface 4 (search snippets may truncate). tests/metadata.test.ts lists it as the only explicit over-160 exception | 2026-11-12 |
| F-5 Atlantis line counts on the resume | Remove them on re-export | 2026-11-12 |
| F-6 C-03, C-06, C-14, C-29 | Confirmed accurate | 2026-11-12 |
| Resume re-export method | Phase 1 method, scratch copy only: live JobOps resume JSON read with mode=ro, edited in the scratchpad, rendered in the job-ops container under /tmp/portfolio-public with the ultra-compact Typst theme. Applied: phone removed, CRC platform bullet removed, F-1, F-3, F-5. Live JSON drift since Phase 1 (header website, Involvement section, Grasset hidden, freelance "(90% + faster)" removed) was reverted in the scratch copy so the PDF text differs from the prior one only by F-1/F-3/F-5. New SHA-256 5943fdad1f8295afe2e43f3be353b710ef4c1befb6135740a30488cbe6674ee5 | 2026-11-12 |
| Copy handoff mode | Chat paste, Claude applies to content/*.ts in 07-06 | 2026-11-12 |

## 07-06 re-run of the never-on-the-site checks

Run on 2026-11-12 after the copy and resume changes.

| Rule | Result |
|------|--------|
| Em dash in content/ | pass (`grep -rn "—" content/` prints nothing) |
| No Atlantis line counts in resume extract | pass (`grep -E "1,900|770" docs/material/resume-public.txt` prints nothing; tests/resume-facts.test.ts pins it) |
| No phone in resume extract | pass (phone pattern test and grep) |
| No "since" on an ended role | pass (Facturo "Jun 2026 to Oct 2026", ended) |
| No top-1 wording, CRC platform, Showdown AI as built | pass (content/ unchanged for these; resume CRC platform bullet absent) |
