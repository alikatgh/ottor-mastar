# Data & Pipeline Audit — 2026-07-07

**Scope:** `scripts/`, `src/data/`, `public/`, `_src_originals/`, `shared/` (generated)

---

## Scripts file list (12 files, 1,198 lines)

| File | Lines | Purpose |
|------|------:|---------|
| `check-locale-keys.cjs` | 307 | Locale key parity vs src usage |
| `check-sitemap.cjs` | 152 | Sitemap vs dataset slug parity |
| `export-native-data.cjs` | 148 | Export JSON + images to iOS/Android/shared |
| `optimize-images.cjs` | 97 | Yakutia photos → WebP |
| `optimize-illustrations.cjs` | 75 | Botanical plates → WebP |
| `optimize-mongolia.cjs` | 78 | Mongolia photos → WebP |
| `gen-sitemap.cjs` | 66 | Generate `public/sitemap.xml` |
| `gen-icons.cjs` | 64 | PWA/social icons |
| `fetch-fonts.cjs` | 65 | Self-host fonts |
| `swap-photos.cjs` | 71 | Photo↔species reconciliation |
| `rotate-photos.cjs` | 69 | Photo rotation helper |
| `gen-illustration-manifest.cjs` | 36 | Regenerate `available-illustrations.ts` |

---

## Data layer file list (5 files, 2,132 lines)

| File | Lines | Role |
|------|------:|------|
| `plants.ts` | 836 | 23 Yakutia plants + image helpers |
| `mongolia.ts` | 749 | 24 Mongolia plants |
| `mongolia-translations.ts` | 380 | mn/zh overlay (24/24 plants) |
| `countries.ts` | 143 | Registry, slug guard, getHeroPlant() |
| `available-illustrations.ts` | 30 | 25 illustration slugs (auto-gen) |

---

## Public assets inventory

| Path | Count | Notes |
|------|------:|-------|
| `public/plants/thumb/*.webp` | 46 | 23 photos + 23 plates |
| `public/plants/medium/*.webp` | 46 | |
| `public/plants/full/*.webp` | 46 | Remote zoom only |
| `public/mongolia/thumb/*.webp` | 26 | 24 photos + 2 plates |
| `public/mongolia/medium/*.webp` | 26 | |
| `public/mongolia/full/*.webp` | 26 | |
| `public/fonts/` | 4+ | Self-hosted (Inter, Lora, etc.) |
| `public/sitemap.xml` | 1 | 53 URLs (auto-gen) |
| `public/_redirects` | 1 | Cloudflare SPA fallback |
| `public/robots.txt` | 1 | |
| `public/manifest.webmanifest` | 1 | PWA |
| `public/favicon.svg`, icons | 3+ | |

---

## `_src_originals/` (118 files tracked)

| Path | Count | Gitignored |
|------|------:|------------|
| `_src_originals/illustrations/plant-NN-ill.png` | 23 | No |
| `_src_originals/illustrations/mongolia-NN-ill.png` | 11 | No |
| `_src_originals/mongolia/*.jpg` | 84 | Yes (`_src_originals/mongolia/`) |

---

## Findings

### Critical — 0

### High — 0

### Medium — 9

| ID | Issue | Location |
|----|-------|----------|
| DATA-M01 | `heroSlug` in registry but not exported to native JSON | `export-native-data.cjs:61-78`, `countries.ts:51,59` |
| DATA-M02 | `check-locale-keys` / `check-sitemap` not in npm scripts or CI | `package.json` |
| DATA-M03 | `data:export` not in build chain — native bundles drift after data edits | `package.json:8-18` |
| DATA-M04 | Duplicate IMAGE_MAP in `optimize-images.cjs` and `plants.ts` — fragile sync | `optimize-images.cjs:5-29`, `plants.ts:29-55` |
| DATA-M05 | `gen-icons.cjs` OG subtitle hardcodes "Plants of Yakutia" | `gen-icons.cjs:55` |
| DATA-M06 | `check-locale-keys.cjs` error text says "THREE locales" but checks 5 | `check-locale-keys.cjs:262-269` |
| DATA-M07 | `optimize-mongolia.cjs` no top-level `.catch()` on `run()` | `optimize-mongolia.cjs:78` |
| DATA-M08 | No image filesystem parity script (imageId → thumb/medium exists?) | Missing |
| DATA-M09 | `export-native-data.cjs` has no post-export validation | `export-native-data.cjs` |

### Low — 4

| ID | Issue | Location |
|----|-------|----------|
| DATA-L01 | `illustrationId` field in plants.ts misleading — runtime uses manifest | `plants.ts:65+` |
| DATA-L02 | Duplicate Latin: `bellflower-clustered` + `bellflower-deep` both `Campanula glomerata` | `plants.ts` |
| DATA-L03 | Synthetic Latin `Pratum mixtum` for `wildflower-meadow` | `plants.ts` |
| DATA-L04 | `gen-illustration-manifest.cjs` comment says `public/plants/` only; also scans mongolia | `gen-illustration-manifest.cjs:31-32` |

### Content / assets — Medium

| ID | Issue | Location |
|----|-------|----------|
| CONTENT-M01 | 4 Yakutia field photos still wrong species (orphans, need re-shoot) | `photo-species-audit.md` §7 |
| CONTENT-M02 | Mongolia 22/24 plants photo-only (by design after plate audit) | `illustration-species-audit.md` |

---

## Pipeline health

### Working

- `gen-sitemap.cjs` transpiles `countries.ts` — all 47 plant URLs + static routes
- `check-sitemap.cjs` passes (47/47)
- `check-locale-keys.cjs` passes (0 missing, 13 dead-key warnings)
- `export-native-data.cjs` cleans dest before copy; exports 5 locales; 288 images
- `hasIllustration()` manifest-driven — 25 plates
- Cross-country slug uniqueness via `assertUniqueSlugs()` (dev-only in `main.tsx`)
- Mongolia mn/zh merged at module load (`mongolia.ts:739-749`)
- Sharp fresh instance per size (DATA-B03 fixed)
- Illustration audit complete: Yakutia 23/23 correct; Mongolia 2 species-matched plates remain

### npm scripts (current)

```json
"dev", "prebuild", "build", "lint", "typecheck", "preview",
"optimize", "optimize:illustrations", "optimize:mongolia", "optimize:all",
"data:sitemap", "data:export"
```

### Recommended additions

```json
"check:locale": "node scripts/check-locale-keys.cjs",
"check:sitemap": "node scripts/check-sitemap.cjs",
"check": "npm run check:locale && npm run check:sitemap && npm run typecheck && npm run lint"
```

---

## Illustration manifest (current)

```
mongolia-07-ill, mongolia-10-ill,
plant-01-ill … plant-23-ill (23 Yakutia plates)
```

Total: 25 illustrated plants across 47.