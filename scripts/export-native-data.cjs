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
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
// IMAGE_HOST overrides the CDN origin baked into the export (e.g. a staging
// deploy); defaults to the production host so an unset env is a no-op.
const IMAGE_HOST = process.env.IMAGE_HOST ?? 'https://ottormastar.aulenor.com';

// 1. Transpile the data modules (they are plain TS, no React) to CJS.
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ottor-data-'));
const tsc = path.join(ROOT, 'node_modules', '.bin', 'tsc');
execFileSync(
  tsc,
  [
    'src/data/plants.ts',
    'src/data/mongolia.ts',
    'src/data/countries.ts',
    'src/data/available-illustrations.ts',
    'src/types/index.ts',
    '--ignoreConfig',
    '--module', 'commonjs',
    '--target', 'es2020',
    '--moduleResolution', 'node',
    // TS 6 deprecates node10 resolution; it's exactly right for this one-off
    // CJS transpile of extensionless-relative-import sources.
    '--ignoreDeprecations', '6.0',
    '--skipLibCheck',
    '--outDir', outDir,
  ],
  { cwd: ROOT, stdio: 'inherit' }
);

const { COUNTRIES, DEFAULT_COUNTRY } = require(path.join(outDir, 'data', 'countries.js'));
const { hasIllustration } = require(path.join(outDir, 'data', 'plants.js'));

// 2. Shape the export — bake hasIllustration so apps never need the manifest.
const data = {
  version: 1,
  generatedFrom: 'src/data (scripts/export-native-data.cjs)',
  imageHost: IMAGE_HOST,
  defaultCountry: DEFAULT_COUNTRY,
  countries: Object.values(COUNTRIES).map((country) => ({
    id: country.id,
    imageBase: country.imageBase,
    heroSlug: country.heroSlug,
    languages: country.languages,
    defaultLanguage: country.defaultLanguage,
    plants: country.plants.map((p) => ({
      id: p.id,
      slug: p.slug,
      imageId: p.imageId,
      hasIllustration: hasIllustration(p),
      names: p.names,
      description: p.description,
      medicinalUses: p.medicinalUses,
      habitat: p.habitat,
      bloomingSeason: p.bloomingSeason,
      categories: p.categories,
      color: p.color,
    })),
  })),
};

const json = JSON.stringify(data, null, 2);

// 3. Write everywhere the apps expect it.
const targets = [
  'shared/plants.json',
  'ios/OttorMastar/Resources/plants.json',
  'android/app/src/main/assets/plants.json',
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
  for (const country of Object.values(COUNTRIES)) {
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

  fs.rmSync(outDir, { recursive: true, force: true });
  const total = data.countries.reduce((n, c) => n + c.plants.length, 0);
  console.log(`done — ${total} plants across ${data.countries.length} countries`);
})().catch((e) => { console.error(e); process.exit(1); });
