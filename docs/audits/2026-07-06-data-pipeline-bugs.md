# Data & Build Pipeline Audit

**Scope:** `scripts/`, `shared/`, `src/data/`, `package.json`, `README.md`, locale parity  
**Date:** 2026-07-06

---

## Pipeline overview

```text
_src_originals/whatsapp/     → optimize-images.cjs      → public/plants/
_src_originals/illustrations/ → optimize-illustrations.cjs → public/plants/*-ill.webp
_src_originals/mongolia/      → optimize-mongolia.cjs    → public/mongolia/
public/plants/ + mongolia/   → gen-illustration-manifest.cjs → src/data/available-illustrations.ts
src/data/* + src/i18n/       → export-native-data.cjs   → shared/ + ios/ + android/ (gitignored)
src/data/plants.ts           → gen-sitemap.cjs          → public/sitemap.xml
plant-23.webp                → gen-icons.cjs              → public/icon-*.png, og-image.jpg
```

**Problem:** Only `optimize` and `optimize:illustrations` are wired in `package.json`. Everything else is manual.

---

## Bugs

### DATA-B01 — Sitemap omits all 24 Mongolia plant URLs (P0)

| Field | Value |
|-------|-------|
| **File** | `scripts/gen-sitemap.cjs:11-15` |
| **Severity** | High |
| **Evidence** | `public/sitemap.xml` has 28 URLs (5 static + 23 Yakutia). `grep -c 'mn-' public/sitemap.xml` → **0**. Mongolia has 24 slugs in `src/data/mongolia.ts`. |
| **Also missing** | `/settings` route (`src/App.tsx:66`) |
| **Impact** | Search engines won't index Mongolia collection pages. `robots.txt` points to incomplete sitemap. |
| **Fix** | Import/read both `plants.ts` and `mongolia.ts` (or transpile `countries.ts` like export script). Add `/settings`. |

### DATA-B02 — `npm run lint` fails

| **File** | `package.json:9` |
| **Severity** | High |
| **Evidence** | `eslint` not in devDependencies; only `oxlint`. Running lint → `sh: eslint: command not found`. |
| **Fix** | `"lint": "oxlint src scripts"` or add ESLint. |

### DATA-B03 — Sharp pipeline reuse (reliability risk)

| **Files** | `scripts/optimize-images.cjs:64-83`, `scripts/optimize-illustrations.cjs:40-60` |
| **Severity** | Medium |
| **Issue** | Single `sharp(inputPath)` instance chained for thumb → medium → full. Sharp pipelines are consumed after `toFile()`. |
| **Contrast** | `optimize-mongolia.cjs:71` correctly creates fresh pipeline per size. |
| **Impact** | Current WebPs exist and look fine; re-runs after source changes may produce corrupt/identical outputs. |
| **Fix** | Fresh `sharp(inputPath)` per size in both scripts. |

### DATA-B04 — Photo maintenance scripts don't sync `plants.ts` IMAGE_MAP

| **Files** | `scripts/swap-photos.cjs:52-68`, `scripts/rotate-photos.cjs:50-67` |
| **Duplicate maps** | `scripts/optimize-images.cjs:5-29` AND `src/data/plants.ts:31-55` |
| **Severity** | Medium |
| **Impact** | After swap/rotate, provenance can drift between script and data layer. Currently in sync (0 diffs) but fragile. |
| **Fix** | Single source of truth JSON; both scripts and `plants.ts` import it. |

### DATA-B05 — `gen-icons.cjs` hard dependency on plant-23

| **File** | `scripts/gen-icons.cjs:37` |
| **Code** | `path.join(PUB, 'plants/full/plant-23.webp')` |
| **Impact** | Removing/renaming plant-23 breaks icon/OG regeneration. |

---

## Data inconsistencies

### DATA-D01 — `shared/` ↔ `src/i18n/locales/` in sync (when exported)

Byte-identical when `export-native-data.cjs` has been run.  
**Caveat:** `shared/` is gitignored (`.gitignore:32`). Fresh clones have no `shared/` until export runs.

### DATA-D02 — Cross-locale key asymmetry

| Issue | en | ru | sah | Severity |
|-------|----|----|-----|----------|
| `about.contact` | ✓ | ✓ | ✗ | Low (unused in app) |
| `plant.categories` | ✓ | ✓ | ✗ | Low (UI uses `categories.*`) |
| `home.plateCount_other` | ✓ | ✗ | N/A (single key) | **Medium** |
| Dead Sakha keys | — | — | `sah.json:62,110-119` | Low |

**Russian pluralization:** `HomePage.tsx:78,102` calls `t('home.plateCount', { count })`. Russian has `_one`, `_few`, `_many` but not `_other`. Counts 5, 9, 11 may fail.

### DATA-D03 — `illustrationId` field inconsistent with manifest

| **File** | `src/data/plants.ts` |
| **Issue** | Plants 01–17 have `illustrationId`; 18–23 omit it. Manifest lists `plant-18-ill` … `plant-23-ill` as present. |
| **Impact** | Low for web — `hasIllustration()` uses manifest. Misleading for contributors. |

### DATA-D04 — Stale Mongolia plate documentation

| **File** | `src/data/mongolia.ts:15-17` |
| **Says** | "Botanical plates: none yet" |
| **Reality** | `available-illustrations.ts` lists `mongolia-01-ill` … `mongolia-11-ill`. 11/24 Mongolia plants have plates. |

### DATA-D05 — `gen-illustration-manifest.cjs` comment incomplete

| **File** | `scripts/gen-illustration-manifest.cjs:31-32` |
| **Says** | Plates only in `public/plants/` |
| **Reality** | Also scans `public/mongolia/full/` (lines 14-25). |

### DATA-D06 — Duplicate / questionable botanical entries

| **File** | `src/data/plants.ts` | Issue |
|----------|----------------------|-------|
| 154–212 | `bellflower-clustered` + `bellflower-deep` | Both `latin: 'Campanula glomerata'` |
| 244–272 | `wildflower-meadow` | Synthetic Latin `Pratum mixtum` (not real species) |
| 603–630 | `astragalus` | `Oxytropis jacutica` — verify against photo |

Affects Wikipedia links via `getWikipediaUrl()` at `plants.ts:834-839`.

### DATA-D07 — Legal page not in locale JSON

| **File** | `src/pages/LegalPage.tsx:9-89` |
| **Impact** | `export-native-data.cjs:94-105` copies locale JSON to native; Legal strings not included. |

---

## Dead / unused code in `src/data/`

| Export | File:Line | Status |
|--------|-----------|--------|
| `SEASONS` | `plants.ts:21-25` | Never imported |
| `getOriginalImagePath()` | `plants.ts:752-754` | Never called |
| `getPlantBySlug()` | `plants.ts:804-806` | Yakutia-only; `findPlantBySlug` in `countries.ts` used instead |
| `IMAGE_MAP` in plants.ts | `plants.ts:31-55` | Duplicates script; only used by dead `getOriginalImagePath` |

---

## Scripts not in package.json

| Script | Purpose | Risk if skipped |
|--------|---------|-----------------|
| `export-native-data.cjs` | Web → shared/ios/android | Native apps stale |
| `gen-sitemap.cjs` | SEO sitemap | Missing URLs (currently 24 Mongolia) |
| `optimize-mongolia.cjs` | Mongolia photos | No Mongolia WebPs |
| `gen-icons.cjs` | PWA/OG icons | Stale branding |
| `fetch-fonts.cjs` | Self-host fonts | Broken fonts on fresh setup |
| `swap-photos.cjs` / `rotate-photos.cjs` | One-off fixes | Expected manual |

### `npm run optimize` gaps

```json
"optimize": "node scripts/optimize-images.cjs && node scripts/optimize-illustrations.cjs && node scripts/gen-illustration-manifest.cjs"
```

Missing: `optimize-mongolia.cjs`, `gen-sitemap.cjs`, `export-native-data.cjs`.

### `npm run build` gaps

Runs only `vite build`. No pre-steps for manifest, sitemap, typecheck, or native export.

---

## `export-native-data.cjs` assessment

| Aspect | Status |
|--------|--------|
| Transpile TS data via one-off `tsc` | Works but fragile (`node10` resolution, line 41-43) |
| Bakes `hasIllustration` | Good |
| Copies 324 images | Verified |
| Temp dir cleanup | Good (line 133) |
| Rollback on mid-write fail | Missing |
| Output validation | Missing |

---

## README.md outdated sections

| README says | Reality |
|-------------|---------|
| Sources in `public/images/` | `_src_originals/whatsapp/`, `_src_originals/illustrations/` |
| Only 2 optimize scripts | 11 scripts total |
| Native export documented but not in npm | Manual only |

Lines: 27-31, 63-71, 79-82, 99-103.

---

## `_src_originals` gitignored

`.gitignore:27-28` ignores `whatsapp/` and `mongolia/` originals. Fresh clone cannot re-run optimizers without restoring assets.

---

## Refactoring opportunities (pipeline)

### R-D01 — Single IMAGE_MAP source (High)

JSON file imported by `plants.ts`, `optimize-images.cjs`, `swap-photos.cjs`, `rotate-photos.cjs`.

### R-D02 — Wire npm scripts (High)

```json
"data:export": "node scripts/export-native-data.cjs",
"data:sitemap": "node scripts/gen-sitemap.cjs",
"optimize:all": "... images + illustrations + mongolia + manifest",
"optimize:mongolia": "node scripts/optimize-mongolia.cjs",
"typecheck": "tsc -b --noEmit",
"prebuild": "node scripts/gen-sitemap.cjs"
```

### R-D03 — Fix gen-sitemap to read all countries (High)

Transpile or parse both data files; include `/settings`.

### R-D04 — Locale key parity CI check (Medium)

Script: grep every `t('key')` vs all three locale JSONs + dynamic keys (`seasons.${value}`).

### R-D05 — Manifest ↔ filesystem sync check (Medium)

Assert every `*-ill.webp` on disk is in manifest and vice versa.

### R-D06 — Fix Sharp loops (Medium)

Match `optimize-mongolia.cjs` pattern.

### R-D07 — Move Legal to locale JSON (Medium)

Native parity.

### R-D08 — Parameterize gen-icons hero path (Low)

### R-D09 — Update stale comments (Low)

`mongolia.ts`, `gen-illustration-manifest.cjs`, README.

### R-D10 — Commit `shared/` or document mandatory export (Low)

Currently gitignored — native builds fail silently on fresh clone.

### R-D11 — Add checksum/retry to fetch-fonts (Low)

---

## Data health summary

| Metric | Value |
|--------|-------|
| Total plants | 47 (23 Yakutia + 24 Mongolia) |
| Yakutia illustrations | 23/23 |
| Mongolia illustrations | 11/24 |
| Field photo WebPs | All present in `public/plants/` and `public/mongolia/` |
| Slug collisions | 0 (enforced in `countries.ts:35`) |
| Sitemap coverage | 23/47 plant URLs (49%) |

---

*See also: [`2026-07-06-FULL-AUDIT-INDEX.md`](./2026-07-06-FULL-AUDIT-INDEX.md)*