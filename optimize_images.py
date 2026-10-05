import os
import sys
import glob
from concurrent.futures import ProcessPoolExecutor, as_completed
from PIL import Image, ImageOps

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(BASE_DIR, 'assets', 'img')
OPT_DIR = os.path.join(IMG_DIR, 'optimized')
THUMB_DIR = os.path.join(OPT_DIR, 'thumb')
FULL_DIR = os.path.join(OPT_DIR, 'full')

def get_webp_rel_path(filepath):
    rel = os.path.relpath(filepath, IMG_DIR)
    dirname, filename = os.path.split(rel)
    base = filename
    for _ in range(2):
        name, ext = os.path.splitext(base)
        if ext.lower() in ('.jpg', '.jpeg', '.png'):
            base = name
    clean_filename = base + '.webp'
    return os.path.join(dirname, clean_filename)

def process_one(src_path):
    rel_webp = get_webp_rel_path(src_path)
    thumb_path = os.path.join(THUMB_DIR, rel_webp)
    full_path = os.path.join(FULL_DIR, rel_webp)

    os.makedirs(os.path.dirname(thumb_path), exist_ok=True)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)

    orig_sz = os.path.getsize(src_path)

    # Check if already processed
    if os.path.exists(thumb_path) and os.path.exists(full_path) and os.path.getsize(thumb_path) > 0 and os.path.getsize(full_path) > 0:
        return orig_sz, os.path.getsize(thumb_path), os.path.getsize(full_path), rel_webp, True

    with Image.open(src_path) as img:
        img = ImageOps.exif_transpose(img)
        if img.mode in ('RGBA', 'LA'):
            pass
        elif img.mode != 'RGB':
            img = img.convert('RGB')
            
        w, h = img.size

        # 1. Generate Thumbnail (max dimension 1200px)
        scale_thumb = min(1200 / max(w, h), 1.0)
        new_thumb_w = max(1, int(round(w * scale_thumb)))
        new_thumb_h = max(1, int(round(h * scale_thumb)))
        if scale_thumb < 1.0:
            thumb_img = img.resize((new_thumb_w, new_thumb_h), Image.Resampling.LANCZOS)
        else:
            thumb_img = img.copy()
        thumb_img.save(thumb_path, 'WEBP', quality=82, method=5)
        thumb_sz = os.path.getsize(thumb_path)

        # 2. Generate Full (max dimension 2400px)
        scale_full = min(2400 / max(w, h), 1.0)
        new_full_w = max(1, int(round(w * scale_full)))
        new_full_h = max(1, int(round(h * scale_full)))
        if scale_full < 1.0:
            full_img = img.resize((new_full_w, new_full_h), Image.Resampling.LANCZOS)
        else:
            full_img = img.copy()
        full_img.save(full_path, 'WEBP', quality=84, method=5)
        full_sz = os.path.getsize(full_path)

    return orig_sz, thumb_sz, full_sz, rel_webp, False

def main():
    files = []
    for root, dirs, fnames in os.walk(IMG_DIR):
        if 'optimized' in root:
            continue
        for f in fnames:
            if f.lower().endswith(('.jpg', '.jpeg', '.png')) and f not in ('favicon.png', 'logo.png'):
                files.append(os.path.join(root, f))

    files.sort()
    print(f"Optimizing {len(files)} images with multi-process workers...")

    total_orig = 0
    total_thumb = 0
    total_full = 0

    workers = min(os.cpu_count() or 4, 8)
    with ProcessPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(process_one, f): f for f in files}
        done_count = 0
        for fut in as_completed(futures):
            done_count += 1
            orig_sz, thumb_sz, full_sz, rel_webp, skipped = fut.result()
            total_orig += orig_sz
            total_thumb += thumb_sz
            total_full += full_sz
            status = "SKIPPED" if skipped else "CONVERTED"
            print(f"[{done_count}/{len(files)}] {status}: {rel_webp} -> orig: {orig_sz/(1024*1024):.2f}MB, thumb: {thumb_sz/1024:.1f}KB, full: {full_sz/1024:.1f}KB")

    print("\n" + "="*50)
    print(f"Total Original:   {total_orig / (1024*1024):8.2f} MB")
    print(f"Total Thumbnails: {total_thumb / (1024*1024):8.2f} MB  (Saved {100*(1 - total_thumb/total_orig):.1f}%)")
    print(f"Total Full-res:   {total_full / (1024*1024):8.2f} MB  (Saved {100*(1 - total_full/total_orig):.1f}%)")
    print("="*50)

if __name__ == '__main__':
    main()
