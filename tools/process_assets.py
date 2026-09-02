#!/usr/bin/env python
"""
Noir & Crumb — asset processing pipeline.
- Removes baked-in checkerboard / neutral backgrounds -> real transparency (WebP alpha)
- Optimizes + resizes photos to WebP
- Copies videos
- Generates favicon + poster fallbacks
"""
import os, shutil, math
import numpy as np
from PIL import Image, ImageFilter, ImageOps

Image.MAX_IMAGE_PIXELS = None
SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(SRC, "site", "public", "assets")
IMG = os.path.join(OUT, "img")
VID = os.path.join(OUT, "video")
for d in (IMG, VID):
    os.makedirs(d, exist_ok=True)

def load(name):
    return Image.open(os.path.join(SRC, name)).convert("RGB")

def fit(img, longest):
    w, h = img.size
    if max(w, h) <= longest:
        return img
    s = longest / max(w, h)
    return img.resize((round(w*s), round(h*s)), Image.LANCZOS)

def save_webp(img, name, q=82, lossless=False):
    p = os.path.join(IMG, name)
    img.save(p, "WEBP", quality=q, method=6, lossless=lossless)
    kb = os.path.getsize(p)//1024
    print(f"  -> {name}  {img.size[0]}x{img.size[1]}  {kb}KB")

def remove_neutral_bg(img, gray_tol=24, bright_min=158, erode=3, feather=1.1):
    """Make bright, low-saturation (checkerboard/white/gray) pixels transparent."""
    arr = np.asarray(img).astype(np.int16)
    mx = arr.max(2); mn = arr.min(2)
    grayness = mx - mn
    bg = (grayness < gray_tol) & (mx > bright_min)
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    a = Image.fromarray(alpha, "L")
    if erode and erode >= 3 and erode % 2 == 1:
        a = a.filter(ImageFilter.MinFilter(erode))   # shrink to kill halo
    if feather:
        a = a.filter(ImageFilter.GaussianBlur(feather))
    out = img.convert("RGBA")
    out.putalpha(a)
    return autocrop_alpha(out)

def autocrop_alpha(img, pad_ratio=0.02):
    a = np.asarray(img.split()[-1])
    ys, xs = np.where(a > 12)
    if len(xs) == 0:
        return img
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    pad = round(max(img.size) * pad_ratio)
    x0 = max(0, x0-pad); y0 = max(0, y0-pad)
    x1 = min(img.size[0]-1, x1+pad); y1 = min(img.size[1]-1, y1+pad)
    return img.crop((x0, y0, x1+1, y1+1))

def trim_black(img, thresh=22, pad=0):
    """Crop away uniform black borders from black-bg product shots."""
    g = np.asarray(img.convert("L"))
    mask = g > thresh
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return img
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    x0=max(0,x0-pad); y0=max(0,y0-pad); x1=min(img.size[0]-1,x1+pad); y1=min(img.size[1]-1,y1+pad)
    return img.crop((x0, y0, x1+1, y1+1))

# ---------- TRANSPARENT CUTOUTS ----------
print("Transparent cutouts:")
hero = remove_neutral_bg(load("Asset 7.jpeg"))
save_webp(fit(hero, 1500), "hero-cookie.webp", q=90)
save_webp(fit(hero, 900),  "hero-cookie-sm.webp", q=88)

for src, out in [("Assets 17.jpeg", "box-closed.webp"), ("Asset 18.jpeg", "box-open.webp")]:
    im = remove_neutral_bg(load(src))
    save_webp(fit(im, 1500), out, q=88)

ingredients = {
    "Asset 19.jpeg": "ing-chocolate.webp",
    "Assets 20.jpeg": "ing-caramel.webp",
    "Assets 21.jpeg": "ing-salt.webp",
    "Assets 22.jpeg": "ing-hazelnut.webp",
    "Assets 23.jpeg": "ing-pistachio.webp",
    "Assets 24.jpeg": "ing-vanilla.webp",
    "Assets 25.jpeg": "ing-cocoa.webp",
    "Assets 26.jpeg": "ing-butter.webp",
}
for src, out in ingredients.items():
    im = remove_neutral_bg(load(src), gray_tol=26, bright_min=150)
    save_webp(fit(im, 820), out, q=86)

# Logo: gold on white -> transparent gold
try:
    logo = remove_neutral_bg(load("Assets 42.jpeg"), gray_tol=40, bright_min=170, erode=0, feather=0.8)
    save_webp(fit(logo, 640), "logo.webp", q=92)
    fav = fit(logo, 128).convert("RGBA")
    canvas = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    x = (128 - fav.size[0]) // 2
    y = (128 - fav.size[1]) // 2
    canvas.alpha_composite(fav, (max(0, x), max(0, y)))
    canvas.save(os.path.join(OUT, "..", "favicon.png"))
    print("  -> logo.webp + favicon.png")
except Exception as e:
    print("  !! logo step failed:", e)

# ---------- BLACK-BG PRODUCTS (keep black, trim, optimize) ----------
print("Products (black bg):")
products = {
    "Assets 10.jpeg": "prod-darkchoc",
    "Asset 11.jpeg": "prod-caramel",
    "Assets 12.jpeg": "prod-double",
    "Assets 13.jpeg": "prod-pistachio",
    "Assets 14.jpeg": "prod-biscoff",
    "Assets 15.jpeg": "prod-hazelnut",
}
for src, base in products.items():
    im = trim_black(load(src))
    save_webp(fit(im, 1200), f"{base}.webp", q=84)
    save_webp(fit(im, 620),  f"{base}-sm.webp", q=80)

feat = trim_black(load("Asset 16.jpeg"))
save_webp(fit(feat, 1400), "featured.webp", q=86)
save_webp(fit(feat, 800),  "featured-sm.webp", q=82)

# ---------- BACKGROUNDS ----------
print("Backgrounds:")
bgs = {
    "Assets 27.jpeg": "bg-studio",
    "Assets 28.jpeg": "bg-slate",
    "Assets 29.jpeg": "bg-oven",
    "Assets 30.jpeg": "bg-cream",
}
for src, base in bgs.items():
    im = load(src)
    save_webp(fit(im, 2000), f"{base}.webp", q=80)
    save_webp(fit(im, 1100), f"{base}-sm.webp", q=72)

# ---------- FX ----------
print("FX:")
save_webp(fit(load("Assets 44.jpeg"), 1200), "glow.webp", q=82)      # keep black, screen-blend
save_webp(fit(load("Assets 43.jpeg"), 1024), "grain.webp", q=70)     # overlay

# ---------- VIDEOS ----------
print("Videos:")
videos = {
    "Assets 8.mp4": "hero.mp4",
    "Assets 9.mp4": "hero-alt.mp4",
    "Assets 31.mp4": "melt.mp4",
    "Assets 32.mp4": "chips.mp4",
    "Assets 33.mp4": "break.mp4",
    "Assets 34.mp4": "baking.mp4",
    "Assets 35.mp4": "rotate.mp4",
}
for src, out in videos.items():
    shutil.copyfile(os.path.join(SRC, src), os.path.join(VID, out))
    print(f"  -> {out}")

# ---------- POSTER FALLBACKS (missing 36-40) ----------
# Build dark cinematic gradient posters so videos never flash blank while loading.
print("Poster fallbacks:")
def gradient_poster(name, size, center, edge):
    w, h = size
    yy, xx = np.mgrid[0:h, 0:w]
    cx, cy = w*0.5, h*0.42
    d = np.sqrt(((xx-cx)/(w*0.62))**2 + ((yy-cy)/(h*0.62))**2)
    d = np.clip(d, 0, 1)
    t = (d**1.4)[..., None]
    col = (np.array(center)*(1-t) + np.array(edge)*t).astype(np.uint8)
    Image.fromarray(col, "RGB").save(os.path.join(IMG, name), "WEBP", quality=70, method=6)
    print(f"  -> {name}")

gradient_poster("poster-melt.webp",   (1280,720), (60,32,18), (8,6,6))
gradient_poster("poster-chips.webp",  (720,1280), (46,28,20), (6,5,6))
gradient_poster("poster-break.webp",  (1280,720), (52,30,20), (7,6,6))
gradient_poster("poster-baking.webp", (1280,720), (74,40,18), (10,7,5))
gradient_poster("poster-rotate.webp", (1280,720), (40,26,20), (6,6,7))
gradient_poster("poster-hero.webp",   (1280,720), (48,30,22), (6,5,5))

print("\nDONE.")
