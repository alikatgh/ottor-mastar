#!/usr/bin/env node
/**
 * gen-sitemap.cjs — write public/sitemap.xml from the app's routes + every
 * country's plant slugs.
 *
 * Slugs are resolved from the real COUNTRIES registry (all collections —
 * Yakutia + Mongolia), not by regex-scraping a single dataset, so a new
 * country's plants land in the sitemap automatically. It transpiles src/data +
 * src/types to CJS with the project's own `typescript` and requires the result,
 * the exact same bridge scripts/export-native-data.cjs uses.
 *
 * Runs automatically before every build (prebuild); re-run by hand after
 * adding/removing plants:  node scripts/gen-sitemap.cjs
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ORIGIN = 'https://ottormastar.aulenor.com';
const LASTMOD = '2026-07-06'; // bump when content changes materially

// Transpile the data modules (plain TS, no React) to CJS, then require them —
// same approach as scripts/export-native-data.cjs so the slug list is the real
// registry, every country included.
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ottor-sitemap-'));
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
    '--ignoreDeprecations', '6.0',
    '--skipLibCheck',
    '--outDir', outDir,
  ],
  { cwd: ROOT, stdio: 'inherit' }
);

const { COUNTRIES } = require(path.join(outDir, 'data', 'countries.js'));

const slugs = Object.values(COUNTRIES).flatMap((c) => c.plants.map((p) => p.slug));

const staticRoutes = ['/', '/catalog', '/search', '/about', '/legal', '/settings'];
const routes = [...staticRoutes, ...slugs.map((s) => `/plant/${s}`)];

const urls = routes
  .map(
    (r) =>
      `  <url>\n    <loc>${ORIGIN}${r}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n    <changefreq>monthly</changefreq>\n  </url>`
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

fs.writeFileSync(path.join(ROOT, 'public', 'sitemap.xml'), xml);
fs.rmSync(outDir, { recursive: true, force: true });
console.log(`Wrote public/sitemap.xml with ${routes.length} URLs (${slugs.length} plants).`);
