# Deep Audit — Round 2: Web Frontend (NEW findings)

**Date:** 2026-07-06  
**Scope:** Second-pass line-by-line review of all 25 `src/` files + `index.html` + `index.css`  
**Relation:** Supplements [`2026-07-06-web-bugs-and-refactoring.md`](./2026-07-06-web-bugs-and-refactoring.md) — does **not** repeat Round 1 items unless severity changed.

---

## Critical / High (new or upgraded)

### R2-W-H01 — `leadImage` setting change leaves detail carousel on wrong slide

| Field | Value |
|-------|-------|
| **File** | `src/pages/PlantDetailPage.tsx:24-26, 46-51, 76-83` |
| **Severity** | **High** (parity with native SP2-M08) |
| **Symptom** | User on plant detail changes "Lead image" in Settings (or had changed before returning). Slide order flips (plate↔photo) but `activeSlide` and scroll position stay at old index → wrong image shown, wrong pagination dot, viewer opens wrong asset. |
| **Cause** | `slides`/`viewerItems` recompute from `settings.leadImage` but `activeSlide` and `scrollRef` scrollLeft are not reset. |
| **Fix** | `useEffect(() => { setActiveSlide(0); setViewerIndex(null); scrollRef.current?.scrollTo(0,0); }, [slug, settings.leadImage])`. |

### R2-W-H02 — OS `prefers-reduced-motion` not wired to CSS animations

| Field | Value |
|-------|-------|
| **Files** | `src/index.css:275-291`, `src/context/SettingsContext.tsx:79-82` |
| **Severity** | **High** (a11y) |
| **Symptom** | `shelf-nudge`, `swipe-drift`, `skeleton` shimmer, `scroll-behavior: smooth` on `html` run even when user has OS "Reduce motion" enabled but in-app toggle is off. |
| **Cause** | CSS only gates on `html[data-reduce-motion='true']` (in-app toggle). Framer `MotionConfig reducedMotion='user'` covers JS motion only — not plain CSS keyframes. |
| **Fix** | Add `@media (prefers-reduced-motion: reduce)` blocks mirroring `data-reduce-motion` rules; optionally sync OS preference into `document.documentElement.dataset` on load. |

### R2-W-H03 — Catalog search scope narrower than Search page (UX inconsistency)

| Field | Value |
|-------|-------|
| **Files** | `src/pages/CatalogPage.tsx:58-65` vs `src/pages/SearchPage.tsx:20-27` |
| **Severity** | **Medium→High** (user-visible) |
| **Symptom** | Same query on Catalog finds fewer results than Search — Catalog only matches names/Latin; Search also matches `description` and `medicinalUses`. |
| **Fix** | Extract shared `filterPlants(plants, query, lang, { deep: boolean })` helper; use `deep: true` on both or document intentional difference in UI. |

---

## Medium (new)

### R2-W-M01 — Plant detail slug change: state reset partially mitigated

| Field | Value |
|-------|-------|
| **Files** | `src/App.tsx:54`, `src/pages/PlantDetailPage.tsx` |
| **Severity** | **Low** (downgrade from Round 1 WEB-H01) |
| **Finding** | `AppRoutes` wraps routes in `<motion.div key={location.pathname}>`, so navigating `/plant/a` → `/plant/b` **remounts** `PlantDetailPage` and resets `activeSlide`/`viewerIndex`. Round 1 concern is largely mitigated for in-app slug navigation. |
| **Residual risk** | Same-route query/hash changes; future refactor removing pathname key would reintroduce bug. |
| **Fix** | Keep explicit `useEffect([slug])` reset as defense-in-depth; document dependency on `key={pathname}`. |

### R2-W-M02 — `layoutId` on `PlantCard` without destination `LayoutGroup`

| Field | Value |
|-------|-------|
| **File** | `src/components/Gallery/PlantCard.tsx:25` |
| **Severity** | Medium |
| **Symptom** | `layoutId={`plant-${plant.id}`}` set on grid tiles but `PlantDetailPage` hero has no matching `layoutId`. Framer shared-layout transition never completes; may cause dev warnings or wasted layout measurement. |
| **Fix** | Remove unused `layoutId` or implement full shared-element transition on detail hero. |

### R2-W-M03 — ImageViewer: empty `items` array unguarded

| Field | Value |
|-------|-------|
| **File** | `src/components/common/ImageViewer.tsx:44, 101` |
| **Severity** | Medium |
| **Symptom** | `items[index]` when `items.length === 0` → `item` undefined → returns `null`; parent may still think viewer is open. |
| **Fix** | Early `useEffect` to call `onClose()` when `items.length === 0`. |

### R2-W-M04 — ImageViewer: keyboard navigation while zoomed

| Field | Value |
|-------|-------|
| **File** | `src/components/common/ImageViewer.tsx:91-98` |
| **Severity** | Medium |
| **Symptom** | Arrow keys change slide even when `zoomed === true`; conflicts with pan intent and native viewer behavior (pager locked when zoomed). |
| **Fix** | Gate `go(±1)` on `!zoomed`. |

### R2-W-M05 — ImageViewer: `zoomed` not reset on index change

| Field | Value |
|-------|-------|
| **File** | `src/components/common/ImageViewer.tsx:49, 137` |
| **Severity** | Medium (parity SP2-M07) |
| **Symptom** | Swipe to next image while zoomed → `zoomed` stays true → vertical dismiss drag disabled (`drag={zoomed ? false : 'y'}`). |
| **Fix** | `useEffect(() => setZoomed(false), [index])` or key `TransformWrapper` on zoom state reset. |

### R2-W-M06 — PWA manifest and `index.html` are Yakutia-only

| Field | Value |
|-------|-------|
| **Files** | `public/manifest.webmanifest`, `index.html:9-26` |
| **Severity** | Medium |
| **Symptom** | With Mongolia collection live, installed PWA still named "Plants of Yakutia"; OG/Twitter tags hardcoded to Yakutia English copy regardless of `settings.country`. |
| **Fix** | Dynamic manifest not possible statically — use generic name ("Ottor Mastar — Botanical Guide") or country-aware install flows; update meta from `App.tsx` like title. |

### R2-W-M07 — Settings page: duplicate `sectionRegion` heading semantics

| Field | Value |
|-------|-------|
| **File** | `src/pages/SettingsPage.tsx:118-131` |
| **Severity** | Low–Medium (a11y) |
| **Symptom** | Manual "Language" row and `buildSections()[0]` (Country) both render under one `<Section titleKey="settings.sectionRegion">` — screen readers hear one section header for two conceptually distinct controls. |
| **Fix** | Split into `sectionLanguage` and `sectionRegion` or use nested `fieldset`/`legend`. |

### R2-W-M08 — Hero plant selection is array-order dependent

| Field | Value |
|-------|-------|
| **File** | `src/pages/HomePage.tsx:17-22` |
| **Severity** | Medium |
| **Symptom** | Comment says "Sardaana for Yakutia" but code uses `plants[plants.length - 1]`. Works only because `plants.ts` array ends with `daylily`. Mongolia's last entry is arbitrary — cover plate may not be the intended flagship species. |
| **Fix** | Explicit `coverPlantId` per country in `countries.ts` or `heroImageId` field. |

### R2-W-M09 — `CategoryBadge` silent fallback for unknown categories

| Field | Value |
|-------|-------|
| **File** | `src/components/common/CategoryBadge.tsx:19-21` |
| **Severity** | Low–Medium |
| **Symptom** | Unknown `category` string → empty dot style + `t('categories.${category}')` renders raw key. |
| **Fix** | Dev-time assertion; fallback to omit badge or show generic label. |

### R2-W-M10 — Dead CSS: `gallery-item:hover::after` scrim

| Field | Value |
|-------|-------|
| **File** | `src/index.css:293-306` |
| **Severity** | Low |
| **Symptom** | Hover gradient overlay superseded by always-visible tile labels (`PlantCard.tsx:51-64`); duplicate visual logic, minor style recalc on hover. |
| **Fix** | Remove `::after` hover block or gate on `!tileLabels`. |

### R2-W-M11 — `StrictMode` + settings persist effect

| Field | Value |
|-------|-------|
| **Files** | `src/main.tsx:10`, `src/context/SettingsContext.tsx:69-75` |
| **Severity** | Low |
| **Symptom** | React 19 StrictMode double-mount in dev writes localStorage twice on load — harmless but can confuse debugging. |
| **Fix** | No change required for prod; optional dedupe in persist effect. |

### R2-W-M12 — `getPlantsByCategory` / `getPlantsSortedByName` are Yakutia-only

| Field | Value |
|-------|-------|
| **File** | `src/data/plants.ts:797-815` |
| **Severity** | Low (maintainability trap) |
| **Symptom** | Exported helpers operate on Yakutia `plants` array only; Mongolia pages use `usePlants()` + inline sort. Future import of these helpers for Mongolia would silently show wrong data. |
| **Fix** | Remove exports or accept `Plant[]` parameter; add `@deprecated` JSDoc. |

---

## Automated verification (Round 2)

| Check | Result |
|-------|--------|
| `npx oxlint src` | 0 errors, 0 warnings |
| All field WebP on disk | 47×3 sizes = **0 missing** |
| Illustration manifest vs disk | **34/34** present |
| Slug collisions (cross-country) | **0** |
| Plant `id` collisions | **0** |
| `bloomingSeason` keys in `sah.json` | **All 5 values covered** |
| `console.*` in `src/` | **0 files** |
| Duplicate Latin (cross-collection) | `Achillea`, `Galium` shared Yakutia+Mongolia entries (intentional?); `Campanula glomerata` duplicated within Yakutia (`bellflower-clustered`, `bellflower-deep`) |

---

## Refactoring opportunities (Round 2)

| ID | Item | Value |
|----|------|-------|
| R2-R-W01 | Shared search/filter module | `src/utils/plantSearch.ts` used by Catalog + Search |
| R2-R-W02 | `usePlantDetailState(slug, leadImage)` hook | Centralizes carousel reset logic |
| R2-R-W03 | `PlantImage` component with `onError` + placeholder | All img sites |
| R2-R-W04 | `prefers-reduced-motion` CSS pass | Single media-query block in `index.css` |
| R2-R-W05 | Per-country hero config in `countries.ts` | Decouple cover from array order |
| R2-R-W06 | Remove or complete `layoutId` shared transition | PlantCard + detail hero |

---

*Parent index: [`2026-07-06-FULL-AUDIT-INDEX.md`](./2026-07-06-FULL-AUDIT-INDEX.md)*