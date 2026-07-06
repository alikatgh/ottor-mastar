# Round 2 — Audit Backlog Fix-Pass Implementation Report

**Date:** 2026-07-06
**Scope:** Multi-agent fix pass over the Ottor Mastar Round-2 audit backlog (groups G1–G16).
**Phase-1 preservation:** All groups report Phase-1 fixes untouched.

---

## Summary

| Group | Files | Findings addressed | Verify verdict |
|---|---|---|---|
| **G1-locales** | `src/i18n/locales/{en,ru,sah}.json` | New keys (subtitle/intro/notFound/plant.notFound), photoCount/plateCount plurals, WEB-M17/M18/M19, dead-key removal | ⚠️ **issues** — 2 missing keys (`notFound.home`, `notFound.catalog`) |
| **G2-appshell** | `App.tsx`, `HomePage.tsx`, `AboutPage.tsx`, `Footer.tsx`, +`NotFoundPage.tsx` | WEB-H03, WEB-M01/R-W03, WEB-M11, WEB-M21, R-W04, WEB-M03 | ⚠️ **issues** — code correct; blocked on 5 G1 keys |
| **G3-search** | `CatalogPage.tsx`, `SearchPage.tsx`, +`utils/plantSearch.ts` | R2-W-H03/R2-R-W01, WEB-M05, WEB-M06, WEB-M16 | ✅ **ok** |
| **G4-imageviewer** | `common/ImageViewer.tsx` | WEB-H04, R2-W-M03, R2-W-M04, R2-W-M05, WEB-M20 | ✅ **ok** |
| **G5-gallery** | `Gallery/PlantCard.tsx` | WEB-H05, WEB-L11, R2-W-M02 | ✅ **ok** |
| **G6-detail-legal** | `PlantDetailPage.tsx` | WEB-H06, WEB-M07, WEB-M08, WEB-M09, WEB-M14 | ✅ **ok** |
| **G7-settings** | `SettingsPage.tsx`, `common/LanguageSwitcher.tsx` | R-W09, R2-W-M07, WEB-M13, WEB-M15, WEB-L16 | ✅ **ok** |
| **G8-data** | `data/{countries,plants,mongolia}.ts` | WEB-L08/R-W10, WEB-L09/DATA-D04, R2-X-02, R2-W-M08, R2-W-M12, WEB-L18 | ⏳ **not run** (needs central verify) |
| **G9-entry-css** | `main.tsx`, `index.css`, +`ErrorBoundary.tsx` | WEB-L10, WEB-L01, R2-W-M10 | ✅ **ok** |
| **G10-sitemap-npm** | `gen-sitemap.cjs`, `package.json`, `README.md` | DATA-B01, R-D02, README refresh | ⏳ **not run** (needs central verify) |
| **G11-pipeline** | `optimize-images.cjs`, `optimize-illustrations.cjs`, `gen-icons.cjs`, `export-native-data.cjs` | DATA-B03/R-D06 (×2), DATA-B05, R2-X-03 | ✅ **ok** |
| **G12-ci-checks** | +`check-locale-keys.cjs`, +`check-sitemap.cjs` | New CI guards (locale-key parity, sitemap parity) | ✅ **ok** |
| **G13-ios-core** | `PlantImage.swift`, `AppSettings.swift` | SP2-H02, SP2-M03, SP2-M05 | ✅ **ok** |
| **G16-android-ui** | `ViewerScreen.kt`, `DetailScreen.kt`, `CatalogScreen.kt`, `SearchScreen.kt`, `Components.kt` | SP2-H01, SP2-M01/M02, SP2-M07, SP2-M08, SP2-M10, SP2-M11 | ⚠️ **issues** — `MainActivity.kt` compile break (out-of-allowlist) |

**Blockers before merge:** two of them are real and cross-group:

1. **G1 must add `notFound.home` and `notFound.catalog`** to all three locales — the 404 page buttons render raw key strings otherwise (see G1/G2/G12).
2. **`MainActivity.kt` will not compile** until the stale `country = country,` arg on the `ViewerOverlay(...)` call is removed (G16 SP2-H01 changed the signature). This file is outside G16's allowlist.

---

## G1-locales — ⚠️ issues

**Files:** `src/i18n/locales/en.json`, `src/i18n/locales/ru.json`, `src/i18n/locales/sah.json`

**Findings fixed:**
- New trilingual keys: `app.subtitle_mongolia`, `about.intro_mongolia`, `notFound.title`, `notFound.body`, `plant.notFound`, `plant.notFoundBody`.
- WEB-M17: English `photoCount` plural (`gallery.photoCount` → `photoCount_one`/`_other`).
- WEB-M18: Russian `home.plateCount_other`.
- WEB-M19: Sakha `plateCount` resolves (kept bare `plateCount` + added `_one`/`_other` so the plural machinery works in the fallback language).
- Russian `gallery.photoCount` now `_one`/`_few`/`_many` (all "фото", indeclinable).
- Removed dead keys (grep-confirmed zero `t()` refs): `en`+`ru` `plant.categories`, `en`+`ru` `about.contact`, `sah` `catalog.sortBySeason`, `sah` `common.disclaimerFull`, `sah` `about.features.*`.

**Keys added:** `app.subtitle_mongolia`, `gallery.photoCount_one/_other/_few/_many`, `home.plateCount_one/_other`, `plant.notFound`, `plant.notFoundBody`, `about.intro_mongolia`, `notFound.title`, `notFound.body`.

**New files:** none.

**Residual risks / verify findings:**
- **BLOCKER (from verify):** `src/pages/NotFoundPage.tsx:35` calls `t('notFound.home')` and `:46` calls `t('notFound.catalog')`, but neither key exists in any locale. `fallbackLng` is `sah` (also missing them) and there is no `parseMissingKeyHandler`, so both 404 buttons render the literal strings `notFound.home` / `notFound.catalog`. **Fix:** add `notFound.home` and `notFound.catalog` to all three locales (e.g. en: "Go home" / "Browse catalog"). G1's own summary claimed only `notFound.title`/`body` were needed and did not flag these two consumer-referenced keys.
- **MINOR (non-blocking):** Russian `gallery.photoCount` has `_one`/`_few`/`_many` but no `_other`/bare key. Integer counts land in `_many`; only a theoretical `_other` request would miss. Not a shipping blocker.
- Consumers must use the exact key names; the 404 block is top-level `notFound.*`, the invalid-slug strings are `plant.notFound` / `plant.notFoundBody`.
- `gallery.photoCount` and `home.plateCount` are now count-plural keys — consumers MUST call them with a `{ count }` arg (HomePage already does).
- `en catalog.categories` was left in place (grep found no `t()` ref); flagged for a future cleanup.
- Sakha renderings of the new notFound/mongolia strings are best-effort; native-speaker review advisable.

---

## G2-appshell — ⚠️ issues (code correct; blocked on G1 keys)

**Files:** `src/App.tsx`, `src/pages/HomePage.tsx`, `src/pages/AboutPage.tsx`, `src/components/Layout/Footer.tsx`

**Findings fixed:**
- **R-W04:** `HomePage` is now `lazy()` (App.tsx:13).
- **WEB-H03:** catch-all `Route` → `NotFoundPage` (App.tsx:70).
- **WEB-M01/R-W03:** country-aware subtitle/intro via `t(['app.subtitle_'+country, 'app.subtitle'])` in HomePage, AboutPage, Footer, App.
- **WEB-M11:** plant-specific title/og:title/og:description on `/plant/:slug` routes (App.tsx:110-119) via `findPlantBySlug`.
- **WEB-M21:** metadata effect deps are `[lang, country, pathname]`, no unstable `t`.
- **WEB-M03:** About stat labels moved to i18n; language count from `LANGUAGES.length` (=3).

**New files:** `src/pages/NotFoundPage.tsx` (herbarium style, links to `/` and `/catalog`).

**Keys added (referenced, owned by G1):** `notFound.title/body/home/catalog`, `app.subtitle_yakutia/_mongolia`, `about.intro_yakutia/_mongolia`, `about.statPlants/statMedicinal/statLanguages`. G2 did not edit any locale JSON (correctly out of allowlist).

**Residual risks / verify findings:**
- All 6 claimed fixes present, correct, and type-safe. No Phase-1 file touched (ScrollToTop retained; SettingsContext/GalleryGrid/PlantDetailPage/ImageViewer/index.css untouched).
- **Graceful (not a defect):** `app.subtitle_yakutia` and `about.intro_yakutia` are absent but consumed via `t([specific, generic])`, so they correctly fall back to `app.subtitle` / `about.intro`.
- **OUTSTANDING G1 DEPENDENCY (ships raw keys if omitted):** 5 keys missing in all three locales AND consumed with NO fallback — `notFound.home` (NotFoundPage:35), `notFound.catalog` (NotFoundPage:46), `about.statPlants` (AboutPage:26), `about.statMedicinal` (:27), `about.statLanguages` (:28). G2's slice is shippable **only if G1 delivers these 5 keys**; downstream verify must confirm before merge.
- G2's residualRisks were accurate: correctly flagged all 5 missing keys and correctly distinguished fallback-safe variants from no-fallback keys.

---

## G3-search — ✅ ok

**Files:** `src/pages/CatalogPage.tsx`, `src/pages/SearchPage.tsx`
**New files:** `src/utils/plantSearch.ts`

**Findings fixed:**
- **R2-W-H03/R2-R-W01:** `filterPlants(plants, query, lang, {deep})` — always matches `names.sah/ru/en/latin`; with `deep:true` also `description[lang]` + `medicinalUses[lang]`. Case- and diacritic-insensitive via shared `normalizeForSearch()` (NFD normalize + strip combining marks `U+0300–U+036F` + lowercase + trim). Wired into both surfaces (`deep:true`), replacing the inline `.toLowerCase().includes` filters. Category pre-filter runs before search so counts stay correct; alpha/season sort preserved.
- **WEB-M05:** `aria-label` on both search inputs.
- **WEB-M06:** removed `autoFocus` from SearchPage input.
- **WEB-M16:** category chips expose `aria-pressed`.

**Keys added:** none (reused `catalog.searchPlaceholder` for the aria-label).

**Residual risks:**
- `filterPlants` returns the full list for a blank query by design; SearchPage still guards blank → `[]` and CatalogPage only calls inside `if(search.trim())`. Any future caller must apply the same guard.
- The `?? ''` fallbacks at `plantSearch.ts:47` are dead branches (LocalizedString guarantees a string) — harmless, defensive, type-safe.
- Verify: no defects; locales consistent; Phase-1 preserved.

---

## G4-imageviewer — ✅ ok

**Files:** `src/components/common/ImageViewer.tsx`

**Findings fixed:**
- **WEB-H04:** dialog a11y + focus management — root gets `role="dialog"`, `aria-modal="true"`, `aria-label={item.title}`; `openerRef` stores `document.activeElement` on mount, focuses the close button, restores focus on cleanup; Tab is trapped within the overlay (live focusable query each keypress, first↔last wrap, pulls focus back if it escapes).
- **R2-W-M03:** empty-items — `useEffect([items.length, requestClose])` calls `requestClose()` when `items.length===0`; render still short-circuits via `if (!item) return null`.
- **R2-W-M04:** ArrowLeft/Right gate `go(±1)` on `!zoomed` so they don't fight pan; Esc still closes unconditionally.
- **R2-W-M05:** `useEffect([index])` resets `setZoomed(false)` on nav so swipe-down dismiss re-enables per photo.
- **WEB-M20:** `mountedRef` guards the post-unmount `animate(...).then(onClose())`, preventing setState-after-unmount.

**Keys added:** none (reused `common.close/previous/next`, `plant.details`).

**Residual risks:**
- `aria-label` uses `item.title` (plain text, per spec).
- Focus trap relies on live DOM query each Tab; the trap cycles close button → nav arrows (when present) → Details button.
- Verify: no issues; Phase-1 fixes (onTransform on line 198; iOS-Photos motion, blurred letterbox, always-visible caption) untouched.

---

## G5-gallery — ✅ ok

**Files:** `src/components/Gallery/PlantCard.tsx`

**Findings fixed:**
- **WEB-H05:** card `<motion.div>` gains `role="button"`, `tabIndex={0}`, `aria-label={name}`, `onKeyDown` activating on Enter/Space (preventDefault stops Space-scroll). Global `:focus-visible` rule (index.css:185) supplies the visible outline — no CSS change needed.
- **WEB-L11:** `failed` state driven by `img onError`; on failure the `<img>` unmounts and is replaced by a parchment fill with a faint serif fleuron (`aria-hidden`); skeleton now gated on `!loaded && !failed`.
- **R2-W-M02:** removed unused `layoutId={`plant-${plant.id}`}` (grep-confirmed no other consumer of the shared-layout key).

**Keys added:** none (fleuron is decorative, `aria-hidden`).

**Residual risks:**
- `GalleryGrid.tsx` was in the allowlist but needed no edit — its finding was a KEEP directive for the Phase-1 `useEffect([plants])` reset (intact, lines 26-28).
- Placeholder relies on `.gallery-item` being `position:relative` and the `text-ink-muted` utility — both confirmed present in index.css (outside allowlist, read-only).
- Verify: no issues; locales consistent; Phase-1 preserved.

---

## G6-detail-legal — ✅ ok

**Files:** `src/pages/PlantDetailPage.tsx` (LegalPage.tsx intentionally untouched — Legal→locale move deferred)

**Findings fixed:**
- **WEB-H06:** real not-found screen (56-94) using `t('plant.notFound')`/`t('plant.notFoundBody')` + Links to `/catalog` (`catalog.title`) and `/` (`plant.backToGallery`); no residual `catalog.noResults`.
- **WEB-M07:** pagination dots are real `type="button"` controls, each with localized `aria-label` (slideLabel), `aria-current` on the active slide, `scrollToSlide(i)` smooth-scroll; 32px hit target with an 8px `aria-hidden` inner dot (geometry never changes on state — color only).
- **WEB-M08:** desktop back button `type="button"`.
- **WEB-M09:** `goBack()` reads `window.history.state.idx`, navigates to `/catalog` when idx is undefined/≤0 (direct link), else `navigate(-1)`; wired into desktop and mobile back buttons (mobile also gained `type="button"`).
- **WEB-M14:** `InfoTip` uses `useId()` for the tooltip, sets `aria-describedby` while open, closes on Escape (keydown scoped to open state).

**Keys added:** none.

**Residual risks:**
- **RESOLVED (was G6's only residual):** `plant.notFound`/`plant.notFoundBody` are now present in `sah.json` — G1 added them. All `t()` keys used in the file are present in en/ru/sah.
- `goBack()` relies on React Router v6+ storing stack position at `window.history.state.idx`; a future router change would need revisiting (degrades safely to `/catalog`).
- Verify: all five fixes present/correct/type-safe; Phase-1 `useEffect([slug, settings.leadImage])` reset intact; hooks run before the line-56 early return.

---

## G7-settings — ✅ ok

**Files:** `src/pages/SettingsPage.tsx`, `src/components/common/LanguageSwitcher.tsx`

**Findings fixed:**
- **R-W09:** per-render `buildSections()` replaced with two module-level constants `COUNTRY_SECTION` + `SECTIONS` (computed once).
- **R2-W-M07:** combined "Country & language" block split into a Language-only section (`settings.sectionLanguage`) and a Country-only section (`settings.sectionCountry`), each with its own overline heading.
- **WEB-M13:** enum `Segmented onChange` in `SettingRow` now drops any value not in `item.options` before `update()` (which re-validates as defense in depth), so a stale click can't write an out-of-enum value.
- **WEB-M15:** `LanguageSwitcher` buttons carry `aria-pressed={i18n.language===code}` (hoisted `active` const); SettingsPage Segmented got a consistent `aria-pressed` bonus.
- **WEB-L16:** Reset now calls `resetAll()` — `reset()` + `i18n.changeLanguage()` to the browser default via a new `detectedDefaultLanguage()` (region-strip + supported-list clamp, falls back to `sah`).

**Keys added (referenced, owned by G1):** `settings.sectionLanguage`, `settings.sectionCountry`.

**Residual risks:**
- **LOCALE HAND-OFF (expected, flagged):** `settings.sectionLanguage` (SettingsPage:156) and `settings.sectionCountry` (:39) do not yet exist in any locale (per verify grep). Suggested values — en: "Language"/"Country"; ru: "Язык"/"Страна"; sah: "Тыл"/"Дойду". Until G1 adds them, `fallbackLng` `sah` ships the raw keys as headings.
- **ORPHAN KEY:** `settings.sectionRegion` still exists in all three locales but has zero code references now (name-drift with the split); G1 may remove it.
- `detectedDefaultLanguage()` deliberately ignores the `i18nextLng` localStorage cache so Reset returns to the true browser default.
- Verify: all six fixes present/correct/type-safe; type-safety of `SUPPORTED_LANGS`/`Segmented`/`SettingRow` union checks confirmed; Phase-1 (`validateSettings` clamp, Yakutia default) preserved.

---

## G8-data — ⏳ verify not run (needs central verification)

**Files:** `src/data/countries.ts`, `src/data/plants.ts`, `src/data/mongolia.ts`

**Findings fixed:**
- **WEB-L08/R-W10:** removed dead exports `SEASONS`, `getOriginalImagePath`, `getPlantBySlug` (grep-confirmed zero importers).
- **WEB-L09/DATA-D04:** fixed stale `mongolia.ts` plate comments (11 plates `mongolia-01…11-ill` exist on disk and in `AVAILABLE_ILLUSTRATIONS`).
- **R2-X-02:** `imageBase` now stamped on every plant at registry build time (single choke point via `COUNTRY_DEFS` → normalization pass building `COUNTRIES`); identical behavior for Yakutia.
- **R2-W-M08:** added `Country.heroSlug` + exported `getHeroPlant(id)`; heroes yakutia=`daylily` (preserves current last-entry behavior), mongolia=`mn-marigold` (plated, iconic).
- **R2-W-M12:** `@deprecated` JSDoc on `getPlantsByCategory`, `getPlantsSortedByName`, and `IMAGE_MAP`.
- **WEB-L18:** dev-time (`NODE_ENV !== 'production'`) cross-country duplicate-slug assertion (47/47 currently unique).

**New files:** none. **Keys added:** none.

**Residual risks (verify was NOT run — central verification required):**
- **HomePage rewiring (owned by pages group):** HomePage still computes hero as `plants[plants.length - 1]`; should import `getHeroPlant`. For Yakutia identical (daylily is last); for Mongolia, `getHeroPlant` returns `mn-marigold` (plated) instead of the implicit `mn-cosmos` (photo-only) — an intentional cover change once wired.
- The dev-time slug assertion uses `process.env.NODE_ENV` (NOT `import.meta.env`) because `export-native-data.cjs` transpiles `countries.ts` with `tsc --module commonjs`, under which `import.meta` is a hard TS1343 error. Relies on `@types/node` for the `process` global in the web `tsc -b` build.
- `IMAGE_MAP` is now dead in-code but kept `@deprecated` as provenance; deletable in a later pass.
- **Central verify MUST run** `tsc -b` and `node scripts/export-native-data.cjs` to confirm both the web build and the CommonJS transpile succeed with the new normalization + guard.

---

## G9-entry-css — ✅ ok

**Files:** `src/main.tsx`, `src/index.css`
**New files:** `src/components/ErrorBoundary.tsx`

**Findings fixed:**
- **WEB-L10:** `ErrorBoundary` (React class, `getDerivedStateFromError` + `componentDidCatch`, herbarium-styled fallback matching NotFoundPage, full-page reload recovery) wraps `<App/>` in `main.tsx`.
- **WEB-L01:** silent `if (root)` no-op replaced with an explicit guard that throws a clear diagnostic Error when `#root` is missing, then mounts unconditionally.
- **R2-W-M10:** removed the dead `.gallery-item::after` / `:hover::after` hover-scrim block from index.css (PlantCard now renders its own always-visible scrim); both `html[data-reduce-motion]` rules and the `@media (prefers-reduced-motion: reduce)` block left intact.

**Keys added:** none — ErrorBoundary uses self-contained inline trilingual copy (sah/ru/en) read from `document.documentElement.lang`, because it mounts ABOVE the i18n provider and Router (i18n could be the crash source).

**Residual risks:**
- Inline trilingual copy is intentional (boundary sits above i18n); recommend keeping inline. Adds no keys for G1.
- `componentDidCatch` logs to `console.error` only (no telemetry backend exists); hook point for a future crash sink.
- Verify: no issues; locales consistent; Phase-1 preserved.

---

## G10-sitemap-npm — ⏳ verify not run (needs central verification)

**Files:** `scripts/gen-sitemap.cjs`, `package.json`, `README.md`

**Findings fixed:**
- **DATA-B01:** `gen-sitemap.cjs` now enumerates all countries' slugs via the real `COUNTRIES` registry (transpile+require, mirroring `export-native-data.cjs`) instead of regex-scraping only `plants.ts`; added `/settings`. Yields 6 static + 47 plant URLs (23 Yakutia + 24 Mongolia). `ottormastar.aulenor.com` origin and XML/lastmod/changefreq shape retained.
- **R-D02:** added npm scripts `data:sitemap`, `data:export`, `optimize:mongolia`, `optimize:all`, and `prebuild=gen-sitemap`; build/lint/typecheck and existing optimize scripts preserved.
- **README:** fixed stale sections — sources under `_src_originals/`, a Scripts reference table (10 scripts), corrected image pipeline + Adding-New-Plants flow + native export step.

**New files:** none. **Keys added:** none.

**Residual risks (verify was NOT run — central verification required):**
- `prebuild` now shells out to `tsc` via `gen-sitemap.cjs` (same proven pattern as `export-native-data.cjs`; `typescript` is a devDependency). The actual build in central verify will confirm.
- The regenerated `public/sitemap.xml` is written as a script side-effect (already `M` in git status); the verify/commit step should include the regenerated file.
- Plant-URL count (47) is derived dynamically from `COUNTRIES`, so it self-updates — no hardcoded total to drift.

---

## G11-pipeline — ✅ ok

**Files:** `scripts/optimize-images.cjs`, `scripts/optimize-illustrations.cjs`, `scripts/gen-icons.cjs`, `scripts/export-native-data.cjs`

**Findings fixed:**
- **DATA-B03/R-D06 (×2):** in both `optimize-images.cjs` and `optimize-illustrations.cjs`, replaced the single reused `sharp(inputPath)` instance with a FRESH `sharp(inputPath)` inside the per-size loop (a sharp pipeline is consumed by `.toFile()`, so the old code silently dropped every size after `thumb`); added `.rotate()` to honour EXIF orientation, matching `optimize-mongolia.cjs`.
- **DATA-B05:** `gen-icons.cjs` hero source parameterized — `const heroRel = process.env.HERO_IMAGE ?? 'plants/full/plant-23.webp'` (Sardaana lily fallback).
- **R2-X-03:** `export-native-data.cjs` — `const IMAGE_HOST = process.env.IMAGE_HOST ?? 'https://ottormastar.aulenor.com'` (env override, production default). Transpile flags, write targets, and JSON output shapes untouched.

**New files:** none. **Keys added:** none.

**Residual risks:**
- `gen-icons.cjs` `HERO_IMAGE` expects a path relative to `public/`; an absolute or `public/`-prefixed value resolves wrong (documented inline).
- `.rotate()` is correct EXIF-honouring behaviour; re-running now bakes in orientation for JPG sources (no-op for PNG) — expected, matches Mongolia pipeline.
- `IMAGE_HOST` override only affects the `imageHost` field in plants.json; bundled image paths are relative (no rewrite needed).
- Verify: no issues; locales consistent; Phase-1 preserved.

---

## G12-ci-checks — ✅ ok

**New files:** `scripts/check-locale-keys.cjs`, `scripts/check-sitemap.cjs` (Node-stdlib only, no deps, no transpile, exit-1-on-failure)

**Findings addressed:**
- **`check-locale-keys.cjs`:** enumerates every used `t()` key across `src/` and diffs against en/ru/sah. Handles direct `t('x')`/`t(\`x.${v}\`)`; key-fallback arrays `t([override, base])` (only last element required); indirect `labelKey`/`noteKey`/`titleKey` (object-property + JSX-attribute forms); dynamic families `categories.<cat>`, `seasons.<season>`, `settings.country_<CountryId>`. Plurals: a base key is satisfied by any `_one/_few/_many/_other` variant. Reports MISSING + DEAD, exit 1 on either.
- **`check-sitemap.cjs`:** mines plant slugs from every `src/data/*.ts` (except `countries.ts` / `available-illustrations.ts`), parses `public/sitemap.xml` `<loc>` paths, asserts `/plant/*` count === total slug count, exact-set parity, and `/settings` present. Exit 1 on mismatch.

**Live detections (out of G12 scope to fix):**
- Locale check: 7 MISSING (`about.statPlants`, `about.statMedicinal`, `about.statLanguages`, `notFound.home`, `notFound.catalog`, `settings.sectionCountry`, `settings.sectionLanguage`) and 8 DEAD (incl. `settings.sectionRegion` — a real name-drift pair, `catalog.categories`, `catalog.sortByName`, `common.error/loading/viewAll`, `gallery.title`, `plant.description`). Zero false positives after adversarial spot-checks.
- Sitemap check: plant-URL count 23 ≠ 47 total, 24 Mongolia plants missing, `/settings` absent (pre-G10 state).

**Residual risks:**
- Both scripts are string/regex scanners, not AST parsers — they handle the exact idioms present in `src/` today. Fully opaque runtime key concatenation or `t()` `returnObjects` would not be detected (neither pattern exists). Extend `T_CALL`/`INDIRECT` regexes or data-family miners if a new idiom appears.
- The MISSING/DEAD locale keys are owned by G1; the sitemap drift is owned by G10 — both correctly flagged out-of-scope.
- Verify: no issues; both files verified as claimed; no Phase-1 file touched; detect-only (adds zero keys).

---

## G13-ios-core — ✅ ok

**Files:** `ios/OttorMastar/Sources/PlantImage.swift`, `ios/OttorMastar/Sources/AppSettings.swift`

**Findings fixed:**
- **SP2-H02 + SP2-M03 (`PlantImage.swift`):** `PlantImageView`'s detached-task load now gates the remote fetch on `size == .full` — a bundled miss for `.thumb`/`.medium` returns nil (parchment placeholder, no `URLSession`); the `.full` remote path requires `(response as? HTTPURLResponse)?.statusCode == 200` before decode/cache (mirroring `ImageViewer.swift`). Public API unchanged; all 8 consumers call it only with `.thumb`/`.medium` and stay offline-first.
- **SP2-M05 (`AppSettings.swift`):** added `reduceMotionObserver` token + `init()` subscribing to `UIAccessibility.reduceMotionStatusDidChangeNotification` (main queue, `[weak self]`, fires `objectWillChange.send()`) so live OS Reduce Motion changes re-drive the UI; `deinit` removes the observer. `reduceMotion` accessor logic unchanged; no retain cycle.

**New files:** none. **Keys added:** none.

**Residual risks:**
- `AppSettings` now has an explicit `init()`; if a future change adds a designated initializer or `@MainActor`, confirm the notification-subscription init is preserved. No isolation change introduced.
- Verify: no issues; locales consistent; Phase-1 preserved.

---

## G16-android-ui — ⚠️ issues

**Files:** `android/.../ui/ViewerScreen.kt`, `DetailScreen.kt`, `CatalogScreen.kt`, `SearchScreen.kt`, `Components.kt`

**Findings fixed (all within G16's 5 allowlisted files, verified correct):**
- **SP2-H01:** added `country: Country` to `ViewerItem`; `ViewerOverlay`/`ZoomablePage` resolve every image (backdrop + medium + full + blurred letterbox) via per-item `item.country`; the top-level `country` param on `ViewerOverlay` was removed (matches iOS `ViewerItem.country`).
- **SP2-M07:** `LaunchedEffect(pagerState.currentPage) { zoomed = false }` resets zoom-lock per page.
- **SP2-M11:** `ViewerOverlay` guards `items.isEmpty()` by dismissing instead of indexing an empty list.
- **SP2-M01/M02:** `String.foldDiacritics()` in Components.kt (NFD + strip `\p{Mn}` + lowercase; Sakha ө/ү/ҥ survive, Russian stress marks / Latin accents fold), used in SearchScreen and CatalogScreen (query pre-folded once).
- **SP2-M08:** `LaunchedEffect(plant.slug, settings.leadImage) { pagerState.scrollToPage(0) }` snaps the carousel to slide 0 when lead-image order flips.
- **SP2-M10:** DetailScreen `HorizontalPager` gets a `NestedScrollConnection` (`onPostScroll` forwards unconsumed vertical deltas via `dispatchRawDelta`) so horizontal paging wins horizontally without blocking vertical scroll. `awaitEachGesture` zoom handling kept (not reverted to `detectTransformGestures`).

**New files:** none. **Keys added:** none (`plant.photograph` already exists in all three Android assets locales).

**Residual risks / verify findings:**
- **BLOCKER (compile break, `MainActivity.kt:275` — OUTSIDE G16's allowlist):** the `ViewerOverlay(...)` call still passes `country = country,`, but SP2-H01 removed that parameter — a hard Kotlin error. The `MainActivity` owner correctly added `country=` to the two `ViewerItem` constructions (home ~186-197, detail ~252-262) and `kindLabel` on the detail item, but did NOT delete the stale `country = country,` on the overlay call. **Fix:** remove `MainActivity.kt:275`. G16 flagged this exact break in its residualRisks; it just wasn't applied. G16's own 5 files are correct.
- **PARITY GAP (non-blocking, `MainActivity.kt:191` — SP2-M09, outside allowlist):** home-viewer `ViewerItem(... kindLabel = null ...)` should be `kindLabel = loc.t("plant.photograph")` for iOS parity (`loc` already in scope in `AppRoot`; key exists in all three assets locales). Cosmetic caption gap, not a compile error.
- SP2-M07/M08 reset behavior verified by reading only (no gradle/emulator per scope rule).
- Verify: all G16-owned claims confirmed present/correct/type-safe; no bug-journal regression (`detectTransformGestures` appears only in a comment); Phase-1 fixes intact.

---

## Needs central verification

Two groups (G8-data, G10-sitemap-npm) had **no verify pass run** and several fixes touch the build/native-export toolchain. Run the following from the project root before merge:

1. **Web typecheck/build:** `tsc -b` — confirms the G8 `countries.ts` normalization pass, `getHeroPlant`, the `process.env.NODE_ENV` slug-guard (needs `@types/node`), and all G1–G7/G9 TSX edits compile.
2. **Lint:** `oxlint` — confirms the G2 `react-hooks/exhaustive-deps` disable comment and all TSX/TS edits are clean.
3. **Production build:** `vite build` (with `prebuild=gen-sitemap`) — exercises G10's rewritten `gen-sitemap.cjs` (tsc transpile of `COUNTRIES`) and regenerates `public/sitemap.xml`; include the regenerated file in the commit.
4. **Native export:** `node scripts/export-native-data.cjs` — confirms the CommonJS transpile of `countries.ts` succeeds with the G8 normalization + guard and G11's `IMAGE_HOST` override; produces `plants.json`.
5. **New CI guards (G12):** `node scripts/check-locale-keys.cjs` and `node scripts/check-sitemap.cjs` — these currently exit 1 (7 missing + 8 dead locale keys; sitemap drift). They should pass once G1 adds the 2 outstanding keys and reconciles the dead set, and once G10's sitemap regenerates. **Use these as the merge gate for the G1/G10 fixes.**
6. **Android:** `./gradlew assembleDebug` — will FAIL until `MainActivity.kt:275` (`country = country,`) is removed; also apply SP2-M09 (`kindLabel`) in the same edit.
7. **iOS:** `xcodebuild` (OttorMastar scheme) — confirms G13's `PlantImage.swift` + `AppSettings.swift` init/deinit compile.

**Cross-group merge dependencies (must be true before merge):**
- G1 must add `notFound.home`, `notFound.catalog`, `about.statPlants`, `about.statMedicinal`, `about.statLanguages`, `settings.sectionLanguage`, `settings.sectionCountry` to all three locales — else G2/G7 ship raw key strings and G12's locale check stays red.
- `MainActivity.kt` (out of every group's allowlist) needs the two edits above or Android will not compile.

---

## Deferred (out-of-scope flags)

- **Legal → locale move (G6):** `LegalPage.tsx` intentionally untouched; it still compiles independently via its own trilingual `T`/`Tri` tables. Moving its strings into the locale JSONs is deferred.
- **Orphan/dead locale keys (G1/G7/G12):** `settings.sectionRegion` (name-drift with the section split), `en catalog.categories`, `catalog.sortByName`, `common.error/loading/viewAll`, `gallery.title`, `plant.description` are all unreferenced. G12's check flags them; a future G1 cleanup pass should remove or wire them.
- **HomePage hero rewiring (G8):** HomePage still computes hero inline as `plants[plants.length - 1]`; wiring in `getHeroPlant(id)` is deferred to the pages group and will intentionally change the Mongolia cover to `mn-marigold` (plated).
- **`IMAGE_MAP` deletion (G8):** kept `@deprecated` as provenance documentation; no script imports it — deletable in a later pass once provenance lives elsewhere.
- **Dedicated a11y search label (G3):** aria-label reuses `catalog.searchPlaceholder`; a distinct `catalog.searchLabel` key would be a G1 addition if the design team wants a separate spoken label.
- **Russian `gallery.photoCount._other` (G1):** only `_one/_few/_many` present; the integer path lands in `_many`, so the missing `_other` is a theoretical edge, deferred.
- **ErrorBoundary telemetry (G9):** `componentDidCatch` logs to `console.error` only; wiring a crash-reporting sink is deferred until one exists.
