#!/usr/bin/env bash
# Phase 1 design-gate checks (01-VALIDATION.md). Usage: bash check.sh [ROW ...]  e.g. bash check.sh SC-4b SC-5a
cd "$(git rev-parse --show-toplevel)" || exit 2
D=docs/superpowers/specs/2026-11-03-portfolio-design.md
V=docs/reference/swiss-horizontal-v7.html
T=docs/reference/font-trial.html
R=docs/material/resume-public.pdf
L=docs/material/links.md
# OFL faces allowed in git. Round 2 of the font trial appends names here (D-08).
OFL_FACES='InterTight|SofiaSans|Schibsted|Hanken|Instrument'

sc_1a() { grep -q 'revision 5' "$D" && grep -q '#0b0b0b' "$D" && grep -qi 'horizontal' "$D"; }
sc_1b() { awk '/^## .*Retired/{r=1} !r && /#f8f8f8|viscous|folder stack|Sableye|GitHub Pages|CNAME/{print NR": "$0; bad=1} END{exit bad}' "$D"; }
sc_1c() { grep -Eq '^Status: APPROVED by Yahya, 20[0-9]{2}-[0-9]{2}-[0-9]{2}' "$D" && git log -1 --format=%s -- "$D"; }
sc_2a() { test -f "$T" || return 1; local m=0 f; for f in 'Inter Tight' 'Sofia Sans' Schibsted Hanken Instrument; do grep -q "$f" "$T" || { echo "missing $f"; m=1; }; done; return $m; }
sc_2b() { grep -Eqi 'final (font|family)' "$D" && grep -Eqi '(SIL Open Font License|OFL|web licen[cs]e)' "$D" && grep -q -- '--yahya-fit' "$D"; }
sc_2c() { if git ls-files | grep -Ei '\.(woff2?|otf|ttf)$' | grep -viE "$OFL_FACES"; then return 1; fi
          if git ls-files | grep '^docs/reference/fonts-private/'; then return 1; fi
          git ls-files docs/reference/fonts | grep -q OFL; }
sc_3a() { local m=0 p; for p in Index Achievements Projects Experience About 'Say hi'; do grep -Eq "^#{2,4} .*$p" "$D" || { echo "no section $p"; m=1; }; done; return $m; }
sc_3b() { local dup; dup=$(grep -i 'poster device' "$D" | sed 's/.*device[^:]*: *//I' | sort | uniq -d); [ -z "$dup" ] || { echo "duplicate: $dup"; return 1; }; [ "$(grep -ci 'poster device' "$D")" -ge 6 ]; }
sc_3c() { grep -Eqi 'Involvement.*(fits|cols 6|Heading)' "$D"; }
sc_3d() { test -f "$V" && ! grep -qE 'example\.com|1\.56,|fonts\.googleapis' "$V"; }
sc_4a() { ls docs/material/portrait*.jpg docs/material/*.pdf "$L"; }
sc_4b() { local t; t=$(pdftotext "$R" - 2>/dev/null) || return 1
          ! grep -Eq '\(?[0-9]{3}\)?[ .-]?[0-9]{3}[ .-][0-9]{4}' <<<"$t" && ! grep -q 'May 2023' <<<"$t" && grep -q '2025' <<<"$t"; }
sc_4c() { local gps f; gps=$(exiftool -q -q -if '$GPSLatitude' -p '$FileName' -r docs/material 2>/dev/null); [ -z "$gps" ] || { echo "GPS in: $gps"; return 1; }
          # portrait-*-color.jpg is the one documented exception (colour on hover, plan 01-07); it must still carry no camera tags
          for f in docs/material/portrait*.jpg; do case "$f" in *-color.jpg) [ -z "$(exiftool -q -q -Make -Model -Software -SerialNumber -s3 "$f")" ] || { echo "camera tags in: $f"; return 1; }; continue;; esac
            [ "$(magick identify -format '%[colorspace]' "$f")" = Gray ] || { echo "not Gray: $f"; return 1; }; done; }
sc_4d() { grep -q 'linkedin.com/in/' "$L" && grep -q 'github.com/Yahya-github' "$L" && grep -q '@' "$L"; }
# SC-4f: each of facturo/robot/atlantis has material in docs/material, or links.md carries an explicit waiver line "- Waiver: <item> ..."
sc_4f() { local m=0 k; for k in facturo robot atlantis; do compgen -G "docs/material/screenshots/$k-*" >/dev/null || compgen -G "docs/material/photos/$k-*" >/dev/null || grep -Eqi "^- Waiver: $k" "$L" || { echo "no $k material and no waiver"; m=1; }; done; return $m; }
sc_4e() { ! git ls-files | grep -Ei 'passport|transcript|client_secret|ICPCId'; }
sc_5a() { git ls-files --error-unmatch docs/reference/swiss-horizontal-v6.html; }
sc_5b() { local m=0 n; for n in 1 2 3 4 5 6; do grep -Eq "Decision $n.*(Accepted|Overruled)" "$D" || { echo "D$n missing"; m=1; }; done; grep -q Vercel "$D" || m=1; return $m; }
req_edits() { grep -Eqi '^- \[ \] \*\*[A-Z]+-[0-9]+\*\*:.*cursor' .planning/REQUIREMENTS.md && ! grep -Eq '^- Contact form, custom cursor' .planning/REQUIREMENTS.md; }

rows=("$@")
[ ${#rows[@]} -eq 0 ] && rows=(SC-1a SC-1b SC-1c SC-2a SC-2b SC-2c SC-3a SC-3b SC-3c SC-3d SC-4a SC-4b SC-4c SC-4d SC-4e SC-4f SC-5a SC-5b REQ-edits)
fail=0
for r in "${rows[@]}"; do
  fn=$(printf '%s' "$r" | tr 'A-Z-' 'a-z_')
  if out=$("$fn" 2>&1); then echo "PASS $r"; else echo "FAIL $r"; [ -n "$out" ] && printf '     %s\n' "$out" | head -5; fail=1; fi
done
exit $fail
