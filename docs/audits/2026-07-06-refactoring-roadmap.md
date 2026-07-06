# Refactoring Roadmap — Implementation Plan for Opus 4.8

**Project:** `/Users/svetlana/Documents/projects/ottor_mastar`  
**Date:** 2026-07-06  
**Prerequisite:** Read [`2026-07-06-FULL-AUDIT-INDEX.md`](./2026-07-06-FULL-AUDIT-INDEX.md) and area-specific reports  
**Rule:** Log every fix in `docs/BUG_JOURNAL.md` (5 lines max per entry)

---

## Phase 1 — P0 crashes & data integrity (Est. 1 PR)

| # | Task | Files | IDs |
|---|------|-------|-----|
| 1.1 | Validate `country` + all settings fields on localStorage load | `src/context/SettingsContext.tsx` | WEB-C01, WEB-M12 |
| 1.2 | Reset/clamp gallery `selectedIndex` when `plants` changes | `src/components/Gallery/GalleryGrid.tsx` | WEB-C02 |
| 1.3 | Reset plant detail state on slug change | `src/pages/PlantDetailPage.tsx` or `src/App.tsx` | WEB-H01 |
| 1.4 | Fix `onTransform` in ImageViewer | `src/components/common/ImageViewer.tsx:146` | WEB-H02 |
| 1.5 | Add `typecheck` script + CSS module declaration | `package.json`, `src/vite-env.d.ts` or similar | WEB-L02, WEB-L19 |
| 1.6 | Fix lint script (oxlint) | `package.json:9` | DATA-B02 |

**Verify:** `npx tsc -b && npm run lint && npm run build`

---

## Phase 2 — SEO & pipeline (Est. 1 PR)

| # | Task | Files | IDs |
|---|------|-------|-----|
| 2.1 | Fix sitemap to include Mongolia + `/settings` | `scripts/gen-sitemap.cjs` | DATA-B01 |
| 2.2 | Wire npm scripts for pipeline | `package.json` | R-D02 |
| 2.3 | Single IMAGE_MAP source | New `src/data/image-map.json` or `.ts`, update scripts | R-D01, DATA-B04 |
| 2.4 | Fix Sharp pipeline reuse | `optimize-images.cjs`, `optimize-illustrations.cjs` | DATA-B03 |
| 2.5 | Update README to match actual paths | `README.md` | DATA README section |

**Verify:** `npm run data:sitemap` → 52 plant URLs + 6 static; `npm run optimize:all`

---

## Phase 3 — Country-aware copy (all platforms, Est. 1-2 PRs)

| # | Task | Files | IDs |
|---|------|-------|-----|
| 3.1 | Add `app.subtitle_<country>`, `about.intro_<country>` locale keys | `src/i18n/locales/*.json` | WEB-M01, NAT-H03, NAT-H04 |
| 3.2 | Gate web header/footer/about on country | `HomePage`, `AboutPage`, `Footer`, `App.tsx` | WEB-M01 |
| 3.3 | Gate Android footer/about | `Components.kt`, `AboutScreen.kt` | NAT-H03 |
| 3.4 | Gate iOS footer/about | `HomeView.swift`, `AboutView.swift` | NAT-H03 |
| 3.5 | Run `export-native-data.cjs` after locale changes | `shared/`, native bundles | — |

**Verify:** Switch to Mongolia on web + both simulators; no "Yakutia" in footer/about.

---

## Phase 4 — Native parity fixes (Est. 1 PR)

| # | Task | Files | IDs |
|---|------|-------|-----|
| 4.1 | iOS Home viewer Details button | `HomeView.swift:39-43` | NAT-H01 |
| 4.2 | iOS pass plant's country to detail | `CatalogView`, `SearchView`, `HomeView`, `AboutView` | NAT-H02 |
| 4.3 | iOS navigation dedupe | All `NavigationLink(value: plant)` sites | NAT-M01 |
| 4.4 | Android invalid slug → not-found UI | `MainActivity.kt:203-204` | NAT-M02 |
| 4.5 | Country change resets nav + viewer | `MainActivity.kt`, iOS settings handler | NAT-M08 |
| 4.6 | Android reduceMotion system setting | `Settings.kt:81-86` | NAT-M03 |

**Verify:** iOS + Android simulator builds pass.

---

## Phase 5 — Accessibility & UX (Est. 1-2 PRs)

| # | Task | Files | IDs |
|---|------|-------|-----|
| 5.1 | ImageViewer modal a11y (dialog, focus trap) | `ImageViewer.tsx` | WEB-H04 |
| 5.2 | PlantCard keyboard access | `PlantCard.tsx` | WEB-H05 |
| 5.3 | 404 route | `App.tsx` + new `NotFoundPage.tsx` | WEB-H03 |
| 5.4 | Plant not-found dedicated page | `PlantDetailPage.tsx` | WEB-H06 |
| 5.5 | Search input labels, remove autoFocus | `CatalogPage`, `SearchPage` | WEB-M05, WEB-M06 |
| 5.6 | Language switcher + filter chip a11y | `LanguageSwitcher`, `CatalogPage` | WEB-M15, WEB-M16 |
| 5.7 | iOS 44pt segmented + filter chips | `SettingsView`, `CatalogView` | NAT-M04, NAT-M05 |
| 5.8 | Android TalkBack content descriptions | `MainActivity`, `ViewerScreen`, `DetailScreen` | NAT-M06, NAT-M07 |
| 5.9 | Skip-nav link | `App.tsx`, `Header.tsx` | WEB-L17 |
| 5.10 | Loading fallbacks for Suspense | `App.tsx`, `GalleryGrid`, `PlantDetailPage` | WEB-M10 |

---

## Phase 6 — i18n cleanup (Est. 1 PR)

| # | Task | Files | IDs |
|---|------|-------|-----|
| 6.1 | `getAppLanguage()` helper | New `src/i18n/language.ts`, all pages | WEB-H07 |
| 6.2 | English `photoCount` plurals | `en.json` | WEB-M17 |
| 6.3 | Russian `plateCount_other` | `ru.json` | WEB-M18 |
| 6.4 | Remove Sakha dead keys or wire them up | `sah.json` | DATA-D02 |
| 6.5 | Locale key parity CI script | New `scripts/check-locale-keys.cjs` | R-D04 |
| 6.6 | Move Legal copy to locale JSON | `LegalPage.tsx`, locales, export script | WEB-M02, R-D07 |

---

## Phase 7 — Content & assets (Est. 1+ PRs, may need photography)

| # | Task | Files | IDs |
|---|------|-------|-----|
| 7.1 | Re-shoot 4 orphan Yakutia photos | `_src_originals/whatsapp/`, IMAGE_MAP | CONTENT orphans |
| 7.2 | Run Mongolia photo↔species audit | New audit doc | CONTENT-T04 |
| 7.3 | Add AI-plate citation caveat | About/Legal locales | CONTENT plate caveat |
| 7.4 | Fix legal privacy wording (all platforms) | Legal pages | CONTENT-L01 |
| 7.5 | Per-plant OG metadata | `PlantDetailPage`, `App.tsx` | WEB-M11 |

---

## Phase 8 — Performance & cleanup (Est. 1 PR, lower priority)

| # | Task | Files | IDs |
|---|------|-------|-----|
| 8.1 | Lazy-load HomePage | `App.tsx` | R-W04 |
| 8.2 | Error boundary | `main.tsx` | WEB-L10 |
| 8.3 | Image onError placeholders | `PlantCard`, `HomePage`, etc. | WEB-L11 |
| 8.4 | Remove dead exports | `plants.ts` | WEB-L08, R-W10 |
| 8.5 | Update stale comments | `mongolia.ts`, manifest script | WEB-L09, DATA-D04 |
| 8.6 | Hoist SettingsPage sections | `SettingsPage.tsx` | R-W09 |
| 8.7 | iOS navigation modifier extraction | `HomeView`, etc. | R-N02 |
| 8.8 | Split MainActivity | `MainActivity.kt` | R-N04 |

---

## Suggested PR stack (Graphite-friendly)

```text
PR1: phase-1/settings-validation-viewer-fixes-typecheck
PR2: phase-2/sitemap-pipeline-image-map
PR3: phase-3/country-aware-copy-locales
PR4: phase-3/country-aware-copy-web
PR5: phase-4/native-parity-ios-android
PR6: phase-5/a11y-404-loading
PR7: phase-6/i18n-cleanup-legal-locale
PR8: phase-7/content-photos-legal-og
PR9: phase-8/perf-cleanup
```

Dependencies: PR3 before PR4/PR5 (locale keys). PR2 before PR7.5 (sitemap). PR1 before all (typecheck gate).

---

## Definition of done (per phase)

- [ ] `npx tsc -b` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Manual smoke test on `vite preview` (home, catalog, search, detail, settings, country switch)
- [ ] If native touched: `export-native-data.cjs` + platform build
- [ ] Entry added to `docs/BUG_JOURNAL.md`
- [ ] No regression of BUG_JOURNAL "Patterns to scan for FIRST"

---

## Files most likely to change (quick reference)

```text
src/context/SettingsContext.tsx          ← Phase 1
src/components/Gallery/GalleryGrid.tsx     ← Phase 1
src/components/common/ImageViewer.tsx      ← Phase 1, 5
src/pages/PlantDetailPage.tsx              ← Phase 1, 5
package.json                               ← Phase 1, 2
scripts/gen-sitemap.cjs                    ← Phase 2
src/i18n/locales/{en,ru,sah}.json          ← Phase 3, 6
scripts/export-native-data.cjs             ← Phase 3, 6
ios/OttorMastar/Sources/HomeView.swift     ← Phase 4
android/.../MainActivity.kt                ← Phase 4
src/App.tsx                                ← Phase 5
docs/BUG_JOURNAL.md                        ← Every phase
```

---

*Handoff index: [`2026-07-06-FULL-AUDIT-INDEX.md`](./2026-07-06-FULL-AUDIT-INDEX.md)*