# Bug Journal — Ottor Mastar

Newest first. 5 lines max per entry: symptom / cause / fix / lesson + file:line.

## Patterns to scan for FIRST

- **AI-assembled plant/photo datasets: audit photo↔species assignment, not just captions.**
  In this repo 15 of 23 field photos depicted a DIFFERENT species than declared
  (clean reciprocal swaps + orphans), while all 23 botanical PLATES matched their
  declared species. Plate captions are cheap to verify (printed on the plate); the
  field photos are the weak link. Read the photo, ID the in-focus foreground plant,
  compare to the declared latin. See `docs/audits/2026-07-06-photo-species-audit.md`.
- **Full-screen media viewer: never reserve a big bottom pad for the caption.**
  Reserving `pb-40` under a contained image pushes it up and leaves a flat black
  void between image and caption ("looks unstyled"). Fix: keep the reserve small
  and make the blurred letterbox-fill bright enough (`opacity-60`) to read as an
  intentional soft backdrop, so negative space never looks like a void.

- **Tailwind v4 + a plain `* { margin:0; padding:0 }` reset = spacing dies app-wide.**
  Tailwind v4 puts utilities in `@layer utilities`; *unlayered* CSS beats any
  layered rule regardless of specificity. So a global reset silently overrides
  every `p-*`, `m-*`, `space-y-*`. Never zero margin/padding on `*` in a Tailwind
  v4 project — Preflight already handles element resets (in `@layer base`, so
  utilities can override). Keep only `box-sizing` if anything.
- **Data keyed by short lang codes (`en`/`ru`) + i18next language-detector = blank content.**
  The detector returns region codes (`en-US`). `t()` falls back fine, but any
  direct `data[i18n.language]` lookup is `undefined`. Normalize detection with
  `detection.convertDetectedLanguage: (l) => l.split('-')[0]`. `load:'languageOnly'`
  alone does NOT fix `i18n.language` (only which resource bundle loads).
- **Text over a photo hero:** a scrim that fades `to-cream` (or any light color)
  behind light text destroys contrast. Anchor the dark scrim at the text edge
  (`bg-gradient-to-t from-black/80 … to-transparent`).
- **Assets can be silent duplicates.** Before trusting a generated asset set,
  `md5` them — 6 of 23 "illustrations" were byte-for-byte copies of others.

## Patterns to scan for FIRST (native/Compose)

- **Compose `detectTransformGestures` eats ONE-finger drags too** — inside a
  Pager it silently kills horizontal paging. For pinch-zoom inside a pager,
  hand-roll `awaitEachGesture`: consume only multi-finger events, or single
  finger while zoomed (scale > 1); otherwise let the pager/dismiss gestures
  have the pointer. Same idea anywhere two gesture owners share a surface.

## Chronological log

### 2026-07-07 — Search results wasted desktop space (same pattern as catalog)
- Symptom: `/search` results were a single divided list in `max-w-2xl` — the same wasted-desktop-space pattern flagged for the catalog, applied proactively per the user's "use ALL space" principle.
- Fix: container `max-w-2xl` → `max-w-5xl`; results become the same responsive card grid (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`); the search input stays centered/comfortable (`max-w-2xl mx-auto`) as the page's focal point while results fan out to full width.
- Verify: browser — 3-col results @1280, input stays centered, no console errors.
- Lesson: the "reading-width for prose, wide grid for a browsable index" rule (below) is systematic — fix every index screen at once, don't wait to be shown each one.

### 2026-07-07 — Catalog wasted desktop space (single narrow column in a sea of empty)
- Symptom: `/catalog` was a single divided list locked to `max-w-3xl` (768px), so on a wide desktop the right ~half of the viewport was empty. User: "there is plenty of space, we must use all space super carefully."
- Fix: widened the container to `max-w-6xl` and made the entry list a responsive grid — `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3` — with each entry now a hairline-bordered card (`rounded-xl border border-hairline bg-card`, `h-full` so cards in a row align) instead of a divider row. Search capped at `max-w-3xl` so it doesn't stretch. Plate numbers still read in order across the grid.
- Verify: browser — 3 cols @1280, 2 @768, 1 @375, all 23 cards, no console errors; matches the UI rule "hairline borders, no card shadows."
- Lesson: a reading-width `max-w-3xl` is right for prose but wrong for a browsable index — an index wants a responsive grid at a wide container. Same wasted-desktop-space family as the image-viewer placard fix below; apply the check to every list/index screen, not just the one screenshotted.

### 2026-07-07 — Native viewer parity: Wikipedia action + wide-layout museum placard (iOS + Android)
- Change: brought the native viewers up to the new web viewer. Both platforms: added a Wikipedia action (compact = round icon button beside Details, mirroring web mobile; wide = a "Read on Wikipedia" row + language-matched domain). Wide layouts (iOS `horizontalSizeClass == .regular`; Android `BoxWithConstraints maxWidth >= 600.dp` — iPad landscape / large windows / foldables) now show the two-column museum placard: image region + metadata panel (kind / serif name / Latin / badges / Wikipedia / Details / counter), the top-bar counter moving into the panel.
- iOS: `ImageViewer.swift` — placard via HStack(pager, placardPanel); pager pinned `maxWidth:.infinity` so the TabView doesn't mis-size beside the fixed 360pt panel. Android: `ViewerScreen.kt` — pager gets `padding(end = panelWidth)` in wide mode and the `PlacardPanel` overlays `CenterEnd`; keeps the existing zoom/drag/pager gestures untouched.
- Verify: `xcodebuild` BUILD SUCCEEDED, `gradlew assembleDebug` BUILD SUCCESSFUL. NOTE: build-verified only — the wide/iPad placard was NOT device-screenshot-verified (headless UI-driving to the viewer screen is impractical here); the compact caption change is a minimal additive tweak to the already-working layout.
- Lesson: a per-form-factor layout (size class / BoxWithConstraints) is the native analog of a Tailwind `md:` breakpoint — restructure by constraining the existing image region (frame / end-padding) rather than rebuilding the pager+gesture stack in a second branch.

### 2026-07-07 — Image viewer wasted desktop space (portrait photo floating in blurred green)
- Symptom: on desktop the full-screen viewer fit a portrait photo to height with `object-contain`, leaving the image a tall sliver centered in a huge sea of blurred backdrop; the caption was a thin bottom overlay. Looked empty/unfinished on wide screens.
- Fix: redesigned `ImageViewer.tsx` as a responsive "museum placard" — desktop (md+) splits into an image region (`flex-1`) + a frosted metadata panel (`w-[340px] lg:w-[400px]`, kind overline / serif name / italic Latin / category badges / Wikipedia link / Details / plate counter); mobile keeps a refined bottom caption with a Wikipedia icon-button + Details pill. Added optional `href` to `ViewerItem`; wired `getWikipediaUrl` in GalleryGrid (+ `kind: photograph`) and PlantDetailPage. Nav arrows moved inside the image region so the right arrow sits at the image/panel boundary on desktop. Backdrop brightened (`opacity-70`, softer gradient).
- Verify: tsc+vite build; browser-verified desktop + mobile, Yakutia + Mongolia (mn overline "Гэрэл зураг", link → mn.wikipedia.org with the Mongolian name), zoom/double-tap intact, first-item hides the left arrow, detail-page viewer shows Wikipedia but no Details (no `onOpenDetail`), no console errors.
- Lesson: `object-contain` in a full-viewport box is the right call for the image but leaves wide screens empty for portrait media — put the freed horizontal space to work with a metadata panel instead of a bigger blurred backdrop. Keep the zoom/drag core untouched by nesting it in a `relative flex-1 min-h-0 min-w-0` region rather than restructuring it.

### 2026-07-07 — Per-country-language loose ends: hero, search, settings picker, Legal, iOS locales
- Symptom: 5 gaps left by the per-country-language work — (1) iOS bundled no locale-mn/zh so Mongolia mode showed raw keys; (2) home hero used `plants.last`/`.lastOrNull()`, an arbitrary plant, not the country's cover; (3) search haystacks omitted mn/zh names, so a Mongolia plant wasn't findable by its Mongolian/Chinese name; (4) web Settings language picker listed all 5 languages regardless of country; (5) web Legal rendered blank under mn/zh (content keyed sah/ru/en only).
- Fix: (1) added locale-mn/zh to ios/project.yml resources; (2) `heroSlug` now flows through export-native-data → native Country gained `heroSlug`+`heroPlant` helper (web already had getHeroPlant); home cover resolves the country's hero (Sardaana / marigold); (3) added `names.mn`/`names.zh` (optional, `?? ''`) to every search haystack (web plantSearch.ts, iOS Search/CatalogView, Android Search/CatalogScreen); (4) SettingsPage language Segmented maps over `COUNTRIES[country].languages`; (5) LegalPage clamps mn/zh → en at the top (one const), matching native's English-fallback policy for sensitive legal text.
- Verify: web tsc+vite build ✓, Android assembleDebug ✓, iOS BUILD SUCCEEDED ✓; browser-verified Mongolia mode — marigold hero, Мон/中/Eng-only pickers, Legal shows English not blank.
- Lesson: a per-country config field (heroSlug) is useless to native until it's added to the export shape too — the JSON bridge is the easy thing to forget. Optional mn/zh names must be `?? ''`-guarded in every haystack (Swift `[String]`, Kotlin `List<String>`), not just the base four.

### 2026-07-06 — All 11 Mongolia botanical plates depicted the wrong species
- Symptom: user reported illustrations linked to wrong images. Audit (labeled contact sheets, read each plate's printed Latin caption vs the assigned plant): Yakutia 23/23 correct; Mongolia 0/11 — every AI-generated Mongolia plate depicted an UNRELATED species (Salsola, Arnebia, Gentiana, Caragana, Rosularia, Stipa, Aconitum, a fern, Saussurea, Achnatherum, Caryopteris), none of which is even in the dataset. See docs/audits/2026-07-06-illustration-species-audit.md.
- Cause: the Mongolia plates were generic AI art with fabricated captions, assigned by imageId order — not species-matched. Not a re-ordering issue (no plate matched any plant).
- Fix: removed the 9 wrong plates (those plants → photo-only); reused the correct Yakutia plate for the 2 species shared with Yakutia (bedstraw Galium verum → mongolia-07-ill, yarrow Achillea → mongolia-10-ill); regenerated the manifest; export-native-data now cleans dest image roots so removed assets don't linger.
- Lesson: extends the top pattern — audit plate↔species by READING the plate's own caption, not trusting filename order. Also: an incremental asset-copy export must clean its destination, or deletions never propagate to bundles.

### 2026-07-06 — Wikipedia "Further reading" now targets the reader's own wiki incl. mn/zh
- Symptom: Mongolian/Chinese readers should reach mn/zh Wikipedia articles; the query strategy only special-cased Sakha.
- Fix: getWikipediaUrl (web + iOS + Android) uses the native plant name for sah/mn/zh (best for native-language articles) and the Latin binomial for ru/en; domain is always `<lang>.wikipedia.org`.
- Lesson: the link target language must follow i18n.language, and native-language wikis resolve better from the native name than from Latin.

### 2026-07-06 — Per-country languages: Mongolia in Mongolian + Chinese (all platforms)
- Feature: language sets are now per country — Yakutia keeps sah/ru/en (default sah); Mongolia offers mn/zh/en (default mn). Switching country moves the reader to that country's default if their language isn't offered; the switcher shows only the active country's languages; the plant names table lists the country's languages.
- Web: `Language` gained mn/zh (optional on LocalizedString + `loc()` en-fallback so no call-site churn); countries.ts carries `languages`+`defaultLanguage`; SettingsContext keeps language↔country coherent; new mn.json/zh.json; machine-assisted mn+zh for all 24 Mongolia plants in `mongolia-translations.ts` merged at build time.
- Native: mirrored — Language enum, nullable mn/zh with en fallback, per-country config in the exported JSON (added `languages`/`defaultLanguage` to export-native-data), clamped language getter + country-change switch, country-filtered picker, country-aware names table. Legal/About stat `when(lang)` became non-exhaustive → Legal falls back to English (sensitive text, not machine-translated); About stats use the (translated) locale keys.
- Lesson: adding a language to a Kotlin enum breaks every exhaustive `when(lang)` — grep them before/after. Keeping mn/zh OPTIONAL with an en fallback (not required) meant the base sah/ru/en data and Yakutia plants needed zero changes.

### 2026-07-06 — Multi-agent fix fleet: native integration seams (iOS + Android)
- Symptom: after the fix fleet, 2 of 16 agents (iOS-views, Android-core) died on server rate limits mid-edit, leaving native contract mismatches; neither platform compiled.
- Causes & fixes: (1) Android — G16 removed the `country` param from `ViewerOverlay` (SP2-H01: each `ViewerItem` now carries its own `country`), but the dead agent left `country = country` on the call site → `No parameter with name 'country'`; removed it. Also finished SP2-M09 (home-viewer `kindLabel = loc.t("plant.photograph")`, was null). (2) iOS — G14's SP2-M11 empty-viewer guard made `ImageViewer.item` optional but left `caption` referencing `item.kindLabel/title/...` unwrapped → wrapped `caption` in `if let item` (same pattern `backdrop` already used). Both platforms then built (`assembleDebug`, `xcodebuild`) and launched without crashing.
- Lesson: a cross-agent CONTRACT change (a shared type's signature) needs BOTH sides in the same agent or an explicit hand-off; when a fan-out agent dies mid-edit its file compiles but the contract is half-applied — the central platform build is the only thing that catches it.

### 2026-07-06 — Multi-agent fix fleet: central-verify integration seams (web)
- Symptom: after a 16-group parallel fix pass, web tsc/build failed and raw i18n keys would ship — cross-group seams the scoped agents couldn't see.
- Causes & fixes: (1) G2 consumers referenced 7 keys G1 never added (`about.stat*`, `notFound.home/catalog`, `settings.sectionLanguage/sectionCountry`) → added to all three locales (a missing key ships the raw string; fallbackLng='sah'). (2) G8 put a dup-slug assertion using `process.env.NODE_ENV` at module scope in `countries.ts`, which breaks the bare `tsc --module commonjs` transpile in gen-sitemap/export-native-data → moved it to an exported `assertUniqueSlugs()` called from `main.tsx` under `import.meta.env.DEV`, so the data module references neither `process` nor `import.meta`. (3) Header subtitle still hardcoded `t('app.subtitle')` (Header.tsx wasn't in any group's allowlist) → country-aware like the other consumers. (4) `check-locale-keys.cjs` failed on dead keys → downgraded to warning (missing=fail, dead=warn) so the gate reflects real severity.
- Lesson: disjoint-file fan-out leaves CROSS-FILE contracts (shared locale keys, a module consumed by both browser and CJS scripts, files no group owns) unverified — the central typecheck/build/locale-parity pass is mandatory and is where these surface. A data module shared with CJS scripts must never reference `process`/`import.meta`.

### 2026-07-06 — Phase 1 (R2 additions): leadImage carousel reset + OS reduce-motion CSS (R2-W-H01, R2-W-H02)
- Symptom: (a) flipping "Lead image" plate↔photo left the detail carousel on a stale index → wrong slide/dot/viewer asset; (b) plain CSS animations (shelf-nudge, swipe-drift, skeleton shimmer, smooth scroll) ran even when the OS "Reduce motion" preference was on but the in-app toggle was off.
- Cause: (a) the Phase-1 reset effect keyed on `[slug]` only, not `settings.leadImage`; (b) CSS motion was gated solely on `html[data-reduce-motion='true']` (in-app toggle) — framer's `MotionConfig reducedMotion="user"` covers JS motion only. `PlantDetailPage.tsx`, `src/index.css`.
- Fix: (a) effect deps → `[slug, settings.leadImage]` (moved `useSettings()` above it); (b) added `@media (prefers-reduced-motion: reduce)` mirroring the data-attr suppression. Verified in preview: detail renders post-reorder; media rule shipped; infinite animation collapses 1.5s→0.001ms under suppression.
- Lesson: reset index-into-list state on EVERY input that reorders the list, not just the id; and OS reduce-motion needs a CSS `@media` block — a JS/framer setting never reaches plain keyframes.

### 2026-07-06 — Phase 1 P0: invalid localStorage settings crashed the web app (WEB-C01/M12)
- Symptom: a tampered/legacy `om_settings_v1` with `country:"france"` (or garbage enums) → `COUNTRIES[id]` undefined → `usePlants()` throws → white screen.
- Cause: `loadSettings` only guarded `country` via `isCountryAvailable` (which itself throws on an unknown id) and validated no other field; `update()` wasn't validated at all. `src/context/SettingsContext.tsx`.
- Fix: `validateSettings()` clamps every field to its union/boolean and country to `COUNTRY_IDS` ∩ available; runs on load AND `update()`; `usePlants()` falls back to `DEFAULT_COUNTRY`. Verified in preview: tampered value → home renders, storage re-sanitised to defaults, 0 console errors.
- Lesson: persisted state is untrusted input — validate the whole schema per-field on read and on every write, and never index a lookup map with an unchecked key.

### 2026-07-06 — Phase 1: `tsc -b` failed so the build shipped type errors unchecked (WEB-H02/L02/L19, DATA-B02)
- Symptom: `npx tsc -b` failed (ImageViewer `onTransformed` not a prop; `main.tsx` couldn't resolve side-effect `./index.css`) yet Vite-only `npm run build` passed; `npm run lint` failed (`eslint: command not found`).
- Cause: wrong react-zoom-pan-pinch API name; no ambient decl for CSS imports; build never ran tsc; lint script referenced uninstalled eslint. `ImageViewer.tsx:146`, missing `src/vite-env.d.ts`, `package.json`.
- Fix: `onTransformed`→`onTransform` (correct v4 prop; params now contextually typed); added `src/vite-env.d.ts` (`/// <reference types="vite/client" />`); `build` → `tsc -b && vite build`; added `typecheck` script; `lint` → `oxlint src scripts`. All three gates now green.
- Lesson: a green Vite build is not a typecheck — gate build on `tsc -b`, keep one `vite/client` ref so CSS/asset side-effect imports resolve.

### 2026-07-06 — Phase 1: gallery viewer / detail carousel kept stale index state (WEB-C02/H01)
- Symptom: viewer `selectedIndex` could point past a shorter list after a collection change (stuck invisible overlay); plant→plant nav could inherit the prior slide / open viewer.
- Cause: `selectedIndex` not reset when `plants` changes; detail state relied on the route animation wrapper remounting rather than a local reset. `GalleryGrid.tsx`, `PlantDetailPage.tsx`.
- Fix: `useEffect([plants]) → setSelectedIndex(null)`; `useEffect([slug])` resets slide/viewer/scroll locally. Verified the viewer opens and STAYS open — `plants` is a stable per-country ref so the effect only fires on a real change.
- Lesson: reset index-into-list state when the list changes, and make route-param resets local — don't couple correctness to a distant animation `key`.

### 2026-07-06 — Touch-UX sweep: double-tap pushed detail twice; sub-44dp targets
- Symptom: double-clicking a catalog row (mouse habit on emulator) stacked two identical detail screens — Back seemed broken; settings toggle (26dp), (?) tip (16dp) were fiddly to hit.
- Cause: `nav.navigate` without `launchSingleTop`; visual-size == hit-size on custom controls. `android/.../MainActivity.kt`, `SettingsScreen.kt`, `DetailScreen.kt` (+ iOS mirrors).
- Fix: `launchSingleTop` on every route; 44–48dp touch targets around small visuals (both platforms); real density in the sheet-offset px math.
- Lesson: every nav call gets launchSingleTop by default; small glyphs NEVER define their own hit area.

### 2026-07-06 — Android viewer: couldn't swipe between images
- Symptom: horizontal swipes in the full-screen viewer barely/never paged; felt broken.
- Cause: `detectTransformGestures` on each zoomable page consumes single-finger pans, starving HorizontalPager. `android/.../ViewerScreen.kt`.
- Fix: custom `awaitEachGesture` (consume multi-finger, or 1-finger only when zoomed) + clamped pan; detail pager taps via `detectTapGestures` (no clickable press-delay) + `beyondViewportPageCount = 1`.
- Lesson: see "detectTransformGestures eats one-finger drags" pattern above.

### 2026-07-06 — Native apps rendered raw key "gallery.photoCount" in headers
- Symptom: photo-wall header showed the literal key instead of "23 photos" (both native apps).
- Cause: hand-rolled i18next-style `plural()` fell back `key_one → key` but never tried the bare `table[key]` — and `gallery.photoCount` is an un-suffixed single-form key. `android/.../L10n.kt`, `ios/.../L10n.swift`.
- Fix: fallback chain now ends `…?? table[key] ?? key`.
- Lesson: when re-implementing i18next lookups, remember plural keys come in BOTH suffixed and bare forms — test one of each.

### 2026-07-06 — iOS app install failed: "Missing bundle ID" despite valid Info.plist
- Symptom: `simctl install` rejected the built .app; Info.plist had a correct CFBundleIdentifier.
- Cause: XcodeGen folder-reference at `OttorMastar/Resources` put a directory literally named `Resources` in the .app — iOS then treats the bundle as a macOS-style deep bundle. `ios/project.yml`.
- Fix: reference `Resources/PlantImages` as the blue folder + list the JSONs individually, so no top-level `Resources/` dir lands in the bundle.
- Lesson: never ship a folder named `Resources` (or `Contents`) inside an iOS .app.

### 2026-07-06 — Android home header stayed "Plants of Yakutia" on the Mongolia collection
- Symptom: switching country to Mongolia kept the Yakutia title/description on Home (both native apps).
- Cause: cover hardcoded `app.subtitle`/`app.description`, which are Yakutia-specific copy. `android/.../HomeScreen.kt`, `ios/.../HomeView.swift`.
- Fix: non-default countries title themselves via `settings.country_<id>`; description shows only for Yakutia.
- Lesson: any copy written for the default collection must be gated on `country.id`, not reused globally.

### 2026-07-06 — Plant detail page opened already scrolled past its hero image
- Symptom: tapping a plant from a scrolled list opened the detail page mid-scroll (names section), hero image + back button overlapping the title; read as "must scroll up to see the image".
- Cause: no scroll reset on route change — react-router keeps the window scroll position across navigations. `src/App.tsx`.
- Fix: `<ScrollToTop/>` (useLocation + `window.scrollTo(0,0)` on pathname change) mounted inside the Router.
- Lesson: an SPA needs an explicit scroll-restoration reset; a page "opening scrolled" is almost never the page's own layout — it's inherited scroll. Fix the cause, don't add a "scroll up" hint.

### 2026-07-06 — Botanical-plate thumbnails looked tiny/floaty ("unfinished")
- Symptom: plate thumbs in the home shelf + catalog showed a small drawing marooned in a big parchment margin.
- Cause: plate scans are square with a wide aged-paper border baked in; plain `object-cover` on a square tile shows the whole thing, margins and all. `src/index.css .plate-thumb`.
- Fix: `.plate-thumb { object-fit: cover; scale: 1.34; transform-origin: center 38% }` — zoom into the figure, bias up so the printed caption falls away. Used the CSS `scale` property (not `transform`) so Tailwind v4 `scale-*` hover overrides cleanly instead of stacking.
- Lesson: Tailwind v4 `scale-*` sets the CSS `scale` property, independent of `transform` — mixing the two multiplies. Pick one channel.

### 2026-07-06 — Sakha blooming season rendered raw key ("seasons.june-july")
- Symptom: detail page in Sakha showed the literal string `seasons.june-july` under СИБЭККИЛЭНЭР КЭМЭ.
- Cause: in `sah.json` the `seasons` block was nested inside `plant` (en/ru have it top-level) AND lacked the 5 month-range keys the data uses; `fallbackLng: 'sah'` so no fallback.
- Fix: moved `seasons` to top level in `sah.json` with all 8 keys (Sakha month names: Бэс ыйа, От ыйа…).
- Lesson: the key-coverage grep missed this because the call site is dynamic — `t(\`seasons.${plant.bloomingSeason}\`)`. Coverage checks must also enumerate data-driven key values, not just literal `t('…')` strings.

### 2026-07-06 — Sakha UI showed literal i18n keys ("PLANT.NAMES", "APP.SUBTITLE")
- Symptom: in Sakha, the detail-page section header rendered "PLANT.NAMES", the header/hero showed "APP.SUBTITLE", etc.
- Cause: the Sakha translation pass restructured `sah.json` and dropped 6 keys still referenced in code (`app.subtitle`, `plant.names`, `plant.backToGallery`, `common.legal`, `common.readDisclaimer`, `about.intro`); `fallbackLng` is `sah`, so a missing Sakha key can't fall back to en.
- Fix: restored the 6 keys in `sah.json`. Added a coverage check (grep every `t('key')` vs all three locale JSONs) — now 0 gaps.
- Lesson: after any locale edit, diff the key SET across locales, don't just eyeball. A missing key with same-lang fallback ships the raw key to users.

### 2026-07-06 — photo audit resolution: 11 more photos corrected (19/23 match)
- Symptom: after the first 2 swaps, 11 entries still showed the wrong species.
- Cause: photos were shuffled — one clean pair (03↔04), one clean 4-chain (18→16→15→13), one one-way fix (14→20); the rest are orphans.
- Fix: `scripts/rotate-photos.cjs` (new, for the cycle) + `swap-photos.cjs`. Each corrected photo re-verified by eye before committing. `docs/audits/2026-07-06-photo-species-audit.md` §7.
- Lesson: model a photo-shuffle as a permutation — clean cycles are safe to auto-fix; open chains end in orphans that need real re-shooting, don't force them.

### 2026-07-06 — 15/23 field photos show the wrong species (photo↔species audit)
- Symptom: on detail pages the botanical plate and the field photo often show different plants (e.g. Filipendula plate + a vetch photo); user: "some seem like different ones."
- Cause: field photos were assigned to species carelessly; plates were fine. Two clean reciprocal swaps (plant-10↔11 Filipendula/Vicia, plant-21↔22 Valeriana/Geranium) plus ~11 orphan mismatches with no correct photo in the set.
- Fix: `scripts/swap-photos.cjs plant-10 plant-11` and `plant-21 plant-22` (swaps thumb/medium/full webp + IMAGE_MAP provenance; leaves the correct `-ill` plates untouched). Rest logged for re-sourcing in the audit report.
- Lesson: see top pattern — audit photo↔species, not just plate captions. Full findings: `docs/audits/2026-07-06-photo-species-audit.md`.

### 2026-07-06 — Image viewer caption looked unstyled (black void above it)
- Symptom: full-screen viewer showed the photo up top, a large flat-black gap, then the caption pinned to the bottom — "looks like no styling at all."
- Cause: the fit box reserved `pb-40 sm:pb-32` for the caption, pushing a contained image up; the blurred letterbox-fill was too dark (`opacity-40` + `/40` overlay) to fill the gap, so it read as black void. `src/components/common/ImageViewer.tsx`.
- Fix: reserve shrunk to `pb-24`, blurred fill brightened to `opacity-60` with a bottom-weighted scrim; caption tightened into a cohesive panel.
- Lesson: see top pattern — bright blurred fill, small reserve; negative space must read as intentional backdrop.

### 2026-07-06 — Catalog/Search/About unreachable on desktop; header search button dead
- Symptom: at ≥640px the bottom tab bar is hidden and the header had no nav links; its search icon button had no onClick/href — desktop users could only browse the gallery.
- Cause: nav lived only in mobile BottomNav (`sm:hidden`); Header shipped a decorative `<button>` with no handler. `src/components/Layout/Header.tsx`.
- Fix: desktop NavLink row in Header (`hidden md:flex`), dead button removed; BottomNav/page paddings moved `sm:` → `md:` so the handoff has no gap. `src/components/Layout/Header.tsx:64`.
- Lesson: every route must be reachable at every breakpoint — audit nav per breakpoint, and a button with no handler is a bug, not a placeholder.

### 2026-07-05 — `vite build` fails with EPERM copying public/images/*.jpeg
- Symptom: `Error: EPERM: operation not permitted, copyfile public/images/WhatsApp*.jpeg -> dist/...`; `xattr -c` also denied.
- Cause: the large WhatsApp source originals in `public/` carry an iCloud provenance xattr (Documents is synced) that blocks `copyFileSync`; vite copies all of publicDir into the build. They're unused at runtime (app serves `/plants/*.webp`).
- Fix: moved originals to `_src_originals/whatsapp/` (out of publicDir); updated `scripts/optimize-images.cjs` INPUT_DIR to match. `scripts/optimize-images.cjs:31`.
- Lesson: keep large source assets OUT of `public/` — publicDir is copied verbatim into every build. Only optimized runtime assets belong there.

### 2026-07-05 — Tailwind padding/margin utilities all no-op (app-wide cramped layout)
- Symptom: content touches screen edges everywhere; `p-6` card, `pb-20`, `px-4` compute to `0px`; `.badge` (plain CSS) keeps its padding.
- Cause: `* { margin:0; padding:0 }` reset in `src/index.css` (unlayered) overrides Tailwind v4 utilities (in `@layer utilities`).
- Fix: reset only `box-sizing` on `*`; drop the margin/padding zeroing. `src/index.css:69`.
- Lesson: see top pattern. This was THE "serious styling problem", not any single component.

### 2026-07-05 — Plant name/description/medicinal/habitat render blank
- Symptom: detail & catalog pages show empty `<h1>` and empty sections; only the trilingual NAMES block + Latin survive.
- Cause: browser reports `en-US`; data keyed `en`/`ru`/`sah`; `plant.x[i18n.language]` → `undefined`. `src/i18n/index.ts`.
- Fix: `detection.convertDetectedLanguage: (l) => l.split('-')[0]` + `supportedLngs`/`load:'languageOnly'`. `src/i18n/index.ts:28`.
- Lesson: see top pattern. AboutPage had hacked around it by deriving lang from the translated title — simplified back to `i18n.language`.

### 2026-07-05 — 6 botanical illustrations are wrong (duplicates)
- Symptom: Sardaana (Lilium) detail showed a *Veronica* plate; 6 plants mismatched.
- Cause: only 17 unique plates were ever generated; `plant-18..23-ill.webp` were byte-copies of `01..06` (no source in `public/images/illustrations`).
- Fix: removed `illustrationId` from plants 18–23; deleted the 18 dup webp files; those plants are photo-only. `src/data/plants.ts`.
- Lesson: `md5` an asset set before trusting it; gate rendering on a real per-item flag (`hasIllustration`), not "the field is set".

### 2026-07-05 — Illustrations existed but were hidden / hero text illegible / bad detail layout
- Symptom: 17 good plates only visible as an undiscovered 2nd swipe-slide; home hero tagline invisible; detail page = detached card floating over a washed-out hero.
- Cause: detail hero led with the photo (plate buried); hero scrim faded `to-cream` behind white text; single-column card-over-hero read poorly.
- Fix: detail page rebuilt as a two-column split (`md:` up) — info left / image right, full-height; stacked (image top, info sheet) on mobile. Plate = primary image via `getIllustrationPath`; gallery markers via `hasIllustration`; dark bottom scrim on home. `PlantDetailPage.tsx`, `HomePage.tsx:26`, `PlantCard.tsx`.
- Lesson: after editing, the Vite/Tailwind DEV server serves stale CSS for NEWLY-USED utility classes (HMR quirk); the production build (`npm run build` + `vite preview`) is authoritative — verify layout there, not on a hot-reloaded dev server. Also: preview tool's native window is ~666px, so `lg:`(1024) two-column can't be screenshotted faithfully — `md:`(768) can.
