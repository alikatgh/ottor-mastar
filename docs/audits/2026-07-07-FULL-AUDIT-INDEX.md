# Ottor Mastar — 100% Audit Report (2026-07-07)

**Project:** `/Users/svetlana/Documents/projects/ottor_mastar`  
**Scope:** Web (React 19 / Vite 8 / TS 6), data pipeline (scripts), native apps (iOS SwiftUI + Android Compose), content/assets, docs  
**Mode:** Read-only audit — no code changed  
**Purpose:** Fresh handoff package for Claude (or any follow-up agent)

---

## Executive Summary

| Area | Critical | High | Medium | Low | Refactor |
|------|----------|------|--------|-----|----------|
| Web frontend | 0 | 3 | 9 | 6 | 10 |
| Data & pipeline | 0 | 0 | 9 | 4 | 6 |
| Native (iOS + Android) | 1 | 3 | 5 | 4 | 4 |
| Cross-cutting | 0 | 1 | 4 | 3 | 3 |
| Content / assets | 0 | 0 | 2 | 3 | 2 |
| Tooling / CI | 0 | 0 | 2 | 1 | 3 |
| **Grand total** | **1** | **7** | **31** | **21** | **28** |

### Top 10 priorities (current state)

| P | Issue | Primary location |
|---|-------|------------------|
| P0 | **iOS bundle missing `locale-mn.json` / `locale-zh.json`** — Mongolia shows raw i18n keys | `ios/project.yml:30-35` |
| P1 | Hero cover ignores `heroSlug`; uses `plants[last]` — Mongolia shows `mn-cosmos` not `mn-marigold` | `src/pages/HomePage.tsx:24`, `ios/.../HomeView.swift`, `android/.../HomeScreen.kt` |
| P1 | Search omits Mongolian/Chinese names on all platforms | `src/utils/plantSearch.ts:45`, native search views |
| P1 | Legal page blank for `mn`/`zh` (hardcoded sah/ru/en only) | `src/pages/LegalPage.tsx:6-88` |
| P1 | Settings language picker shows all 5 langs; Header switcher correctly filters to 3 | `src/pages/SettingsPage.tsx:159-161` |
| P2 | iOS has no plant-not-found screen (Android + web do) | `ios/OttorMastar/Sources/` (gap) |
| P2 | iOS About stats hardcoded Yakutia trilingual copy | `ios/OttorMastar/Sources/AboutView.swift:13-28` |
| P2 | CI validation scripts exist but not wired to npm/CI | `scripts/check-*.cjs`, no `.github/` |
| P2 | Main JS bundle 514 KB (gzip 164 KB) — plant data eagerly bundled | `dist/assets/index-*.js`, `src/data/countries.ts` |
| P2 | 4 Yakutia field photos still wrong species (orphans) | `docs/audits/2026-07-06-photo-species-audit.md` §7 |

### Verified working (tooling run 2026-07-07)

```text
npm run lint        → PASS (1 warning: unused fs in scripts/gen-icons.cjs)
npm run typecheck   → PASS
npm run build       → PASS (tsc -b && vite build; main chunk 514 KB)
check-locale-keys   → PASS (13 dead-key warnings, 0 missing)
check-sitemap       → PASS (47 plant URLs, /settings present)
export-native-data  → PASS (47 plants, 288 images copied)
```

### Dataset snapshot

| Country | Plants | Illustrated | Languages |
|---------|-------:|------------:|-----------|
| Yakutia | 23 | 23 | sah, ru, en |
| Mongolia | 24 | 2 | mn, zh, en |
| **Total** | **47** | **25** | 5 UI locales |

---

## Report files (this audit package)

| # | File | Contents |
|---|------|----------|
| 1 | `2026-07-07-FULL-AUDIT-INDEX.md` | This file — master index |
| 2 | `2026-07-07-web-audit.md` | Web frontend findings + src file list |
| 3 | `2026-07-07-data-pipeline-audit.md` | Scripts, data layer, assets, pipeline |
| 4 | `2026-07-07-native-apps-audit.md` | iOS + Android findings + file lists |
| 5 | `2026-07-07-crosscutting-audit.md` | Parity matrix, CI, content, SEO |

### Prior audit package (reference only — many items fixed)

| File | Notes |
|------|-------|
| `docs/audits/2026-07-06-FULL-AUDIT-INDEX.md` | Round 1+2 index |
| `docs/audits/2026-07-06-round2-implementation-report.md` | Fix fleet status |
| `docs/BUG_JOURNAL.md` | Chronological fix log — read before re-fixing |

---

## Handoff prompt for Claude

```text
Project: /Users/svetlana/Documents/projects/ottor_mastar

Read the 2026-07-07 audit package (read-only until I ask for fixes):
1. docs/audits/2026-07-07-FULL-AUDIT-INDEX.md
2. docs/audits/2026-07-07-web-audit.md
3. docs/audits/2026-07-07-data-pipeline-audit.md
4. docs/audits/2026-07-07-native-apps-audit.md
5. docs/audits/2026-07-07-crosscutting-audit.md

Also read docs/BUG_JOURNAL.md — do not re-introduce already-fixed patterns.

Start with P0 (iOS locale bundle gap), then P1 items.
After each fix: npm run check (add if missing), npm run build, native build if touched.
```

---

## Complete project file inventory

### Top-level (source-controlled, excl. build artifacts)

| Path | Files | Role |
|------|------:|------|
| `src/` | 37 | Web app source |
| `scripts/` | 12 | Build/data pipeline |
| `ios/OttorMastar/Sources/` | 14 | iOS SwiftUI |
| `ios/project.yml` | 1 | XcodeGen manifest |
| `android/app/src/main/java/` | 14 | Android Compose |
| `android/` (gradle) | 6 | Build config |
| `public/` | 258 | Static assets (WebP, fonts, sitemap) |
| `docs/` | 13 | Audits + bug journal |
| `_src_originals/` | 118 | Raw photos/plates (partially gitignored) |
| Root config | 8 | package.json, vite, tsconfig, index.html, README |

### Gitignored / generated (not in repo after fresh clone)

| Path | Regenerate with |
|------|-----------------|
| `shared/` | `npm run data:export` |
| `ios/OttorMastar/Resources/` | `npm run data:export` |
| `android/app/src/main/assets/` | `npm run data:export` |
| `ios/OttorMastar.xcodeproj/` | `cd ios && xcodegen` |
| `dist/` | `npm run build` |
| `node_modules/` | `npm install` |

---

## Key source files by concern

### Web

| Concern | Files |
|---------|-------|
| Routing / shell | `src/App.tsx`, `src/main.tsx` |
| Settings / crash guard | `src/context/SettingsContext.tsx` |
| Country registry | `src/data/countries.ts` |
| Plant data | `src/data/plants.ts`, `src/data/mongolia.ts`, `src/data/mongolia-translations.ts` |
| Gallery / viewer | `src/components/Gallery/GalleryGrid.tsx`, `src/components/common/ImageViewer.tsx` |
| Plant detail | `src/pages/PlantDetailPage.tsx` |
| Search | `src/utils/plantSearch.ts`, `src/pages/SearchPage.tsx`, `src/pages/CatalogPage.tsx` |
| i18n | `src/i18n/index.ts`, `src/i18n/locales/{en,ru,sah,mn,zh}.json` |
| Design tokens | `src/index.css` |

### Pipeline

| Concern | Files |
|---------|-------|
| Image optimize | `scripts/optimize-images.cjs`, `scripts/optimize-illustrations.cjs`, `scripts/optimize-mongolia.cjs` |
| Manifest | `scripts/gen-illustration-manifest.cjs` → `src/data/available-illustrations.ts` |
| SEO | `scripts/gen-sitemap.cjs`, `scripts/check-sitemap.cjs` |
| Locale parity | `scripts/check-locale-keys.cjs` |
| Native export | `scripts/export-native-data.cjs` |

### Native

| Concern | iOS | Android |
|---------|-----|---------|
| Entry / nav | `OttorMastarApp.swift` | `MainActivity.kt` |
| Home / hero | `HomeView.swift` | `HomeScreen.kt` |
| Detail | `PlantDetailView.swift` | `DetailScreen.kt` |
| Viewer | `ImageViewer.swift` | `ViewerScreen.kt` |
| Settings | `AppSettings.swift`, `SettingsView.swift` | `data/Settings.kt`, `SettingsScreen.kt` |
| i18n | `L10n.swift` | `data/L10n.kt` |
| Images | `PlantImage.swift` | assets + Coil/compose |
| Xcode project | `ios/project.yml` | — |

---

## Audit methodology

1. Full file inventory (`find` excluding `.git`, `node_modules`, `dist`, `.gradle`, `build`)
2. Read all 37 `src/` files, 12 scripts, 14 Swift, 14 Kotlin, 5 data modules
3. Ran `npm run lint`, `npm run typecheck`, `npm run build`
4. Ran `check-locale-keys.cjs`, `check-sitemap.cjs`, `export-native-data.cjs`
5. Cross-referenced `docs/BUG_JOURNAL.md` and 2026-07-06 audit package
6. Verified July 6 P0 fixes are in place (settings validation, viewer reset, sitemap, tsc gate)
7. **No application source modified**

---

*Generated: 2026-07-07 — Grok full audit agent*