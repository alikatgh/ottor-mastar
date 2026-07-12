/**
 * build-catalog.cjs — the single source of truth for the exported dataset shape.
 *
 * Transpiles src/data + src/types with the project's own `typescript` and returns
 * the canonical catalog object. Both consumers emit BYTE-IDENTICAL JSON so the
 * native apps can decode a hosted `public/catalog.json` with the exact same model
 * they use for the bundled `plants.json`:
 *   - scripts/export-native-data.cjs  → shared/ + native bundles (+ images)
 *   - scripts/gen-catalog-json.cjs    → public/catalog.json (hosted, no images)
 *
 * `version` is the SCHEMA version — bump it only on a breaking shape change, so an
 * older app can refuse a newer catalog (see PlantStore.schemaVersion on each app).
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');

function buildCatalog() {
  // IMAGE_HOST overrides the CDN origin baked into the export (e.g. a staging
  // deploy); defaults to the production host so an unset env is a no-op.
  const IMAGE_HOST = process.env.IMAGE_HOST ?? 'https://ottormastar.aulenor.com';

  // Transpile the data modules (plain TS, no React) to CJS in a temp dir.
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ottor-data-'));
  try {
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

    // Bake hasIllustration so apps never need the manifest.
    return {
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
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
}

module.exports = { buildCatalog };
