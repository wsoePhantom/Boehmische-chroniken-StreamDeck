"""Generate Stream Deck PNG assets and assemble the standalone plugin."""
from pathlib import Path
from shutil import copy2
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
out = root / "build/de.boehmischechroniken.stats.sdPlugin"
(out / "imgs").mkdir(parents=True, exist_ok=True)
copy2(root / "plugin/manifest.json", out / "manifest.json")

names = {
    "plugin": "BC", "category": "BC",
    "status": "ON", "players": "PL", "record": "MAX",
    "history": "24H"
}
for name, label in names.items():
    for scale in (1, 2):
        size = 144 * scale
        img = Image.new("RGBA", (size, size), "#1e2b24")
        draw = ImageDraw.Draw(img)
        draw.rounded_rectangle((4*scale,4*scale,size-4*scale,size-4*scale),
                               radius=18*scale, outline="#93b49a", width=3*scale)
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", 35*scale)
        box = draw.textbbox((0,0), label, font=font)
        draw.text(((size-(box[2]-box[0]))/2, (size-(box[3]-box[1]))/2-box[1]),
                  label, font=font, fill="#f0e8d2")
        suffix = "@2x" if scale == 2 else ""
        img.save(out / "imgs" / (name + suffix + ".png"))
print(out)
