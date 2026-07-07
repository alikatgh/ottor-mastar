/**
 * gen-app-icons.cjs — generate the iOS app icon from the brand leaf mark.
 *
 *  - iOS: ios/.../Assets.xcassets/AppIcon.appiconset/icon-1024.png (single
 *         universal 1024² icon; Xcode 15+/App Store accept one size).
 *
 * Android already ships a complete adaptive icon (vector foreground +
 * mipmap-anydpi-v26), so it isn't touched here.
 *
 * The mark matches the web apple-touch-icon (see gen-icons.cjs). Full-bleed —
 * iOS applies its own corner mask.
 *
 * Re-runnable: node scripts/gen-app-icons.cjs
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');

// Brand leaf mark on forest green. viewBox 0..32; sharp renders the vector
// crisply at any target size.
const FULL_BLEED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#2C5A2E"/>
  <path d="M16 6 C16 6 10 12 10 18 C10 22 12.5 26 16 26 C19.5 26 22 22 22 18 C22 12 16 6 16 6Z" fill="#4A8C3F" opacity="0.7"/>
  <path d="M16 8 C16 8 12 13 12 18 C12 21 13.5 24 16 24 C18.5 24 20 21 20 18 C20 13 16 8 16 8Z" fill="#6BAF5E"/>
  <line x1="16" y1="14" x2="16" y2="24" stroke="#2C5A2E" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M16 18 C14 16.5 12.5 17 12 18" stroke="#2C5A2E" stroke-width="1" fill="none" stroke-linecap="round"/>
  <path d="M16 20 C18 18.5 19.5 19 20 20" stroke="#2C5A2E" stroke-width="1" fill="none" stroke-linecap="round"/>
</svg>`;

async function main() {
  // ---- iOS: single 1024² app icon ----
  const iosDir = path.join(ROOT, 'ios/OttorMastar/Resources/Assets.xcassets/AppIcon.appiconset');
  fs.mkdirSync(iosDir, { recursive: true });
  await sharp(Buffer.from(FULL_BLEED))
    .resize(1024, 1024)
    .flatten({ background: '#2C5A2E' })
    .png()
    .toFile(path.join(iosDir, 'icon-1024.png'));
  console.log('iOS: wrote AppIcon.appiconset/icon-1024.png');
}

main().catch((e) => { console.error(e); process.exit(1); });
