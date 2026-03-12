#!/usr/bin/env python3
"""
Radium 2 Banner - Mockup Row Edition
470x320px: blurred starburst bg, title top, tagline bottom, row of watch mockups center

Usage: python3 banner_mockup.py
Requires: Pillow, watch mockup screenshots in the same directory as PICKS paths.
"""

import math, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os

W, H = 470, 320
OUT = "radium2_banner_mockup.png"

# ── Colours ────────────────────────────────────────────────────────────────────
MINT        = (180, 255, 210)
MINT_DIM    = ( 80, 160, 110)
TEAL_ACCENT = ( 60, 220, 180)
WHITE       = (255, 255, 255)
BG_DARK     = (  8,  12,  10)

# ── 1. Background: blurred 24h starburst ───────────────────────────────────────
bg = Image.new("RGB", (W, H), BG_DARK)
bg_draw = ImageDraw.Draw(bg)

cx, cy = W // 2, H // 2
NUM_SPOKES = 48
rng = random.Random(42)
for i in range(NUM_SPOKES):
    angle = (2 * math.pi * i) / NUM_SPOKES
    brightness = rng.randint(18, 55)
    color = (brightness, int(brightness * 1.3), brightness)
    spoke_w = rng.randint(1, 3)
    r = max(W, H) * 0.85
    x1 = cx + math.cos(angle) * 4
    y1 = cy + math.sin(angle) * 4
    x2 = cx + math.cos(angle) * r
    y2 = cy + math.sin(angle) * r
    bg_draw.line([(x1, y1), (x2, y2)], fill=color, width=spoke_w)

bg = bg.filter(ImageFilter.GaussianBlur(radius=12))

# Subtle dark vignette
bg_composite = Image.new("RGB", (W, H))
bg_composite.paste(bg)
dark_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
dov = ImageDraw.Draw(dark_overlay)
for r in range(max(W, H), 0, -2):
    frac = r / max(W, H)
    alpha = int((1 - frac) * 60)
    dov.ellipse([cx - r, cy - r, cx + r, cy + r],
                fill=(0, 0, 0, alpha))
bg_rgba = bg_composite.convert("RGBA")
bg_rgba = Image.alpha_composite(bg_rgba, dark_overlay)
bg = bg_rgba.convert("RGB")

canvas = bg.copy()
draw = ImageDraw.Draw(canvas)

# ── 2. Load watch mockup images ────────────────────────────────────────────────
# Selection order: B&W Pebble OG, color rect with overlay, round hero,
#                  white round with time, dark round with overlay
# Update these paths to match your screenshot locations:
PICKS = [
    "screenshots/Screenshot_20260312_at_9_45_08_AM.png",   # B&W Pebble OG (far left)
    "screenshots/Screenshot_20260312_at_9_50_08_AM.png",   # color Time rect + overlay
    "screenshots/Screenshot_20260312_at_9_50_47_AM.png",   # white round with overlay (HERO)
    "screenshots/Screenshot_20260312_at_9_53_19_AM.png",   # white round + overlay
    "screenshots/Screenshot_20260312_at_9_47_53_AM.png",   # dark round + overlay
]

ROW_CY = 162          # vertical centre of watch row
HERO_H = 172          # tallest (centre) watch height in pixels
SIZES  = [0.70, 0.84, 1.0, 0.84, 0.70]   # relative heights per slot

ASPECT = 420 / 560    # source image aspect ratio

total_w = 0
GAP = 6
for s in SIZES:
    h = int(HERO_H * s)
    w = int(h * ASPECT)
    total_w += w
total_w += GAP * (len(SIZES) - 1)

start_x = (W - total_w) // 2

x_cursor = start_x
for idx, (path, scale) in enumerate(zip(PICKS, SIZES)):
    img = Image.open(path).convert("RGBA")
    orig_w, orig_h = img.size
    # Crop 5% off each edge to remove screenshot border
    crop_pct = 0.05
    cx0 = int(orig_w * crop_pct)
    cy0 = int(orig_h * crop_pct)
    img = img.crop((cx0, cy0, orig_w - cx0, orig_h - cy0))

    h = int(HERO_H * scale)
    w = int(h * ASPECT)
    img = img.resize((w, h), Image.LANCZOS)

    # Soft vignette mask: fade corners, keep centre opaque
    mask = Image.new("L", (w, h), 255)
    mask_draw = ImageDraw.Draw(mask)
    fade = max(2, int(min(w, h) * 0.06))
    for i in range(fade):
        v = int(255 * (i / fade) ** 2)
        mask_draw.rectangle([i, i, w - 1 - i, h - 1 - i], outline=v)
    mask = mask.filter(ImageFilter.GaussianBlur(3))
    img.putalpha(mask)

    paste_y = ROW_CY - h // 2
    paste_x = x_cursor

    # Soft drop shadow
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.ellipse([paste_x + 4, paste_y + h - 10,
                         paste_x + w - 4, paste_y + h + 14],
                        fill=(0, 0, 0, 80))
    shadow = shadow.filter(ImageFilter.GaussianBlur(6))
    canvas_rgba = canvas.convert("RGBA")
    canvas_rgba = Image.alpha_composite(canvas_rgba, shadow)
    canvas = canvas_rgba.convert("RGB")

    # Paste watch
    canvas_rgba = canvas.convert("RGBA")
    canvas_rgba.paste(img, (paste_x, paste_y), img)
    canvas = canvas_rgba.convert("RGB")

    x_cursor += w + GAP

# ── 3. Title text: "Radium" + superscript "2" ─────────────────────────────────
draw = ImageDraw.Draw(canvas)

FONT_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
]
font_path = None
for fp in FONT_PATHS:
    if os.path.exists(fp):
        font_path = fp
        break

TITLE_Y = 14
if font_path:
    font_title = ImageFont.truetype(font_path, 46)
    font_super = ImageFont.truetype(font_path, 28)
    font_tag   = ImageFont.truetype(font_path, 14)
else:
    font_title = ImageFont.load_default()
    font_super = font_title
    font_tag   = font_title

# Glow pass for "Radium"
title_text = "Radium"
for glow_r in [6, 4, 2]:
    glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow_layer)
    gd.text((28, TITLE_Y), title_text, font=font_title,
            fill=(MINT[0], MINT[1], MINT[2], 80))
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(glow_r))
    canvas_rgba = canvas.convert("RGBA")
    canvas_rgba = Image.alpha_composite(canvas_rgba, glow_layer)
    canvas = canvas_rgba.convert("RGB")

draw = ImageDraw.Draw(canvas)
draw.text((28, TITLE_Y), title_text, font=font_title, fill=MINT)

bbox = draw.textbbox((0, 0), title_text, font=font_title)
title_w = bbox[2] - bbox[0]
super_x = 28 + title_w + 4
super_y = TITLE_Y + 2

# Glow for "2"
for glow_r in [5, 3]:
    glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow_layer)
    gd.text((super_x, super_y), "2", font=font_super,
            fill=(TEAL_ACCENT[0], TEAL_ACCENT[1], TEAL_ACCENT[2], 100))
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(glow_r))
    canvas_rgba = canvas.convert("RGBA")
    canvas_rgba = Image.alpha_composite(canvas_rgba, glow_layer)
    canvas = canvas_rgba.convert("RGB")

draw = ImageDraw.Draw(canvas)
draw.text((super_x, super_y), "2", font=font_super, fill=TEAL_ACCENT)

# ── 4. Tagline at bottom ───────────────────────────────────────────────────────
tagline = "Every bar tells time."
tag_bbox = draw.textbbox((0, 0), tagline, font=font_tag)
tag_w = tag_bbox[2] - tag_bbox[0]
tag_x = (W - tag_w) // 2
tag_y = H - 28

for glow_r in [3, 2]:
    glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow_layer)
    gd.text((tag_x, tag_y), tagline, font=font_tag,
            fill=(MINT[0], MINT[1], MINT[2], 70))
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(glow_r))
    canvas_rgba = canvas.convert("RGBA")
    canvas_rgba = Image.alpha_composite(canvas_rgba, glow_layer)
    canvas = canvas_rgba.convert("RGB")

draw = ImageDraw.Draw(canvas)
draw.text((tag_x, tag_y), tagline, font=font_tag, fill=(200, 240, 220))

# ── 5. Thin mint rule lines (top & bottom accent) ─────────────────────────────
draw.line([(0, 8), (W, 8)], fill=(MINT[0], MINT[1], MINT[2], 80), width=1)
draw.line([(0, H - 8), (W, H - 8)], fill=(MINT[0], MINT[1], MINT[2], 80), width=1)

# ── 6. Save ────────────────────────────────────────────────────────────────────
canvas.save(OUT, "PNG")
print(f"Saved: {OUT}  size={canvas.size}")
