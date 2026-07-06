# Web Frontend Audit — Bugs & Refactoring

**Scope:** `src/` (24 `.ts`/`.tsx` files), `index.html`, `vite.config.ts`  
**Date:** 2026-07-06  
**Total findings:** 48 (2 critical, 7 high, 21 medium, 18 low)

---

## Critical

### WEB-C01 — Invalid `country` in localStorage crashes the app

| Field | Value |
|-------|-------|
| **File** | `src/context/SettingsContext.tsx` |
| **Lines** | 44–55, 110–112 |
| **Category** | bug / type-safety |
| **Symptom** | White screen or runtime error on load |
| **Cause** | `loadSettings()` merges JSON from localStorage but never validates `country` against `CountryId`. A tampered value like `"france"` makes `COUNTRIES[id]` undefined; `usePlants()` then accesses `.plants` on undefined. |
| **Fix** | Validate `country` against `COUNTRY_IDS` after parse; fall back to `DEFAULT_COUNTRY`. Apply same guard in `update()` when country is set programmatically. |

### WEB-C02 — Image viewer stuck with no UI when index out of bounds

| Field | Value |
|-------|-------|
| **Files** | `src/components/Gallery/GalleryGrid.tsx`, `src/components/common/ImageViewer.tsx` |
| **Lines** | GalleryGrid 19, 52–64; ImageViewer 44, 101 |
| **Category** | bug / state management |
| **Symptom** | User switches country in Settings while viewer is open; new plant list is shorter; overlay disappears but parent still holds `selectedIndex !== null` — no way to close, no image shown. |
| **Cause** | `selectedIndex` not reset when `plants` changes. `items[index]` becomes `undefined`; `ImageViewer` returns `null`. |
| **Fix** | `useEffect` to reset/clamp `selectedIndex` when `plants` changes; close viewer if index invalid. Same guard for `viewerIndex` in `PlantDetailPage`. |

---

## High

### WEB-H01 — Plant detail state persists across slug changes

| **File** | `src/pages/PlantDetailPage.tsx:24-26, 30, 310-318` |
| **Category** | bug / routing |
| **Symptom** | Navigating `/plant/yarrow` → `/plant/flax` shows wrong carousel slide, wrong pagination dot, or stale open viewer. |
| **Cause** | React Router reuses component instance when only `:slug` changes; `activeSlide`, `viewerIndex`, scroll position not reset. |
| **Fix** | `useEffect` on `[slug]` to reset state + scroll, or `key={slug}` on route element. |

### WEB-H02 — Wrong zoom library API (`onTransformed` vs `onTransform`)

| **File** | `src/components/common/ImageViewer.tsx:146` |
| **Category** | type-safety / bug |
| **Symptom** | `tsc -b` fails; `zoomed` state may never update → swipe-to-dismiss vs pan behavior broken. |
| **Cause** | `TransformWrapper` uses `onTransformed` which does not exist in `react-zoom-pan-pinch` v4 types. |
| **Fix** | Replace with `onTransform`; type callback parameters. Confirmed: `npx tsc -b` reports this error. |

### WEB-H03 — No catch-all / 404 route

| **File** | `src/App.tsx:59-67` |
| **Category** | routing |
| **Symptom** | `/foo`, `/plant`, `/catalog/extra` render empty `<main>` with header/nav still visible. |
| **Fix** | Add `<Route path="*" element={<NotFoundPage />} />` with localized message. |

### WEB-H04 — Image viewer lacks modal accessibility

| **File** | `src/components/common/ImageViewer.tsx:103-249` |
| **Category** | a11y |
| **Symptom** | Keyboard users tab to content behind overlay; screen readers don't announce dialog. |
| **Fix** | `role="dialog"`, `aria-modal="true"`, focus trap, initial focus on close button, restore focus on close. |

### WEB-H05 — Gallery tiles not keyboard-accessible

| **File** | `src/components/Gallery/PlantCard.tsx:23-31` |
| **Category** | a11y |
| **Symptom** | `motion.div` with `onClick` only — no `role`, `tabIndex`, or `onKeyDown`. Unreachable when `tileTap === 'viewer'`. |
| **Fix** | Use `<button type="button">` or add button semantics + Enter/Space handlers. |

### WEB-H06 — Plant-not-found uses wrong copy

| **File** | `src/pages/PlantDetailPage.tsx:32-37` |
| **Category** | bug / i18n |
| **Symptom** | Invalid slug shows `catalog.noResults` ("No plants found") — implies search failure. Header hidden; only bottom nav remains. |
| **Fix** | Dedicated `plant.notFound` keys; links to `/catalog` and `/`. Handle `slug === undefined`. |

### WEB-H07 — `i18n.language` unsafely cast to `Language`

| **Files** | `HomePage.tsx:13`, `CatalogPage.tsx:36`, `SearchPage.tsx:12`, `PlantDetailPage.tsx:21`, `GalleryGrid.tsx:17`, etc. |
| **Category** | type-safety / i18n |
| **Symptom** | `plant.names[lang]` → `undefined` → blank titles, descriptions, alt text if language ever outside `'sah'|'ru'|'en'`. |
| **Fix** | Central `getAppLanguage(i18n.language): Language` with fallback to `'sah'`. |

---

## Medium

### WEB-M01 — Country switch does not update region-specific UI copy

| **Files** | `src/i18n/locales/*.json`, `src/pages/AboutPage.tsx`, `src/App.tsx`, `src/components/Layout/Footer.tsx` |
| **Symptom** | Mongolia users still see "Plants of Yakutia" in header metadata, About, footer. |
| **Fix** | Region-aware strings (`app.subtitle_mongolia`) or interpolate from `settings.country`. Update `document.title` / OG tags. |
| **Note** | Same root cause as native bug NAT-H03 — fix all platforms together. |

### WEB-M02 — Legal page bypasses i18n system

| **File** | `src/pages/LegalPage.tsx:9-89, 124-147` |
| **Symptom** | Large inline trilingual objects; not in locale JSON; native apps can't get Legal strings from export pipeline. |
| **Fix** | Move to `src/i18n/locales/*.json` or dedicated legal namespace. |

### WEB-M03 — About page stats partially hardcoded

| **File** | `src/pages/AboutPage.tsx:18-43, 66-74` |
| **Symptom** | Stat labels inline; language count hardcoded `'3'`; fragile React keys (`value + label.en`). |
| **Fix** | Move labels to i18n; derive language count from `LANGUAGES.length`; stable `id` keys. |

### WEB-M04 — Empty plant collection crashes HomePage

| **File** | `src/pages/HomePage.tsx:20-22, 39-50` |
| **Symptom** | `HERO_PLANT = plants[plants.length - 1]` throws when `plants.length === 0`. |
| **Fix** | Guard with empty-state UI; enforce invariant at settings load. |

### WEB-M05 — Search inputs lack accessible labels

| **Files** | `src/pages/CatalogPage.tsx:85-99`, `src/pages/SearchPage.tsx:36-51` |
| **Fix** | Visually hidden `<label htmlFor>` or `aria-label`. |

### WEB-M06 — `autoFocus` on Search page

| **File** | `src/pages/SearchPage.tsx:41` |
| **Fix** | Remove or gate behind preference / desktop-only. |

### WEB-M07 — Carousel pagination dots not interactive

| **File** | `src/pages/PlantDetailPage.tsx:181-189` |
| **Fix** | Tabbable buttons with `aria-label`, `aria-current`, or `aria-live` region. |

### WEB-M08 — Desktop back button missing `type="button"`

| **File** | `src/pages/PlantDetailPage.tsx:209-219` |

### WEB-M09 — `navigate(-1)` unreliable for deep-linked users

| **File** | `src/pages/PlantDetailPage.tsx:116, 210` |
| **Fix** | Fall back to `/catalog` or `/` when `history.state.idx === 0`. |

### WEB-M10 — Suspense fallback is `null`

| **Files** | `src/App.tsx:52`, `PlantDetailPage.tsx:311`, `GalleryGrid.tsx:53` |
| **Fix** | Skeleton/spinner with `role="status"` using existing `common.loading` key. |

### WEB-M11 — Per-route Open Graph metadata incomplete

| **Files** | `src/App.tsx:79-92`, `index.html:15-26` |
| **Symptom** | Shared plant URLs won't preview plant name/image on social media. |
| **Fix** | On plant detail, set `og:title`, `og:image`, `og:url` dynamically. |

### WEB-M12 — Settings schema not fully validated on load

| **File** | `src/context/SettingsContext.tsx:44-55` |
| **Fix** | Validate `textSize`, `catalogSort`, `leadImage`, `tileTap` against allowed unions. |

### WEB-M13 — `Segmented` controls allow invalid enum writes

| **File** | `src/pages/SettingsPage.tsx:200-208, 229-264` |
| **Fix** | Narrow `onChange` per setting key. |

### WEB-M14 — InfoTip tooltip not associated with trigger

| **File** | `src/pages/PlantDetailPage.tsx:338-381` |
| **Fix** | `aria-describedby`; close on Escape. |

### WEB-M15 — Language switcher missing pressed state

| **File** | `src/components/common/LanguageSwitcher.tsx:10-18` |
| **Fix** | `aria-pressed={i18n.language === lang.code}`. |

### WEB-M16 — Category filter chips missing toggle semantics

| **File** | `src/pages/CatalogPage.tsx:105-118` |
| **Fix** | `aria-pressed={activeCategory === key}`. |

### WEB-M17 — English `photoCount` pluralization wrong

| **Files** | `src/i18n/locales/en.json:16`, `src/pages/HomePage.tsx:79, 157` |
| **Symptom** | "1 photos" instead of "1 photo". |
| **Fix** | Add `photoCount_one` / `photoCount_other`. |

### WEB-M18 — Russian `plateCount_other` missing

| **Files** | `src/i18n/locales/ru.json:21-23`, `HomePage.tsx:78, 102` |
| **Symptom** | Counts like 5, 9, 11 may show raw key. |

### WEB-M19 — Sakha `plateCount` lacks plural rules

| **File** | `src/i18n/locales/sah.json:21` |

### WEB-M20 — `animate().then(onClose)` may run after unmount

| **File** | `src/components/common/ImageViewer.tsx:65-76` |
| **Fix** | Mounted ref; cancel on unmount. |

### WEB-M21 — `useEffect` depends on unstable `t` reference

| **File** | `src/App.tsx:79-92` |
| **Fix** | Depend only on `i18n.language`. |

---

## Low

| ID | File | Issue |
|----|------|-------|
| WEB-L01 | `src/main.tsx:7-14` | Silent failure if `#root` missing |
| WEB-L02 | `src/main.tsx:3` | `tsc` can't resolve `./index.css` side-effect import |
| WEB-L03 | `src/App.tsx:7` | Large initial bundle (~489 KB / 154 KB gzip); HomePage eager |
| WEB-L04 | `src/components/Gallery/GalleryGrid.tsx:22-31` | Prebuilds full-res paths for all plants upfront |
| WEB-L05 | `src/pages/SearchPage.tsx:70` | Uncapped stagger animation delay |
| WEB-L06 | `src/components/Layout/Header.tsx:20-33` | Scroll listener active when header hidden on plant detail |
| WEB-L07 | `src/pages/SettingsPage.tsx:30-104` | `buildSections()` recreated every render |
| WEB-L08 | `src/data/plants.ts:752-806` | Dead helpers: `getPlantBySlug` (Yakutia-only), `getOriginalImagePath`, `SEASONS` |
| WEB-L09 | `src/data/mongolia.ts:15-17` | Stale comment says no Mongolia plates (11 exist) |
| WEB-L10 | `src/main.tsx`, `src/App.tsx` | No global error boundary |
| WEB-L11 | Image components | No `onError` fallbacks for missing assets |
| WEB-L12 | `vite.config.ts:6-11` | No `base` path for subdirectory deploys |
| WEB-L13 | `src/i18n/index.ts:31-33` | `interpolation.escapeValue: false` — XSS risk if translations become dynamic |
| WEB-L14 | `src/pages/LegalPage.tsx:59-65` | Privacy claims no external requests; Wikipedia links exist |
| WEB-L15 | `src/pages/PlantDetailPage.tsx:4,7` | Duplicate `framer-motion` imports |
| WEB-L16 | `src/pages/SettingsPage.tsx`, `SettingsContext.tsx` | Reset doesn't reset i18n language |
| WEB-L17 | `src/App.tsx`, `Header.tsx` | No skip-navigation link |
| WEB-L18 | `src/data/countries.ts:37-42` | No runtime assertion for duplicate slugs across countries |
| WEB-L19 | `package.json:6-12` | No `typecheck` script; build doesn't run `tsc` |

---

## Web refactoring opportunities

### R-W01 — Safe language helper (High value)

Extract `getAppLanguage()` used by all pages instead of `as Language` casts. Single file: `src/i18n/language.ts`.

### R-W02 — Settings validation module (High value)

`validateSettings(parsed: unknown): Settings` — used by `loadSettings()` and `update()`. Prevents WEB-C01 and WEB-M12.

### R-W03 — Country-aware copy system (High value)

Pattern: `t(\`app.subtitle_${country.id}\`)` with fallback to Yakutia. Touch: `App.tsx`, `HomePage`, `AboutPage`, `Footer`, locale JSONs.

### R-W04 — Lazy-load HomePage (Medium)

Reduce initial bundle; mirror other routes in `App.tsx`.

### R-W05 — Consolidate legal copy into i18n (Medium)

Enables native parity via `export-native-data.cjs`.

### R-W06 — Error boundary + empty states (Medium)

Wrap `<App />`; guard `HomePage` empty plants; `PlantDetailPage` not-found.

### R-W07 — Image error placeholder component (Low)

Shared `<PlantImage>` with `onError` → parchment placeholder.

### R-W08 — Route-level metadata hook (Low)

`usePageMeta({ title, description, ogImage })` for plant detail SEO.

### R-W09 — Hoist SettingsPage sections (Low)

`SECTIONS` constant outside component.

### R-W10 — Remove dead data exports (Low)

`SEASONS`, `getPlantBySlug`, `getOriginalImagePath`, `IMAGE_MAP` in plants.ts.

### R-W11 — Add `typecheck` to build (High value)

`"build": "tsc -b && vite build"` + CSS module declaration for `index.css`.

### R-W12 — Replace eslint with oxlint in package.json (Quick win)

`"lint": "oxlint src"` — oxlint already in devDependencies.

---

## Component dependency map

```text
main.tsx
└── App.tsx
    ├── SettingsProvider (SettingsContext.tsx)
    ├── ScrollToTop
    ├── Header.tsx
    ├── Routes
    │   ├── HomePage.tsx → GalleryGrid.tsx → PlantCard.tsx, ImageViewer.tsx
    │   ├── CatalogPage.tsx → GalleryGrid.tsx
    │   ├── SearchPage.tsx → PlantCard.tsx
    │   ├── PlantDetailPage.tsx → ImageViewer.tsx
    │   ├── AboutPage.tsx
    │   ├── LegalPage.tsx
    │   └── SettingsPage.tsx
    ├── Footer.tsx
    └── BottomNav.tsx

Data: countries.ts → plants.ts + mongolia.ts
i18n: index.ts → locales/{en,ru,sah}.json
```

---

*See also: [`2026-07-06-FULL-AUDIT-INDEX.md`](./2026-07-06-FULL-AUDIT-INDEX.md)*