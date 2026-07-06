# Bug Journal — Ottor Mastar

Newest first. 5 lines max per entry: symptom / cause / fix / lesson + file:line.

## Patterns to scan for FIRST

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

## Chronological log

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
