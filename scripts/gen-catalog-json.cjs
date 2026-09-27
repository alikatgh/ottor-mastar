#!/usr/bin/env node
/**
 * gen-catalog-json.cjs — emit public/catalog.json from the typed src/data.
 *
 * This is the hosted, over-the-air catalog the native apps fetch at runtime
 * (see PlantStore.refresh on iOS/Android). It is byte-identical to the bundled
 * plants.json (same shape, same `version`) — the shared builder in
 * scripts/lib/build-catalog.cjs guarantees they never drift.
 *
 * Runs in `prebuild` so every web deploy publishes a catalog.json that matches
 * the site exactly. Unlike export-native-data.cjs it copies NO images, so it is
 * fast and safe to run on every build.
 */
const fs = require('node:fs');
const path = require('node:path');
const { buildCatalog } = require('./lib/build-catalog.cjs');

const ROOT = path.resolve(__dirname, '..');
const dest = path.join(ROOT, 'public', 'catalog.json');

const data = buildCatalog();
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(data, null, 2));

const total = data.countries.reduce((n, c) => n + c.plants.length, 0);
console.log(`wrote public/catalog.json — schema v${data.version}, ${total} plants across ${data.countries.length} countries`);
