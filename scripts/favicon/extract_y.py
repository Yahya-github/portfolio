# scripts/favicon/extract_y.py: prints the Instrument Sans "Y" outline at wdth 75 / wght 700 as JSON (D-07).
# Usage: uvx --from 'fonttools[woff]' python -I scripts/favicon/extract_y.py app/fonts/InstrumentSans-wdth-wght.woff2
import json
import sys

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

WDTH = 75
WGHT = 700


def main(path):
    font = TTFont(path)
    instance = instantiateVariableFont(font, {"wdth": WDTH, "wght": WGHT})
    glyph_name = instance.getBestCmap()[ord("Y")]
    glyph_set = instance.getGlyphSet()
    svg_pen = SVGPathPen(glyph_set)
    bounds_pen = BoundsPen(glyph_set)
    glyph_set[glyph_name].draw(svg_pen)
    glyph_set[glyph_name].draw(bounds_pen)
    print(
        json.dumps(
            {
                "unitsPerEm": instance["head"].unitsPerEm,
                "wdth": WDTH,
                "wght": WGHT,
                "bounds": list(bounds_pen.bounds),
                "d": svg_pen.getCommands(),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main(sys.argv[1])
