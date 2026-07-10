/**
 * gen-app-icons.cjs — generate the iOS + desktop app icon from the Sardaana
 * botanical plate (the collection's hero artwork).
 *
 * Instead of a generic flat leaf glyph, the icon is a square crop of the red
 * Lilium pensylvanicum bloom cluster from the actual plate art, on its aged
 * parchment — instantly recognizable on a home screen and 1:1 with the app's
 * herbarium identity. A hairline forest double-frame reads as a museum mount.
 *
 *  - iOS: ios/.../Assets.xcassets/AppIcon.appiconset/icon-1024.png (single
 *         universal 1024² icon; Xcode 15+/App Store accept one size).
 *  - Desktop: desktop/build/icon.png (electron-builder converts per-platform).
 *
 * Android already ships a complete adaptive icon (vector foreground +
 * mipmap-anydpi-v26), so it isn't touched here.
 *
 * Full-bleed — iOS applies its own corner mask.
 * Re-runnable: node scripts/gen-app-icons.cjs
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');

// Hand-made master wins: drop a generated/designed 1024×1024 PNG here
// (e.g. from Gemini/Midjourney) and re-run this script — it is resized,
// flattened, and copied to every platform. The plate-crop below is only
// the fallback when no master exists.
const MASTER = path.join(ROOT, 'design/app-icon-1024.png');

// Source plate: 800×800, blooms clustered in the upper half.
const PLATE = path.join(ROOT, 'public/plants/medium/plant-23-ill.webp');
// Square crop framing the bloom cluster (left, top, size in source pixels).
const CROP = { left: 168, top: 118, width: 465, height: 465 };

// Museum-mount frame + soft vignette, composited over the crop at 1024².
const FRAME = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="vig" cx="50%" cy="46%" r="72%">
      <stop offset="70%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#3a2f1c" stop-opacity="0.22"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#vig)"/>
  <rect x="40" y="40" width="944" height="944" fill="none"
        stroke="#2C5A2E" stroke-opacity="0.55" stroke-width="6"/>
  <rect x="58" y="58" width="908" height="908" fill="none"
        stroke="#2C5A2E" stroke-opacity="0.35" stroke-width="2"/>
</svg>`;

async function renderIcon(outFile) {
  if (fs.existsSync(MASTER)) {
    await sharp(MASTER)
      .resize(1024, 1024)
      .flatten({ background: '#F4EDDC' })
      .png()
      .toFile(outFile);
    return;
  }
  await sharp(PLATE)
    .extract(CROP)
    .resize(1024, 1024)
    .modulate({ saturation: 1.14, brightness: 1.03 })
    .composite([{ input: Buffer.from(FRAME) }])
    .flatten({ background: '#F4EDDC' })
    .png()
    .toFile(outFile);
}

async function main() {
  // ---- iOS (and Mac Catalyst): single 1024² app icon ----
  const iosDir = path.join(ROOT, 'ios/OttorMastar/Resources/Assets.xcassets/AppIcon.appiconset');
  fs.mkdirSync(iosDir, { recursive: true });
  await renderIcon(path.join(iosDir, 'icon-1024.png'));
  console.log('iOS: wrote AppIcon.appiconset/icon-1024.png');

  // ---- Desktop (Electron / electron-builder): build/icon.png ----
  const desktopDir = path.join(ROOT, 'desktop/build');
  fs.mkdirSync(desktopDir, { recursive: true });
  await renderIcon(path.join(desktopDir, 'icon.png'));
  console.log('Desktop: wrote desktop/build/icon.png');
}

main().catch((e) => { console.error(e); process.exit(1); });
