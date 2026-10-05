import re
import os
import urllib.parse
from PIL import Image

with open('gallery.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract all img src within cells
cells = re.findall(r'<figure[^>]*class=["\']cell["\'][^>]*>.*?<img[^>]+src=["\']([^"\']+)["\']', html, re.DOTALL)
print(f'Total gallery cells found: {len(cells)}')

missing = []
valid = []
for src in cells:
    filepath = urllib.parse.unquote(src)
    if not os.path.exists(filepath):
        missing.append((src, filepath))
    else:
        sz = os.path.getsize(filepath)
        try:
            with Image.open(filepath) as img:
                valid.append((src, filepath, sz, img.size, img.format))
        except Exception as e:
            missing.append((src, f"{filepath} (ERROR: {e})"))

print(f"Valid on disk: {len(valid)} / {len(cells)}")
if missing:
    print(f"Missing or broken ({len(missing)}):")
    for m in missing:
        print(" ", m)
else:
    print("All 71 gallery images are valid and readable by Pillow!")
