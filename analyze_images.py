import re
import os
import urllib.parse
from PIL import Image

def analyze_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all references to assets/img in src, data-full, url('...')
    matches = re.findall(r'(?:src=["\']|data-full=["\']|url\(["\']?)(assets/img/[^"\']+)', content)
    unique_refs = []
    seen = set()
    for m in matches:
        clean = urllib.parse.unquote(m).strip('\'"')
        if clean not in seen:
            seen.add(clean)
            unique_refs.append(clean)

    print(f"=== {filename} (Total: {len(unique_refs)} references) ===")
    total_mb = 0
    missing = 0
    for ref in unique_refs:
        if os.path.exists(ref):
            sz = os.path.getsize(ref)
            total_mb += sz / (1024 * 1024)
            try:
                with Image.open(ref) as img:
                    print(f"  {sz/1024:6.1f} KB | {img.size[0]:4d}x{img.size[1]:4d} | {ref}")
            except Exception as e:
                print(f"  {sz/1024:6.1f} KB | CANNOT READ: {e} | {ref}")
        else:
            missing += 1
            print(f"  NOT FOUND: {ref}")
    print(f"Total size for {filename}: {total_mb:.2f} MB (Missing: {missing})\n")

if __name__ == '__main__':
    analyze_file('index.html')
    analyze_file('gallery.html')
