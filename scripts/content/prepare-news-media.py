#!/usr/bin/env python3
"""One-off media preparation for the 2026-09 V2 news pack.

Reads the chamber-supplied DOCX/DOC files under `docs/support docs/V2` (untracked),
extracts the embedded photos in document order, normalises them (long edge <= 1600 px,
JPEG q82, EXIF stripped) and writes them to `public/news-media/<slug>/NN.jpg`.
`cover.jpg` is a 2:1 centre crop of the chosen cover source.

Requires Pillow and olefile (python3 -m pip install pillow olefile). Re-runnable; output is deterministic.
"""
import io, json, os, re, sys, zipfile
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "docs" / "support docs" / "V2"
OUT = ROOT / "public" / "news-media"
MAX_EDGE = 1600
QUALITY = 82

# slug -> (source file, cover index (1-based, in document order) or None)
ARTICLES = {
    "oceania-business-council-2026-agm-melbourne": ("大洋洲商会新闻(1).docx", 1),
    "shanghai-changning-visit-ai-manufacturing": ("大洋洲商会代表团长宁行：咖啡机器人、智慧港口与战略合作共绘合作新蓝图(1).docx", 3),
    "shanghai-nanhongqiao-chamber-visit": ("大洋洲工商业委员会代表团访问上海南虹桥商会 共拓国际合作新空间(1).doc", 1),
}

def docx_images_in_order(path: Path):
    """Return image bytes in document order using the relationship ids referenced by document.xml."""
    with zipfile.ZipFile(path) as z:
        rels = z.read("word/_rels/document.xml.rels").decode("utf8")
        rel_map = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="(media/[^"]+)"', rels))
        doc = z.read("word/document.xml").decode("utf8")
        order = []
        for rid in re.findall(r'r:embed="(rId\d+)"', doc):
            target = rel_map.get(rid)
            if target and target not in order:
                order.append(target)
        return [z.read("word/" + t) for t in order]

def doc_images(path: Path):
    """Legacy .doc (OLE compound file): pictures live in the contiguous "Data" stream.

    Requires `olefile` (python3 -m pip install olefile). Returns JPEG streams in file order.
    """
    import olefile

    with olefile.OleFileIO(str(path)) as ole:
        if not ole.exists("Data"):
            return []
        data = ole.openstream("Data").read()
    starts = [m.start() for m in re.finditer(b"\xff\xd8\xff", data)]
    out = []
    for i, s in enumerate(starts):
        nxt = starts[i + 1] if i + 1 < len(starts) else len(data)
        blob = data[s:nxt]
        if len(blob) < 20000:
            continue
        try:
            im = Image.open(io.BytesIO(blob))
            im.load()
        except Exception:
            continue
        out.append(blob)
    return out


def normalise(blob: bytes) -> Image.Image:
    im = Image.open(io.BytesIO(blob))
    im = ImageOps.exif_transpose(im).convert("RGB")
    w, h = im.size
    scale = min(1.0, MAX_EDGE / max(w, h))
    if scale < 1.0:
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    return im

def save(im: Image.Image, dest: Path):
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=QUALITY, optimize=True, progressive=True)

def cover_from(im: Image.Image) -> Image.Image:
    return ImageOps.fit(im, (1600, 800), Image.LANCZOS, centering=(0.5, 0.5))

def main():
    manifest = {}
    for slug, (fname, cover_idx) in ARTICLES.items():
        src = SRC / fname
        if not src.exists():
            print("missing source", src, file=sys.stderr)
            continue
        blobs = docx_images_in_order(src) if src.suffix == ".docx" else doc_images(src)
        entries = []
        for i, blob in enumerate(blobs, start=1):
            im = normalise(blob)
            dest = OUT / slug / f"{i:02d}.jpg"
            save(im, dest)
            entries.append({"file": dest.name, "width": im.width, "height": im.height, "bytes": dest.stat().st_size})
            if cover_idx == i:
                cdest = OUT / slug / "cover.jpg"
                save(cover_from(im), cdest)
                entries.append({"file": "cover.jpg", "width": 1600, "height": 800, "bytes": cdest.stat().st_size, "from": dest.name})
        manifest[slug] = {"source": fname, "images": entries}
        print(f"{slug}: {len(blobs)} images")
    # Extraction record, kept out of public/ so it is not served with the site.
    (ROOT / "docs" / "news-media-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    )

if __name__ == "__main__":
    main()
