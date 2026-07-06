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
