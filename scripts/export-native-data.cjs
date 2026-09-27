#!/usr/bin/env node
/**
 * Export the TypeScript plant dataset to JSON for the native apps.
 *
 * The iOS (ios/) and Android (android/) apps bundle a snapshot of the same
 * data the web app ships. This script is the single bridge: it transpiles
 * src/data + src/types with the project's own `typescript` to CommonJS in a
 * temp dir, requires the result, and emits:
 *
 *   shared/plants.json                      — countries + plants, hasIllustration baked in
 *   ios/OttorMastar/Resources/plants.json   — copy for the iOS bundle
 *   ios/OttorMastar/Resources/locale-*.json — trilingual UI strings
 *   android/app/src/main/assets/plants.json + locale-*.json
 *
 * Run after ANY edit to src/data/* or src/i18n/locales/*:
 *   node scripts/export-native-data.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const { buildCatalog } = require('./lib/build-catalog.cjs');

const ROOT = path.resolve(__dirname, '..');

// 1. Build the canonical catalog (transpiles src/data). The shape lives in
//    scripts/lib/build-catalog.cjs and is shared with the hosted
//    public/catalog.json, so the two can never drift.
const data = buildCatalog();

const json = JSON.stringify(data, null, 2);

// 2. Write everywhere the apps expect it. `public/catalog.json` is the hosted
//    copy the apps fetch at runtime for over-the-air content updates; it is
//    byte-identical to the bundled snapshot, so both decode with one model.
const targets = [
  'shared/plants.json',
  'ios/OttorMastar/Resources/plants.json',
  'android/app/src/main/assets/plants.json',
  'public/catalog.json',
];
for (const rel of targets) {
  const dest = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, json);
  console.log(`wrote ${rel}`);
}

// 4. Locale strings — copied verbatim so all three platforms share one source.
for (const lang of ['sah', 'ru', 'en', 'mn', 'zh']) {
  const src = path.join(ROOT, 'src', 'i18n', 'locales', `${lang}.json`);
  for (const destRel of [
    `ios/OttorMastar/Resources/locale-${lang}.json`,
    `android/app/src/main/assets/locale-${lang}.json`,
    `shared/locale-${lang}.json`,
  ]) {
    const dest = path.join(ROOT, destRel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`wrote ${destRel}`);
  }
}

// 4b. Community news — bundle the current public/news.json as each app's
// offline fallback (the apps also fetch the hosted copy over the air).
{
  const src = path.join(ROOT, 'public', 'news.json');
  if (fs.existsSync(src)) {
    for (const destRel of [
      'ios/OttorMastar/Resources/news.json',
      'android/app/src/main/assets/news.json',
    ]) {
      const dest = path.join(ROOT, destRel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
      console.log(`wrote ${destRel}`);
    }
  }
}

// 5. Bundle thumb + medium images (~16 MB) so the apps are fully offline —
//    this is a field guide; assume no signal. `full` stays remote-only
//    (28 MB) and lights up for deep zoom once the site is deployed.
// Clean the destination image roots first, so assets removed from public/
// (e.g. rejected plates) don't linger stale in the native bundles.
for (const destRoot of [
  'ios/OttorMastar/Resources/PlantImages',
  'android/app/src/main/assets/images',
]) {
  fs.rmSync(path.join(ROOT, destRoot), { recursive: true, force: true });
}

// Plate scans (*-ill.webp) carry a flat neutral margin around the aged-paper
// sheet; trim it at the source so native layouts get the paper edge-to-edge
// (the in-app zoom hacks that compensated for the margin are gone). Photos
// copy verbatim. Trim runs once per source file, then fans out to both apps.
const sharp = require('sharp');

(async () => {
  let copied = 0;
  for (const country of data.countries) {
    const base = country.imageBase.replace(/^\//, ''); // 'plants' | 'mongolia'
    for (const size of ['thumb', 'medium']) {
      const srcDir = path.join(ROOT, 'public', base, size);
      if (!fs.existsSync(srcDir)) continue;
      const destDirs = [
        `ios/OttorMastar/Resources/PlantImages/${base}/${size}`,
        `android/app/src/main/assets/images/${base}/${size}`,
      ].map((rel) => {
        const dir = path.join(ROOT, rel);
        fs.mkdirSync(dir, { recursive: true });
        return dir;
      });
      for (const f of fs.readdirSync(srcDir)) {
        if (!f.endsWith('.webp')) continue;
        const src = path.join(srcDir, f);
        if (f.endsWith('-ill.webp')) {
          const trimmed = await sharp(src)
            .trim({ threshold: 25 })
            .webp({ quality: 88 })
            .toBuffer();
          for (const dir of destDirs) fs.writeFileSync(path.join(dir, f), trimmed);
        } else {
          for (const dir of destDirs) fs.copyFileSync(src, path.join(dir, f));
        }
        copied += destDirs.length;
      }
    }
  }
  console.log(`copied ${copied} image files into app bundles (plates trimmed)`);

  const total = data.countries.reduce((n, c) => n + c.plants.length, 0);
  console.log(`done — ${total} plants across ${data.countries.length} countries`);
})().catch((e) => { console.error(e); process.exit(1); });
