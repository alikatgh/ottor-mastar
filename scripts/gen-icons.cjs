/**
 * gen-icons.cjs — generate social + app icons for deployment.
 *
 *  - public/og-image.jpg        1200x630  social share card (from the Sardaana
 *                                         lily hero photo, smart-cropped)
 *  - public/apple-touch-icon.png 180x180  full-bleed leaf mark (iOS masks it)
 *  - public/icon-192.png / icon-512.png   PWA manifest icons
 *
 * Re-runnable: node scripts/gen-icons.cjs
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUB = path.join(__dirname, '../public');

// Full-bleed leaf mark (no corner radius — iOS/Android apply their own mask).
const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#2C5A2E"/>
  <path d="M16 6 C16 6 10 12 10 18 C10 22 12.5 26 16 26 C19.5 26 22 22 22 18 C22 12 16 6 16 6Z" fill="#4A8C3F" opacity="0.7"/>
  <path d="M16 8 C16 8 12 13 12 18 C12 21 13.5 24 16 24 C18.5 24 20 21 20 18 C20 13 16 8 16 8Z" fill="#6BAF5E"/>
  <line x1="16" y1="14" x2="16" y2="24" stroke="#2C5A2E" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M16 18 C14 16.5 12.5 17 12 18" stroke="#2C5A2E" stroke-width="1" fill="none" stroke-linecap="round"/>
  <path d="M16 20 C18 18.5 19.5 19 20 20" stroke="#2C5A2E" stroke-width="1" fill="none" stroke-linecap="round"/>
</svg>`;

async function main() {
  const iconBuf = Buffer.from(ICON_SVG);
  for (const size of [180, 192, 512]) {
    const name = size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`;
    await sharp(iconBuf, { density: 400 }).resize(size, size).png().toFile(path.join(PUB, name));
    console.log(`✓ ${name}`);
  }

  // Branded social card: the hero lily meadow (cropped low to show the
  // Sardaana blooms) under a scrim, with the wordmark — mirrors the homepage hero.
  const hero = path.join(PUB, 'plants/full/plant-23.webp');
  const base = await sharp(hero)
    .resize(1200, 630, { fit: 'cover', position: 'bottom' })
    .toBuffer();
  const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#000" stop-opacity="0.15"/>
        <stop offset="0.55" stop-color="#000" stop-opacity="0.45"/>
        <stop offset="1" stop-color="#000" stop-opacity="0.85"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#g)"/>
    <text x="72" y="452" font-family="Playfair Display, Georgia, serif" font-size="34" fill="#ffffff" fill-opacity="0.82" letter-spacing="6">САХА СИРИН ҮҮНЭЭЙИЛЭРЭ</text>
    <text x="68" y="540" font-family="Playfair Display, Georgia, serif" font-weight="700" font-size="92" fill="#ffffff">Оттор Мастар</text>
    <text x="72" y="586" font-family="Inter, Arial, sans-serif" font-size="30" fill="#ffffff" fill-opacity="0.9">Plants of Yakutia · Травы и деревья Якутии</text>
  </svg>`);
  await sharp(base)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .jpeg({ quality: 84 })
    .toFile(path.join(PUB, 'og-image.jpg'));
  console.log('✓ og-image.jpg (1200x630, branded)');
}

main().catch((e) => { console.error(e); process.exit(1); });
