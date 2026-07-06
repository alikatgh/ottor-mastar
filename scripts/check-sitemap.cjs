#!/usr/bin/env node
/**
 * check-sitemap.cjs — CI guard that public/sitemap.xml stays in sync with the
 * dataset and the app's routes.
 *
 * Failure it catches: a plant is added to (or removed from) any country's
 * dataset but `scripts/gen-sitemap.cjs` is not re-run, so the deployed sitemap
 * under- or over-lists /plant/<slug> URLs. It also caught the original bug that
 * gen-sitemap only mined src/data/plants.ts (Yakutia) and silently dropped every
 * Mongolia plant, and that /settings was absent from the static routes.
 *
 * Assertions, Node-stdlib only (no deps, no transpile):
 *   1. The number of  /plant/<slug>  URLs in the sitemap === the total number of
 *      plant slugs across ALL countries (Yakutia + Mongolia + any future set).
 *   2. Every dataset slug appears exactly once; no extra/stale plant URLs.
 *   3. The /settings route is present in the sitemap.
 *
 * Slugs are mined from src/data/*.ts by the same regex gen-sitemap uses, so the
 * two scripts agree by construction. If a new country module is added under
 * src/data/, it is picked up automatically.
 *
 * Exit 1 on any mismatch; 0 when in sync.
 * Run:  node scripts/check-sitemap.cjs
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const SITEMAP = path.join(ROOT, 'public', 'sitemap.xml');

const RESET = process.stdout.isTTY ? '\x1b[0m' : '';
const RED = process.stdout.isTTY ? '\x1b[31m' : '';
const GREEN = process.stdout.isTTY ? '\x1b[32m' : '';
const DIM = process.stdout.isTTY ? '\x1b[2m' : '';

function fail(msg) {
  console.error(`${RED}FAIL${RESET} — ${msg}`);
  process.exit(1);
}

// --------------------------------------------------------------------------
// 1. Mine every plant slug from the country datasets.
//    Only the two shipped collections define plant slugs; countries.ts is the
//    registry (no `slug:` literals of its own) and available-illustrations.ts /
//    the manifest are keyed differently, so scanning every *.ts here is safe and
//    future-proof — a new mongolia-style module is included automatically.
// --------------------------------------------------------------------------
const SLUG_RE = /slug:\s*'([^']+)'/g;
const slugCounts = new Map(); // slug -> occurrences (to catch cross-file dup)

let dataFiles;
try {
  dataFiles = fs
    .readdirSync(DATA_DIR)
    .filter((f) => /\.ts$/.test(f))
    .filter((f) => f !== 'countries.ts' && f !== 'available-illustrations.ts');
} catch (err) {
  fail(`cannot read ${path.relative(ROOT, DATA_DIR)}: ${err.message}`);
}

for (const f of dataFiles) {
  const text = fs.readFileSync(path.join(DATA_DIR, f), 'utf8');
  for (const m of text.matchAll(SLUG_RE)) {
    slugCounts.set(m[1], (slugCounts.get(m[1]) || 0) + 1);
  }
}

const dataSlugs = [...slugCounts.keys()];
const totalPlants = dataSlugs.length;

// --------------------------------------------------------------------------
// 2. Parse the sitemap's /plant/<slug> URLs and its route set.
// --------------------------------------------------------------------------
let xml;
try {
  xml = fs.readFileSync(SITEMAP, 'utf8');
} catch (err) {
  fail(`cannot read ${path.relative(ROOT, SITEMAP)}: ${err.message} (run scripts/gen-sitemap.cjs)`);
}

const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const paths = locs.map((u) => {
  try {
    return new URL(u).pathname;
  } catch {
    return u; // tolerate a bare path if the origin is ever dropped
  }
});

const plantPaths = paths.filter((p) => p.startsWith('/plant/'));
const sitemapSlugs = plantPaths.map((p) => p.slice('/plant/'.length).replace(/\/$/, ''));
const hasSettings = paths.some((p) => p === '/settings' || p === '/settings/');

// --------------------------------------------------------------------------
// 3. Assert.
// --------------------------------------------------------------------------
console.log('sitemap check');
console.log(
  `${DIM}datasets: ${dataFiles.join(', ')} → ${totalPlants} plant slugs; ` +
    `sitemap: ${locs.length} URLs, ${plantPaths.length} /plant/*${RESET}`
);

const problems = [];

// Duplicate slugs in the dataset itself (should never happen; guarded in-app).
for (const [slug, n] of slugCounts) {
  if (n > 1) problems.push(`dataset slug "${slug}" appears ${n}× across data modules`);
}

// Count parity.
if (plantPaths.length !== totalPlants) {
  problems.push(
    `plant-URL count ${plantPaths.length} !== total plant count ${totalPlants} ` +
      `(re-run scripts/gen-sitemap.cjs)`
  );
}

// Set parity — name the exact drift so the fix is obvious.
const dataSet = new Set(dataSlugs);
const mapSet = new Set(sitemapSlugs);
const missingFromSitemap = dataSlugs.filter((s) => !mapSet.has(s)).sort();
const staleInSitemap = sitemapSlugs.filter((s) => !dataSet.has(s)).sort();
const dupInSitemap = sitemapSlugs.filter((s, i) => sitemapSlugs.indexOf(s) !== i);

if (missingFromSitemap.length) {
  problems.push(`plants missing from sitemap: ${missingFromSitemap.join(', ')}`);
}
if (staleInSitemap.length) {
  problems.push(`stale /plant URLs (no such plant): ${staleInSitemap.join(', ')}`);
}
if (dupInSitemap.length) {
  problems.push(`duplicate /plant URLs in sitemap: ${[...new Set(dupInSitemap)].join(', ')}`);
}

// /settings presence.
if (!hasSettings) {
  problems.push('/settings route is missing from the sitemap');
}

if (problems.length) {
  console.error(`\n${RED}Problems:${RESET}`);
  for (const p of problems) console.error(`  - ${p}`);
  fail(`${problems.length} issue(s). Sitemap is out of sync with the dataset/routes.`);
}

console.log(
  `\n${GREEN}OK${RESET} — ${plantPaths.length} plant URLs match ${totalPlants} dataset slugs; /settings present.`
);
process.exit(0);
