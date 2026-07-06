# Ottor Mastar — Full Audit Index (2026-07-06)

**Project:** `/Users/svetlana/Documents/projects/ottor_mastar`  
**Scope:** Web (React/Vite), data pipeline (scripts/shared), native apps (iOS SwiftUI + Android Compose), content quality  
**Mode:** Read-only audit — **no code was changed**  
**Purpose:** Handoff package for Claude Opus 4.8 (or any follow-up agent) to implement fixes

---

## Executive summary

| Area | Critical | High | Medium | Low | Refactor items |
|------|----------|------|--------|-----|----------------|
| Web Round 1 | 2 | 7 | 21 | 18 | 12 |
| Web Round 2 | 0 | 3 | 9 | 3 | 6 |
| Data & pipeline | 0 | 2 | 8 | 6 | 11 |
| Native Round 1 | 0 | 4 | 10 | 6 | 6 |
| Native Round 2 | 0 | 2 | 11 | 7 | — |
| Cross-cutting R2 | 0 | 0 | 8 | 7 | 5 |
| Content quality | 0 | 1 | 2 | 3 | 2 |
| **Grand total** | **2** | **19** | **69** | **50** | **42** |

### Top 15 priorities (cross-cutting, R1+R2 merged)

| P | Issue | Primary location | Round |
|---|-------|------------------|-------|
| P0 | Invalid `country` in localStorage can crash web app | `src/context/SettingsContext.tsx:44-55` | R1 |
| P0 | Image viewer stuck open when plant list shrinks (country switch) | `src/components/Gallery/GalleryGrid.tsx:19,52-64` | R1 |
| P0 | Sitemap missing all 24 Mongolia plant URLs + `/settings` | `scripts/gen-sitemap.cjs:11-15` | R1 |
| P0 | **Android viewer uses wrong country for images** | `MainActivity.kt:228-231` | **R2 SP2-H01** |
| P1 | `npm run lint` broken (eslint not installed) | `package.json:9` | R1 |
| P1 | `tsc -b` fails; build ships type errors | `src/components/common/ImageViewer.tsx:146` | R1 |
| P1 | **iOS grid fetches thumb/medium over network** (offline broken) | `PlantImage.swift:78-86` | **R2 SP2-H02** |
| P1 | **leadImage change leaves detail carousel wrong** (all platforms) | `PlantDetailPage.tsx`, `DetailScreen.kt` | **R2** |
| P1 | iOS Home viewer "Details" button is a no-op | `ios/.../HomeView.swift:39-43` | R1 |
| P1 | Footer/About still show Yakutia copy when Mongolia selected | Web + native About/Footer | R1 |
| P1 | 4 Yakutia field photos still wrong species (orphans) | photo-species-audit §7 | R1 |
| P1 | Build pipeline fragmented — critical scripts not in npm | `package.json`, `README.md` | R1 |
| P2 | **OS prefers-reduced-motion not applied to CSS** | `src/index.css` | **R2** |
| P2 | **Viewer zoom state stale after page change** | Web + iOS + Android viewers | **R2** |
| P2 | Catalog search narrower than Search page | `CatalogPage.tsx` vs `SearchPage.tsx` | **R2** |

### Verified working

- `npm run build` (Vite) succeeds — dist ~489 KB main chunk
- `export-native-data.cjs` runs: 47 plants, locales synced
- Cross-country slug uniqueness enforced in `countries.ts`
- `hasIllustration()` manifest-driven design is sound
- Many 2026-07-06 bugs already fixed (see `docs/BUG_JOURNAL.md`)

### Tooling verification (ran 2026-07-06)

```text
npm run lint     → FAIL (eslint: command not found)
npx tsc -b       → FAIL (ImageViewer onTransformed; main.tsx CSS import)
npm run build    → PASS (vite build, no typecheck)
```

---

## Report files (read these in order)

### Round 1 (initial audit)

| # | File | Contents |
|---|------|----------|
| 1 | [`2026-07-06-FULL-AUDIT-INDEX.md`](./2026-07-06-FULL-AUDIT-INDEX.md) | This file — master index & handoff |
| 2 | [`2026-07-06-web-bugs-and-refactoring.md`](./2026-07-06-web-bugs-and-refactoring.md) | 48 web frontend findings |
| 3 | [`2026-07-06-data-pipeline-bugs.md`](./2026-07-06-data-pipeline-bugs.md) | Scripts, shared data, build pipeline, i18n parity |
| 4 | [`2026-07-06-native-apps-bugs.md`](./2026-07-06-native-apps-bugs.md) | iOS + Android bugs & parity gaps |
| 5 | [`2026-07-06-content-quality.md`](./2026-07-06-content-quality.md) | Photo↔species, taxonomy, legal copy accuracy |
| 6 | [`2026-07-06-refactoring-roadmap.md`](./2026-07-06-refactoring-roadmap.md) | Prioritized implementation plan for Opus |
| 7 | [`2026-07-06-photo-species-audit.md`](./2026-07-06-photo-species-audit.md) | Pre-existing botanical photo audit (reference) |

### Round 2 (deep second pass — 2026-07-06)

| # | File | Contents |
|---|------|----------|
| 8 | [`2026-07-06-deep-audit-round2-web.md`](./2026-07-06-deep-audit-round2-web.md) | **12 new** web findings + automated checks |
| 9 | [`2026-07-06-deep-audit-round2-native.md`](./2026-07-06-deep-audit-round2-native.md) | **20 new** native findings (SP2-*) |
| 10 | [`2026-07-06-deep-audit-round2-crosscutting.md`](./2026-07-06-deep-audit-round2-crosscutting.md) | Data layer, SEO/PWA, locale, CI, taxonomy |

---

## Handoff prompt for Claude Opus 4.8

Copy-paste this block to continue work:

```text
Project: /Users/svetlana/Documents/projects/ottor_mastar

Read the audit package (no code changes until I say so, unless I ask you to fix):
1. docs/audits/2026-07-06-FULL-AUDIT-INDEX.md
2. docs/audits/2026-07-06-refactoring-roadmap.md
3. Round 1 area report + Round 2 deep report for your task:
   - Web: 2026-07-06-web-bugs-and-refactoring.md + 2026-07-06-deep-audit-round2-web.md
   - Native: 2026-07-06-native-apps-bugs.md + 2026-07-06-deep-audit-round2-native.md
   - Pipeline: 2026-07-06-data-pipeline-bugs.md + 2026-07-06-deep-audit-round2-crosscutting.md

Also read docs/BUG_JOURNAL.md for already-fixed patterns — do not re-introduce them.

Start with Phase 1 (P0) from the roadmap unless I specify otherwise.
After each fix: run npx tsc -b, npm run build, and relevant native build if touched.
Log new bugs in docs/BUG_JOURNAL.md per the journal format.
```

---

## Key source files by concern

### Web — critical path

| Concern | Files |
|---------|-------|
| Settings / crash risk | `src/context/SettingsContext.tsx`, `src/data/countries.ts` |
| Gallery viewer lifecycle | `src/components/Gallery/GalleryGrid.tsx`, `src/components/common/ImageViewer.tsx` |
| Plant detail routing | `src/pages/PlantDetailPage.tsx`, `src/App.tsx` |
| i18n / blank text | `src/i18n/index.ts`, `src/i18n/locales/{en,ru,sah}.json` |
| Country-aware copy | `src/pages/HomePage.tsx`, `src/pages/AboutPage.tsx`, `src/components/Layout/Footer.tsx` |

### Data & pipeline

| Concern | Files |
|---------|-------|
| Plant data | `src/data/plants.ts`, `src/data/mongolia.ts`, `src/data/available-illustrations.ts` |
| Image optimization | `scripts/optimize-images.cjs`, `scripts/optimize-mongolia.cjs`, `scripts/optimize-illustrations.cjs` |
| Native export | `scripts/export-native-data.cjs`, `shared/` (gitignored) |
| SEO | `scripts/gen-sitemap.cjs`, `public/sitemap.xml`, `public/robots.txt` |
| Photo maintenance | `scripts/swap-photos.cjs`, `scripts/rotate-photos.cjs` |

### Native apps

| Concern | Android | iOS |
|---------|---------|-----|
| Navigation | `android/.../MainActivity.kt` | `ios/OttorMastar/Sources/OttorMastarApp.swift` |
| Home / viewer | `android/.../HomeScreen.kt`, `ViewerScreen.kt` | `ios/.../HomeView.swift`, `ImageViewer.swift` |
| Detail | `android/.../DetailScreen.kt` | `ios/.../PlantDetailView.swift` |
| Settings | `android/.../SettingsScreen.kt`, `data/Settings.kt` | `ios/.../SettingsView.swift`, `AppSettings.swift` |
| i18n | `android/.../data/L10n.kt` | `ios/.../L10n.swift` |
| Xcode project | — | `ios/project.yml` |

### Existing project docs

| File | Role |
|------|------|
| `docs/BUG_JOURNAL.md` | Chronological fix log + scan patterns |
| `README.md` | Setup (partially outdated — see data-pipeline report) |

---

## Audit methodology

### Round 1
1. Read all 24 `src/**/*.ts(x)` files + config (`package.json`, `vite.config.ts`, `tsconfig*`)
2. Read all 11 `scripts/*.cjs` files + `shared/` + `src/data/`
3. Read 28 native `.kt`/`.swift` source files
4. Cross-referenced `docs/BUG_JOURNAL.md` and photo-species audit
5. Ran `npm run lint`, `npx tsc -b`, verified sitemap slug counts

### Round 2 (deep pass)
6. Line-by-line re-read of every `src/` file, `index.css`, `index.html`
7. Full re-read of all native sources; second-pass subagent audit
8. Automated checks: locale key diff, WebP filesystem parity, slug/id collision, Latin duplicates, illustration manifest (34/34), `oxlint`
9. Cross-platform parity matrix (viewer country, offline policy, search normalization, zoom lifecycle)
10. **No modifications to application source code** — reports only

---

*Generated: 2026-07-06 — Grok audit agent (Rounds 1–2)*