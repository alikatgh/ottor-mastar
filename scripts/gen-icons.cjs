/**
 * gen-icons.cjs — generate social + web app icons for deployment.
 *
 *  - public/apple-touch-icon.png 180x180  full-bleed lily mark (iOS masks it)
 *  - public/icon-192.png / icon-512.png   PWA manifest icons (icon-512 doubles
 *                                         as the maskable icon — 13% safe margin)
 *  - public/favicon.svg                   rounded lily tile (embedded raster)
 *  - public/og-image.jpg        1200x630  social share card (from the Sardaana
 *                                         lily hero photo, smart-cropped)
 *
 * The app icons all derive from the brand master (design/app-icon-1024.png,
 * produced by gen-brand-master.cjs). Re-runnable: node scripts/gen-icons.cjs
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUB = path.join(__dirname, '../public');
const MASTER = path.join(__dirname, '../design/app-icon-1024.png');

async function main() {
  if (!fs.existsSync(MASTER)) {
    throw new Error(`missing brand master ${MASTER} — run: node scripts/gen-brand-master.cjs`);
  }
  // PWA + apple-touch icons — flattened opaque (no alpha) from the master.
  for (const size of [180, 192, 512]) {
    const name = size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`;
    await sharp(MASTER).resize(size, size).flatten({ background: '#FAEFDD' }).png().toFile(path.join(PUB, name));
    console.log(`✓ ${name}`);
  }

  // favicon.svg — a rounded lily tile with the icon embedded as a raster (the
  // art is photographic, so no vector mark). index.html keeps its SVG <link>.
  const favPng = await sharp(MASTER).resize(96, 96).flatten({ background: '#FAEFDD' }).png().toBuffer();
  const favSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
  <defs><clipPath id="r"><rect width="96" height="96" rx="20"/></clipPath></defs>
  <image href="data:image/png;base64,${favPng.toString('base64')}" width="96" height="96" clip-path="url(#r)"/>
</svg>`;
  fs.writeFileSync(path.join(PUB, 'favicon.svg'), favSvg);
  console.log('✓ favicon.svg (rounded lily tile)');

  // Branded social card: the hero lily meadow (cropped low to show the
  // Sardaana blooms) under a scrim, with the wordmark — mirrors the homepage hero.
  // HERO_IMAGE overrides the source (path relative to public/); defaults to the
  // Sardaana lily (plant-23) so the card stays branded if nothing is passed.
  const heroRel = process.env.HERO_IMAGE ?? 'plants/full/plant-23.webp';
  const hero = path.join(PUB, heroRel);
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
