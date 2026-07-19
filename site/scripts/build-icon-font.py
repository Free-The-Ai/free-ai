#!/usr/bin/env python3
"""Build a self-hosted, subsetted Material Symbols Outlined woff2.

The full Google Fonts variable font is ~446KB; the site uses ~two dozen icons.
This instances the font static (weight 400, FILL 0 — the only values the CSS
uses) and subsets it to just the icon ligatures found in src/, producing a
~4KB file. Re-run after adding/removing a `material-symbols-outlined` icon.

    python3 scripts/build-icon-font.py

Requires: fonttools + brotli (pip install fonttools brotli). Network access to
jsdelivr for the source font (Google Fonts' own host may be blocked).
"""
from __future__ import annotations
import re, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
OUT = ROOT / "static" / "fonts" / "material-symbols-outlined-subset.woff2"
FONT_URL = "https://cdn.jsdelivr.net/npm/material-symbols@0.45.8/material-symbols-outlined.woff2"
CACHE = Path("/tmp/material-symbols-full.woff2")

# Every glyph name rendered via <span class="material-symbols-outlined">NAME</span>.
ICON_RE = re.compile(r'material-symbols-outlined[^>]*>\s*([a-z0-9_]+)\s*<')

def used_icons() -> list[str]:
    icons: set[str] = set()
    for path in SRC.rglob("*.svelte"):
        icons.update(ICON_RE.findall(path.read_text(encoding="utf-8")))
    return sorted(icons)

def source_font() -> Path:
    if not CACHE.exists() or CACHE.stat().st_size < 50_000:
        print(f"downloading {FONT_URL}")
        urllib.request.urlretrieve(FONT_URL, CACHE)
    return CACHE

def main() -> int:
    from fontTools import subset
    from fontTools.ttLib import TTFont
    from fontTools.varLib.instancer import instantiateVariableFont

    icons = used_icons()
    if not icons:
        print("no material-symbols icons found in src/", file=sys.stderr)
        return 1
    print(f"{len(icons)} icons: {' '.join(icons)}")

    font = TTFont(source_font())
    axes = {a.axisTag: a.defaultValue for a in font["fvar"].axes}
    axes.update(wght=400.0, FILL=0.0)
    instantiateVariableFont(font, axes, inplace=True)

    # Resolve each icon name -> its output glyph via the font's own ligature table,
    # so we can pin exactly those glyphs and disable layout closure (otherwise the
    # shared letters between icon names pull in thousands of unrelated icons).
    rev = {g: chr(c) for c, g in font.getBestCmap().items()}
    ligmap: dict[str, str] = {}
    for lookup in font["GSUB"].table.LookupList.Lookup:
        for st in lookup.SubTable:
            s = st.ExtSubTable if st.__class__.__name__ == "ExtensionSubst" else st
            if s.__class__.__name__ != "LigatureSubst":
                continue
            for first, ligs in s.ligatures.items():
                for lig in ligs:
                    try:
                        name = "".join(rev[g] for g in [first, *lig.Component])
                    except KeyError:
                        continue
                    ligmap[name] = lig.LigGlyph

    missing = [i for i in icons if i not in ligmap]
    if missing:
        print(f"WARNING: no glyph for: {missing}", file=sys.stderr)
    keep = [ligmap[i] for i in icons if i in ligmap]

    tmp = Path("/tmp/ms-static.ttf")
    font.save(tmp)
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]
    opts.layout_closure = False
    opts.glyph_names = True
    opts.notdef_outline = True
    sub = subset.Subsetter(options=opts)
    loaded = subset.load_font(str(tmp), opts)
    sub.populate(text="".join(icons), glyphs=keep)
    sub.subset(loaded)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    subset.save_font(loaded, str(OUT), opts)
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes, {len(loaded.getGlyphOrder())} glyphs)")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
