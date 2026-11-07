---
created: 2026-11-07T22:13:02Z
title: Regenerate the CLAUDE.md stack section for Vercel
area: docs
files:
  - CLAUDE.md
---

## Problem

The Technology Stack section of ./CLAUDE.md still prescribes GitHub Pages (official Pages workflow, configure-pages basePath, withBase(), CNAME notes). The project switched to Vercel on 2026-11-06 (real headers, no basePath stage), and the approved design doc says so. Yahya said yes to this follow-up ("claude-md: yes", 2026-11-07).

## Solution

Regenerate the stack section (GSD generate-claude-md or a hand edit) for Next.js static export on Vercel: drop the Pages workflow, basePath and CNAME notes, keep the library and test choices, and note headers (CSP, HSTS) are now possible via vercel.json.
