# Deep Audit — Round 2: Cross-Cutting & Data Layer

**Date:** 2026-07-06  
**Scope:** Pipeline, data model, SEO/PWA, locale parity, taxonomy, git/build hygiene

---

## Data model & taxonomy

### R2-X-01 — Duplicate Latin binomials (content quality)

| Latin | Slugs | Notes |
|-------|-------|-------|
| `Campanula glomerata` | `bellflower-clustered`, `bellflower-deep` | Two Yakutia entries, same species — confusing catalog |
| `Achillea millefolium` | `yarrow`, `mn-yarrow` | Cross-collection — may be intentional (same species, different regions) |
| `Galium verum` | `bedstraw`, `mn-bedstraw` | Cross-collection — same pattern |

**Impact:** Wikipedia links identical for paired entries; encyclopedic distinction unclear.

### R2-X-02 — `imageBase` only set on Mongolia plants

| Field | Value |
|-------|-------|
| **Files** | `src/data/mongolia.ts:724`, `src/data/plants.ts:761-762` |
| **Pattern** | Yakutia plants rely on `?? '/plants'` default; Mongolia explicitly maps `imageBase: '/mongolia'` |
| **Risk** | Low today — defaults work. Any future third country must remember to set `imageBase` or deep links break. |
| **Fix** | Set `imageBase` on all plants at export time in `countries.ts` mapper (single choke point). |

### R2-X-03 — `export-native-data.cjs` hardcodes production URL

| **File** | `scripts/export-native-data.cjs:24` |
| **Value** | `IMAGE_HOST = 'https://ottormastar.aulenor.com'` |
| **Impact** | Staging/dev native builds always point at production for `full` images |
| **Fix** | `process.env.IMAGE_HOST ?? default` |

### R2-X-04 — Native bundles omit illustration `-ill` webp files

| **File** | `scripts/export-native-data.cjs:114-128` |
| **Behavior** | Copies all `.webp` in thumb/medium dirs — illustrations **are** included if present on disk |
| **Verified** | 34 illustration files exist in `public/plants/` and `public/mongolia/` thumb dirs |
| **Note** | If manifest adds plates but optimize step skipped, apps show empty plate slots offline |

---

## Locale parity (automated diff)

### Keys only in `en` (missing in `sah`/`ru`)

| Key | Used in app? |
|-----|--------------|
| `home.plateCount_one` / `_other` | ✅ `HomePage.tsx` |
| `plant.categories` | ❌ dead key |
| `about.contact` | ❌ dead key |

### Keys only in `sah` (missing in `en`/`ru`) — **dead keys**

| Key | Status |
|-----|--------|
| `catalog.sortBySeason` | Not referenced in `src/` |
| `common.disclaimerFull` | Not referenced |
| `about.features.trilingual` | Not referenced |
| `about.features.illustrations` | Not referenced |
| `about.features.medicinal` | Not referenced |
| `home.plateCount` (single form) | Used — works for Sakha |

### Russian plural gap (confirmed)

- `ru.json` has `_one`, `_few`, `_many` but not `_other` for `home.plateCount`
- i18next may fail for counts 0, 5-9, 11-14, etc.

---

## SEO / PWA / deploy

### R2-X-05 — Sitemap still 49% complete

| Metric | Value |
|--------|-------|
| Total plant slugs | 47 |
| URLs in sitemap | 28 (23 plants + 5 static) |
| Missing | 24 Mongolia + `/settings` |

### R2-X-06 — `robots.txt` points at incomplete sitemap

| **File** | `public/robots.txt` |
| **Line** | `Sitemap: https://ottormastar.aulenor.com/sitemap.xml` |

### R2-X-07 — PWA install metadata Yakutia-locked

| **File** | `public/manifest.webmanifest` |
| **Fields** | `name`, `description` reference Yakutia only |
| **Impact** | Mongolia collection invisible in install prompt semantics |

### R2-X-08 — `index.html` static OG tags never updated for Mongolia

| **File** | `index.html:15-26` |
| **Dynamic** | `App.tsx` updates title/description/og:title/og:description/og:locale |
| **Static forever** | `og:url`, `og:image`, `twitter:*` — always Yakutia hero |

### R2-X-09 — `fonts.css` is 607 lines / 31 woff2 files

| **Path** | `public/fonts/` |
| **Impact** | Large static payload; self-hosted (good for privacy) but no subsetting evident |
| **Refactor** | Subset to Cyrillic + Latin actually used; lazy-load PT Serif |

---

## Build / git / CI gaps

### R2-X-10 — Strict TypeScript enabled but not enforced in build

| **File** | `tsconfig.app.json:21` — `"strict": true`, `noUnusedLocals`, `noUnusedParameters` |
| **Build** | `vite build` skips `tsc` — unused locals and type errors ship |
| **Known failures** | `ImageViewer.tsx:146`, `main.tsx:3` |

### R2-X-11 — Gitignored artifacts create fresh-clone trap

| Ignored path | Risk |
|--------------|------|
| `shared/` | No locale/plants JSON until export script |
| `ios/OttorMastar/Resources/` | iOS build missing data/images |
| `android/app/src/main/assets/` | Android build missing data/images |
| `_src_originals/whatsapp/`, `mongolia/` | Cannot re-run image optimizers |

### R2-X-12 — No CI scripts at all

| Missing check | Purpose |
|---------------|---------|
| `tsc -b` | Type safety |
| Locale key parity | Prevent Sakha raw-key regressions |
| Slug uniqueness | Cross-country |
| Manifest ↔ filesystem | Illustration drift |
| Sitemap count = plant count | SEO |
| `md5` illustration set | Duplicate plate detection (BUG_JOURNAL pattern) |
| Photo species audit | Content quality gate |

### R2-X-13 — `package.json` `lint` references missing eslint

| **Works** | `npx oxlint src` → 0 issues |
| **Broken** | `npm run lint` |

---

## Security & privacy (Round 2)

### R2-X-14 — Legal copy claims "no external network requests" (all platforms)

| Platform | File |
|----------|------|
| Web | `LegalPage.tsx:65` |
| Android | `LegalScreen.kt` |
| iOS | `LegalView.swift` |

**Reality:** Wikipedia links (user-initiated); native apps fetch remote `full` images; web loads static assets from same origin only by default.

### R2-X-15 — `i18n escapeValue: false` + future user content

| **File** | `src/i18n/index.ts:31-33` |
| **Risk** | Low today (static JSON); any CMS integration needs escaping |

---

## Refactoring: unified architecture (Round 2)

```text
                    ┌─────────────────────┐
                    │  src/data/countries │
                    │  (single registry)  │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
   plants.ts            mongolia.ts          image-map.json (proposed)
         │                     │                     │
         └──────────┬──────────┴─────────────────────┘
                    ▼
         export-native-data.cjs ──► shared/ + ios/ + android/
                    │
         gen-sitemap.cjs (should read countries, not plants.ts only)
                    │
         gen-illustration-manifest.cjs
```

### Proposed npm `check` script bundle

```json
"check": "tsc -b --noEmit && oxlint src && node scripts/check-locale-keys.cjs && node scripts/check-sitemap.cjs"
```

---

## Round 2 summary counts

| Category | New findings |
|----------|--------------|
| Web (Round 2) | 12 new + 6 refactor |
| Native (Round 2) | 2 high, 11 medium, 7 low |
| Cross-cutting | 15 items |
| **Total new (Round 2)** | **~53** |

Combined with Round 1: **~140** documented issues/refactors across the repo.

---

*Parent index: [`2026-07-06-FULL-AUDIT-INDEX.md`](./2026-07-06-FULL-AUDIT-INDEX.md)*