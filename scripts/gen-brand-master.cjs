/**
 * gen-brand-master.cjs — turn the supplied lily artwork into clean, full-bleed
 * app-icon sources the other icon scripts consume.
 *
 * The source (`ottar_mastar_new_logo.png`, 2048²) is an app-icon *mockup*: a
 * rounded parchment card with a drop shadow on a darker backdrop. Used as-is it
 * gives an "icon inside an icon" (double-rounded, alpha shadow, cream border) —
 * and iOS/Android apply their OWN mask, so the baked card is wrong. This script
 * recovers just the lily and re-lays it, full-bleed, on a flat cream field.
 *
 * Detection: a pixel is "lily" if clearly GREEN (g dominant — catches the dark
 * lower foliage) OR strongly saturated (the orange blooms). Cream, backdrop and
 * the warm-gray shadow are all r-dominant + low-spread, so both rules skip them.
 * Robust bbox: first/last row/column clearing MIN_LINE saturated pixels, so a
 * few stray shadow specks can't drag the box to the card edge.
 *
 * Outputs (all re-derivable — run: node scripts/gen-brand-master.cjs):
 *   design/app-icon-1024.png                         iOS + web master (13% margin — iOS squircle)
 *   android/.../mipmap-{m,h,xh,xxh,xxxh}dpi/
 *       ic_launcher_foreground.png                   adaptive foreground (19% margin — circle safe zone)
 *
 * Consumed by gen-app-icons.cjs (iOS/desktop) and gen-icons.cjs (web PWA + favicon).
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'ottar_mastar_new_logo.png');

const CREAM = { r: 250, g: 239, b: 221 }; // #FAEFDD — the artwork's parchment field
const SAT_THRESHOLD = 70;                  // channel spread for "saturated" (the card's soft shadow peaks ~43)
const MIN_LINE = 10;                       // min saturated px in a row/col for it to bound the bloom

// Android adaptive-icon foreground density buckets (px at 108dp base).
const ANDROID_BUCKETS = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };

async function detectLily() {
  const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: ch } = info;
  const colCnt = new Uint32Array(W), rowCnt = new Uint32Array(H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * ch;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const green = g > r + 8 && g > b + 8;
      const saturated = Math.max(r, g, b) - Math.min(r, g, b) > SAT_THRESHOLD;
      if (green || saturated) { colCnt[x]++; rowCnt[y]++; }
    }
  }
  let minX = 0, maxX = W - 1, minY = 0, maxY = H - 1;
  while (minX < W && colCnt[minX] < MIN_LINE) minX++;
  while (maxX > 0 && colCnt[maxX] < MIN_LINE) maxX--;
  while (minY < H && rowCnt[minY] < MIN_LINE) minY++;
  while (maxY > 0 && rowCnt[maxY] < MIN_LINE) maxY--;
  const pad = 12;
  minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
  maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(H - 1, maxY + pad);
  const cw = maxX - minX + 1, chh = maxY - minY + 1;
  console.log(`lily bbox: x[${minX}..${maxX}] y[${minY}..${maxY}]  ${cw}x${chh}`);
  return { buf: await sharp(SRC).extract({ left: minX, top: minY, width: cw, height: chh }).toBuffer(), cw, chh };
}

/** Centre the lily on a flat-cream square `size` with `margin` fraction of clear cream per side. */
async function renderTile(lily, size, margin) {
  const inner = Math.round(size * (1 - 2 * margin));
  const scale = inner / Math.max(lily.cw, lily.chh);
  const rw = Math.round(lily.cw * scale), rh = Math.round(lily.chh * scale);
  const resized = await sharp(lily.buf).resize(rw, rh).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: { ...CREAM, alpha: 1 } } })
    .composite([{ input: resized, left: Math.round((size - rw) / 2), top: Math.round((size - rh) / 2) }])
    .png()
    .toBuffer();
}

async function main() {
  const lily = await detectLily();

  // iOS + web master — 13% margin (iOS applies a gentle squircle mask).
  const masterDir = path.join(ROOT, 'design');
  fs.mkdirSync(masterDir, { recursive: true });
  fs.writeFileSync(path.join(masterDir, 'app-icon-1024.png'), await renderTile(lily, 1024, 0.13));
  console.log('wrote design/app-icon-1024.png (13% margin)');

  // Android adaptive foreground — 19% margin so the strict 66dp circle safe zone
  // never clips a petal; full-bleed cream fills to the 108dp edge.
  const fg = await renderTile(lily, ANDROID_BUCKETS.xxxhdpi, 0.19);
  for (const [bucket, px] of Object.entries(ANDROID_BUCKETS)) {
    const dir = path.join(ROOT, 'android/app/src/main/res', `mipmap-${bucket}`);
    fs.mkdirSync(dir, { recursive: true });
    await sharp(fg).resize(px, px).png().toFile(path.join(dir, 'ic_launcher_foreground.png'));
  }
  console.log(`wrote Android ic_launcher_foreground.png × ${Object.keys(ANDROID_BUCKETS).length} buckets (19% margin)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
