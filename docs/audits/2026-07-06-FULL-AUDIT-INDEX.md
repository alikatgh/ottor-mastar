# Ottor Mastar — Full Audit Index (2026-07-06)

**Project:** `/Users/svetlana/Documents/projects/ottor_mastar`  
**Scope:** Web (React/Vite), data pipeline (scripts/shared), native apps (iOS SwiftUI + Android Compose), content quality  
**Mode:** Read-only audit — **no code was changed**  
**Purpose:** Handoff package for Claude Opus 4.8 (or any follow-up agent) to implement fixes

---

## Executive summary

| Area | Critical | High | Medium | Low | Refactor items |
|------|----------|------|--------|-----|----------------|
| Web (`src/`) | 2 | 7 | 21 | 18 | 12 |
| Data & pipeline | 0 | 2 | 8 | 6 | 11 |
| Native (iOS + Android) | 0 | 4 | 10 | 6 | 6 |
| Content quality | 0 | 1 | 2 | 3 | 2 |
| **Totals** | **2** | **14** | **41** | **33** | **31** |

### Top 10 priorities (cross-cutting)

| P | Issue | Primary location |
|---|-------|------------------|
| P0 | Invalid `country` in localStorage can crash web app | `src/context/SettingsContext.tsx:44-55` |
| P0 | Image viewer stuck open when plant list shrinks (country switch) | `src/components/Gallery/GalleryGrid.tsx:19,52-64` |
| P0 | Sitemap missing all 24 Mongolia plant URLs + `/settings` | `scripts/gen-sitemap.cjs:11-15` |
| P1 | `npm run lint` broken (eslint not installed) | `package.json:9` |
| P1 | `tsc -b` fails; build ships type errors | `src/components/common/ImageViewer.tsx:146` |
| P1 | Plant detail state not reset on slug change | `src/pages/PlantDetailPage.tsx:24-26` |
| P1 | iOS Home viewer "Details" button is a no-op | `ios/OttorMastar/Sources/HomeView.swift:39-43` |
| P1 | Footer/About still show Yakutia copy when Mongolia selected (all platforms) | Web + native About/Footer |
| P1 | 4 Yakutia field photos still wrong species (orphans) | `docs/audits/2026-07-06-photo-species-audit.md` §7 |
| P1 | Build pipeline fragmented — critical scripts not in npm | `package.json`, `README.md` |

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

| # | File | Contents |
|---|------|----------|
| 1 | [`2026-07-06-FULL-AUDIT-INDEX.md`](./2026-07-06-FULL-AUDIT-INDEX.md) | This file — master index & handoff |
| 2 | [`2026-07-06-web-bugs-and-refactoring.md`](./2026-07-06-web-bugs-and-refactoring.md) | All 48 web frontend findings |
| 3 | [`2026-07-06-data-pipeline-bugs.md`](./2026-07-06-data-pipeline-bugs.md) | Scripts, shared data, build pipeline, i18n parity |
| 4 | [`2026-07-06-native-apps-bugs.md`](./2026-07-06-native-apps-bugs.md) | iOS + Android bugs & parity gaps |
| 5 | [`2026-07-06-content-quality.md`](./2026-07-06-content-quality.md) | Photo↔species, taxonomy, legal copy accuracy |
| 6 | [`2026-07-06-refactoring-roadmap.md`](./2026-07-06-refactoring-roadmap.md) | Prioritized implementation plan for Opus |
| 7 | [`2026-07-06-photo-species-audit.md`](./2026-07-06-photo-species-audit.md) | Pre-existing botanical photo audit (reference) |

---

## Handoff prompt for Claude Opus 4.8

Copy-paste this block to continue work:

```text
Project: /Users/svetlana/Documents/projects/ottor_mastar

Read the audit package (no code changes until I say so, unless I ask you to fix):
1. docs/audits/2026-07-06-FULL-AUDIT-INDEX.md
2. docs/audits/2026-07-06-refactoring-roadmap.md
3. Then the area-specific report for your task.

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

1. Read all 24 `src/**/*.ts(x)` files + config (`package.json`, `vite.config.ts`, `tsconfig*`)
2. Read all 11 `scripts/*.cjs` files + `shared/` + `src/data/`
3. Read 28 native `.kt`/`.swift` source files
4. Cross-referenced `docs/BUG_JOURNAL.md` and `docs/audits/2026-07-06-photo-species-audit.md`
5. Ran `npm run lint`, `npx tsc -b`, verified sitemap slug counts
6. No modifications to application source code

---

*Generated: 2026-07-06 — Grok audit agent*