#!/usr/bin/env python3
"""Font trial metrics for the Phase 1 design gate (throwaway planning tooling).

Shapes words with HarfBuzz (uharfbuzz) on variable TTFs and prints a Markdown
report: tabular figures, axes, YAHYA advance, --yahya-fit, Poster size and the
Display-word fit table, using the UI-SPEC grid formulas.

Usage:
  metrics.py <ttf-dir> [--display-weight 700] [--yahya-track -0.04]
             [--display-track -0.05] [--wdth 100] [--faces <stems>]

Run with the venv python and -I (downloaded fonts are untrusted input).
"""
import argparse
import datetime
import os
import sys

import uharfbuzz as hb
from fontTools.ttLib import TTFont

# Layout constants (01-UI-SPEC.md Grid / Spacing Scale).
DESK_MARGIN, DESK_GUTTER, DESK_RAIL = 24, 24, 56
PHONE_MARGIN, PHONE_GUTTER, PHONE_RAIL = 16, 16, 36
FRAME_TOP, FRAME_BOTTOM, HERO_GAP, ROLE_BLOCK = 72, 56, 96, 96
POSTER_LH = 0.76
VIEWPORTS = [(1440, 900), (1366, 768), (390, 844)]
DISPLAY_MIN, DISPLAY_VW, DISPLAY_MAX = 64, 0.09, 168
PHONE_MAX = 820

# Known faces: stem -> (display name, body stem or None, note)
KNOWN = {
    "InterTight-wght": ("Inter Tight", None,
                        "Anti-vibe flag (Inter by default): can win only on the trial, "
                        "with a one-sentence reason in the design doc."),
    "SofiaSansExtraCondensed-wght": ("Sofia Sans Extra Condensed + Sofia Sans", "SofiaSans-wght",
                                     "two files, one superfamily (D-06 reading to be confirmed by Yahya). "
                                     "YAHYA and Display measured with Sofia Sans Extra Condensed; "
                                     "body file Sofia Sans."),
    "SchibstedGrotesk-wght": ("Schibsted Grotesk", None, ""),
    "HankenGrotesk-wght": ("Hanken Grotesk", None, ""),
    "InstrumentSans-wdth-wght": ("Instrument Sans", None,
                                 "wdth axis gives a condensed YAHYA from the same single file."),
}
DEFAULT_FACES = list(KNOWN)

FIT_ROWS = [
    # (label, word, viewport width, first col, last col, extra features)
    ('"Involvement" cols 7-12', "Involvement", 1366, 7, 12, None),
    ('"Involvement" cols 7-12', "Involvement", 1440, 7, 12, None),
    ('"Involvement" cols 6-12', "Involvement", 1366, 6, 12, None),
    ('"Involvement" cols 6-12', "Involvement", 1440, 6, 12, None),
    ('"Work" cols 1-5', "Work", 1366, 1, 5, None),
    ('"Work" cols 1-6', "Work", 1366, 1, 6, None),
    ('"Achievements" phone full width', "Achievements", 390, 1, 12, None),
    ('"Achievements" cols 1-12 (variant b title)', "Achievements", 1366, 1, 12, None),
    ('"Facturo" cols 1-8', "Facturo", 1366, 1, 8, None),
    ('"habits" cols 5-12 (title "Two" / "habits")', "habits", 1366, 5, 12, None),
    ('"Resume (PDF)" cols 1-9', "Resume (PDF)", 1366, 1, 9, None),
    ('"Resume (PDF)" cols 1-9', "Resume (PDF)", 1440, 1, 9, None),
    ('"LinkedIn" cols 1-9', "LinkedIn", 1366, 1, 9, None),
    ('"LinkedIn" cols 1-9', "LinkedIn", 1440, 1, 9, None),
    ('"GitHub" cols 1-9', "GitHub", 1366, 1, 9, None),
    ('"GitHub" cols 1-9', "GitHub", 1440, 1, 9, None),
    ('"Email" cols 1-9', "Email", 1366, 1, 9, None),
    ('"Email" cols 1-9', "Email", 1440, 1, 9, None),
    ('"75/75" cols 1-7 (variant a, tabular-nums)', "75/75", 1366, 1, 7, {"tnum": True}),
]


def is_desktop(w):
    return w > PHONE_MAX


def display_size(w):
    return max(DISPLAY_MIN, min(DISPLAY_MAX, w * DISPLAY_VW))


def content_grid(w):
    """Grid width for pages 01-05 (rail padding)."""
    if is_desktop(w):
        return w - DESK_MARGIN - (DESK_MARGIN + DESK_RAIL)
    return w - (PHONE_MARGIN + PHONE_RAIL) - PHONE_MARGIN


def hero_grid(w):
    margin = DESK_MARGIN if is_desktop(w) else PHONE_MARGIN
    return w - 2 * margin


def span(w, first, last):
    gutter = DESK_GUTTER if is_desktop(w) else PHONE_GUTTER
    col = (content_grid(w) - 11 * gutter) / 12
    n = last - first + 1
    return n * col + (n - 1) * gutter


def height_budget(h):
    return h - FRAME_TOP - FRAME_BOTTOM - HERO_GAP - ROLE_BLOCK


def poster(fit, w, h):
    by_w, by_h = hero_grid(w) / fit, height_budget(h) / POSTER_LH
    return (by_w, "width-bound") if by_w <= by_h else (by_h, "height-bound")


def fmt(x, d=3):
    return f"{x:.{d}f}"


class Face:
    def __init__(self, path):
        self.stem = os.path.splitext(os.path.basename(path))[0]
        self.tt = TTFont(path)
        self.upem = self.tt["head"].unitsPerEm
        fvar = self.tt["fvar"].axes if "fvar" in self.tt else []
        self.axes = {a.axisTag: (a.minValue, a.maxValue) for a in fvar}
        self.hbface = hb.Face(hb.Blob.from_file_path(path))

    @property
    def name(self):
        return KNOWN.get(self.stem, (self.stem,))[0]

    def axes_text(self):
        return ", ".join(f"{t} {fmt(lo, 0)}-{fmt(hi, 0)}" for t, (lo, hi) in self.axes.items()) or "none (static)"

    def tabular(self):
        """Return (passes, short label, long label)."""
        feats = set()
        if "GSUB" in self.tt:
            feats = {r.FeatureTag for r in self.tt["GSUB"].table.FeatureList.FeatureRecord}
        cmap, hmtx = self.tt.getBestCmap(), self.tt["hmtx"]
        widths = {hmtx[cmap[ord(c)]][0] for c in "0123456789"}
        if "tnum" in feats:
            return True, "`tnum`", "yes (`tnum` feature)"
        if len(widths) == 1:
            return True, "tabular by default", \
                f"yes, tabular by default (no `tnum` feature; all ten digits {widths.pop()} units)"
        return False, "no", "NO (no `tnum` feature, default digits proportional)"

    def clamp(self, tag, value):
        if tag not in self.axes:
            return None
        lo, hi = self.axes[tag]
        return max(lo, min(hi, value))

    def max_wght(self):
        return self.axes.get("wght", (400, 400))[1]

    def advance_em(self, text, wght, wdth=None, features=None):
        font = hb.Font(self.hbface)
        var = {}
        if "wght" in self.axes:
            var["wght"] = self.clamp("wght", wght)
        if wdth is not None and "wdth" in self.axes:
            var["wdth"] = self.clamp("wdth", wdth)
        if var:
            font.set_variations(var)
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        feats = {"kern": True}
        feats.update(features or {})
        hb.shape(font, buf, feats)
        return sum(p.x_advance for p in buf.glyph_positions) / self.upem

    def adv800_text(self, wdth):
        if self.max_wght() >= 800:
            return f"{fmt(self.advance_em('YAHYA', 800, wdth))} em"
        return f"max {fmt(self.max_wght(), 0)} (no 800, never synthesized)"


def fit_table(face, wght, track, wdth):
    out = ["| Word / slot | Viewport | Size | Width / available |", "|---|---|---|---|"]
    for label, word, w, first, last, feats in FIT_ROWS:
        size = display_size(w)
        width = size * (face.advance_em(word, wght, wdth, feats) + len(word) * track)
        avail = span(w, first, last)
        mark = "✓" if width <= avail else "✗"
        out.append(f"| {label} | {w} | {size:.2f}px | {width:.0f}px / {avail:.0f}px {mark} |")
    return out


def poster_block(face, dw, wdth, args, label):
    fit = face.advance_em("YAHYA", dw, wdth) + 5 * args.yahya_track
    out = ["", f"**{label}** (tracking {args.yahya_track}em)", "", f"- `--yahya-fit` = {fmt(fit)}", "",
           "| Viewport | Hero grid Gh | Height budget Hb | Gh / fit | Hb / 0.76 | Poster size | Bound |",
           "|---|---|---|---|---|---|---|"]
    for w, h in VIEWPORTS:
        size, bound = poster(fit, w, h)
        gh, hbud = hero_grid(w), height_budget(h)
        out.append(f"| {w}x{h} | {gh}px | {hbud}px | {gh / fit:.0f}px | {hbud / POSTER_LH:.0f}px | "
                   f"{size:.0f}px | {bound} |")
    return out


def face_section(face, body, note, args):
    lines = [f"## {face.name}", ""]
    files = f"`{face.stem}.woff2`" + (f" (YAHYA, Display) + `{body.stem}.woff2` (body)" if body else "")
    lines.append(f"- Files: {files}")
    lines.append("- Licence: SIL Open Font License 1.1, self-host allowed (OFL text committed next to the WOFF2)")
    lines.append(f"- Tabular figures: {face.tabular()[2]}")
    lines.append(f"- Axes: {face.axes_text()}")
    if body:
        lines.append(f"- Body file ({body.stem}) tabular figures: {body.tabular()[2]}; axes: {body.axes_text()}")
    wdth = face.clamp("wdth", args.wdth)
    lines.append(f"- YAHYA shaped advance (kern on, no tracking): 700 = {fmt(face.advance_em('YAHYA', 700, wdth))} em;"
                 f" 800 = {face.adv800_text(wdth)}")
    low_wdth = face.axes["wdth"][0] if "wdth" in face.axes else None
    if low_wdth is not None:
        lines.append(f"- YAHYA at wdth {fmt(low_wdth, 0)}, weight 700: "
                     f"{fmt(face.advance_em('YAHYA', 700, low_wdth))} em")
    if note:
        lines.append(f"- Note: {note}")

    dw = min(args.display_weight, face.max_wght())
    dw_txt = f"display weight {fmt(dw, 0)}"
    if dw != args.display_weight:
        dw_txt += f" (requested {fmt(args.display_weight, 0)}; max {fmt(face.max_wght(), 0)})"
    wdth_txt = f", wdth {fmt(wdth, 0)}" if wdth is not None else ""

    lines += poster_block(face, dw, wdth, args, f"Poster YAHYA: {dw_txt}{wdth_txt}")
    if low_wdth is not None and low_wdth != wdth:
        lines += poster_block(face, dw, low_wdth, args, f"Poster YAHYA: {dw_txt}, wdth {fmt(low_wdth, 0)}")

    lines += ["", f"**Display-word fit: {dw_txt}, tracking {args.display_track}em{wdth_txt}**", ""]
    lines += fit_table(face, dw, args.display_track, wdth)
    if low_wdth is not None and low_wdth != wdth:
        lines += ["", f"**Display-word fit at wdth {fmt(low_wdth, 0)}** (option if this face wins)", ""]
        lines += fit_table(face, dw, args.display_track, low_wdth)
    lines.append("")
    return lines


HEADER = """# Font trial metrics

Font trial metrics (throwaway reference, Phase 1). Measured with HarfBuzz on the google/fonts files, {date}.

## How to rerun

```bash
python3 -m venv "$S/venv" && "$S/venv/bin/pip" install fonttools brotli uharfbuzz
mkdir -p "$S/fonts-src"
for f in docs/reference/fonts/*.woff2; do "$S/venv/bin/python" -I -m fontTools.ttLib.woff2 decompress -o "$S/fonts-src/$(basename "${{f%.woff2}}").ttf" "$f"; done
"$S/venv/bin/python" -I .planning/phases/01-design-gate/metrics.py "$S/fonts-src" --display-weight <w> --yahya-track <t>
```

`$S` is any scratch directory outside the repo.

## Formulas (01-UI-SPEC grid)

- Hero grid `Gh = W - 2*24` desktop; phone `390 - 2*16 = 358`.
- Content grid (pages 01-05, rail padding): desktop `G = W - 104`; phone `G = 390 - (16 + 36) - 16 = 322`.
- Column `c = (G - 11*g)/12`, g = 24 desktop, 16 phone; span of n columns = `n*c + (n-1)*g`.
- Display size `clamp(64px, 9vw, 168px)`: 1366 -> 122.94px, 1440 -> 129.60px, 390 -> 64px.
- Word width = `size * (shaped_advance_em + chars * tracking_em)` (CSS letter-spacing follows every character).
- `--yahya-fit = shaped_advance_em("YAHYA") + 5 * tracking_em`.
- Poster size = `min(Gh / fit, Hb / 0.76)`, `Hb = H - 72 - 56 - 96 - 96` (1440x900: 580px, 1366x768: 448px, 390x844: 524px).

Run settings: display weight {dw}, YAHYA tracking {yt}em, Display tracking {dt}em, wdth {wd}.

## Summary

| Face | Tabular figures | Axes | YAHYA 700 (em) | YAHYA 800 (em) | `--yahya-fit` | Poster 1440x900 | Poster 1366x768 | Poster 390x844 |
|---|---|---|---|---|---|---|---|---|"""

PAID = """## Paid faces

| Face | Foundry | Status |
|---|---|---|
| Söhne | Klim | not measured: needs Yahya's test files; price not verified |
| Suisse Int'l | Swiss Typefaces | not measured: needs Yahya's test files; price not verified |
| Neue Haas Grotesk Display | Monotype | not measured: needs Yahya's test files; price not verified |

The trial page measures these live once the files sit in `docs/reference/fonts-private/` (git-ignored) or are installed system-wide."""


def summary_row(face, args):
    wdth = face.clamp("wdth", args.wdth)
    dw = min(args.display_weight, face.max_wght())
    fit = face.advance_em("YAHYA", dw, wdth) + 5 * args.yahya_track
    a800 = fmt(face.advance_em("YAHYA", 800, wdth)) if face.max_wght() >= 800 else f"max {fmt(face.max_wght(), 0)}"
    posters = []
    for w, h in VIEWPORTS:
        size, bound = poster(fit, w, h)
        posters.append(f"{size:.0f}px {bound}")
    return (f"| {face.name} | {face.tabular()[1]} | {face.axes_text()} | "
            f"{fmt(face.advance_em('YAHYA', 700, wdth))} | {a800} | {fmt(fit)} | " + " | ".join(posters) + " |")


def main():
    ap = argparse.ArgumentParser(description="Font trial metrics (Phase 1)")
    ap.add_argument("ttf_dir")
    ap.add_argument("--display-weight", type=float, default=700)
    ap.add_argument("--yahya-track", type=float, default=-0.04)
    ap.add_argument("--display-track", type=float, default=-0.05)
    ap.add_argument("--wdth", type=float, default=100)
    ap.add_argument("--faces", default=",".join(DEFAULT_FACES), help="comma-separated TTF file stems")
    args = ap.parse_args()

    def load(stem):
        path = os.path.join(args.ttf_dir, stem + ".ttf")
        if not os.path.isfile(path):
            sys.exit(f"missing font file: {path}")
        return Face(path)

    faces = []
    for stem in (s.strip() for s in args.faces.split(",")):
        if not stem:
            continue
        _, body_stem, note = KNOWN.get(stem, (stem, None, ""))
        faces.append((load(stem), load(body_stem) if body_stem else None, note))

    out = [HEADER.format(date=datetime.date.today().isoformat(), dw=fmt(args.display_weight, 0),
                         yt=args.yahya_track, dt=args.display_track, wd=fmt(args.wdth, 0))]
    out += [summary_row(face, args) for face, _, _ in faces]
    out.append("")
    for face, body, note in faces:
        out += face_section(face, body, note, args)
    out.append(PAID)
    print("\n".join(out))


if __name__ == "__main__":
    main()
