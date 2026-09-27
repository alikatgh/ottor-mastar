#!/usr/bin/env python3
"""Compose the Google Play feature graphic (1024x500) for Ottor Mastar.

Herbarium look: parchment-cream ground, "Оттор Мастар" serif wordmark + Russian
subtitle on the left, the Sardaana (Lilium pensylvanicum) botanical plate framed
on the right. Uses the app's own medium illustration so the banner matches the
in-app art. Output: appstore/play/feature-graphic-1024x500.png (opaque, no alpha).
"""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1024, 500
CREAM = (241, 236, 225)
INK = (43, 43, 40)
GREEN = (47, 74, 52)
MUTED = (110, 112, 100)
FRAME = (74, 70, 60)

SERIF_B = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
SERIF = "/System/Library/Fonts/Supplemental/Georgia.ttf"
PLATE = "android/app/src/main/assets/images/plants/medium/plant-01-ill.webp"

img = Image.new("RGB", (W, H), CREAM)
d = ImageDraw.Draw(img)

# subtle inner hairline border (herbarium plate feel)
d.rectangle([16, 16, W - 17, H - 17], outline=(214, 206, 190), width=2)

# ── right: botanical plate, framed ──
plate = Image.open(PLATE).convert("RGB")
box_w, box_h = 360, 420
pr = min(box_w / plate.width, box_h / plate.height)
pw, ph = int(plate.width * pr), int(plate.height * pr)
plate = plate.resize((pw, ph), Image.LANCZOS)
px = W - 40 - pw
py = (H - ph) // 2
# thin dark frame + soft mat
d.rectangle([px - 10, py - 10, px + pw + 9, py + ph + 9], fill=(248, 245, 237), outline=FRAME, width=2)
img.paste(plate, (px, py))

# ── left: text column ──
x = 70
f_over = ImageFont.truetype(SERIF_B, 20)
f_word = ImageFont.truetype(SERIF_B, 82)
f_sub = ImageFont.truetype(SERIF, 30)
f_tag = ImageFont.truetype(SERIF, 22)

# overline (letter-spaced)
over = "Г Е Р Б А Р И Й   З Е М Л И   С А Х А"
d.text((x, 150), over, font=f_over, fill=GREEN)

# wordmark
d.text((x, 182), "Оттор", font=f_word, fill=GREEN)
d.text((x, 268), "Мастар", font=f_word, fill=GREEN)

# subtitle
d.text((x, 372), "Дикорастущие растения Якутии", font=f_sub, fill=INK)

# tagline
d.text((x, 418), "23 вида · офлайн · без рекламы", font=f_tag, fill=MUTED)

os.makedirs("appstore/play", exist_ok=True)
out = "appstore/play/feature-graphic-1024x500.png"
img.save(out)
print("wrote", out, img.size, img.mode)
