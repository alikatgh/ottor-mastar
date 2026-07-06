# Ottor Mastar (Оттор Мастар) 🌿

> A digital encyclopedia of Yakutian flora. Built for speed, beauty, and multilingual accessibility.

**Ottor Mastar** ("Forest Trees/Plants" in Yakut) is a modern, highly optimized web application cataloging the plants of the Sakha Republic (Yakutia). It features a native iOS-like gallery experience, vintage botanical illustrations, and full trilingual support (Yakut, Russian, English).

![Ottor Mastar Preview](./public/favicon.svg)

---

## 🚀 Tech Stack

- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + Vanilla CSS Variables
- **Animations:** Framer Motion
- **Internationalization:** `react-i18next`
- **Routing:** React Router v7
- **Image Processing:** Sharp (Node.js)

## 📦 Project Structure

```text
ottor_mastar/
├── _src_originals/        # Raw source art (git-ignored, never bundled)
│   ├── illustrations/     # Botanical-plate sources (plant-NN-ill.png/jpg)
│   └── mongolia/          # Mongolia field-photo camera originals
├── public/
│   ├── _redirects         # Cloudflare Pages SPA configuration
│   ├── plants/            # Auto-generated Yakutia WebP (thumb/medium/full)
│   ├── mongolia/          # Auto-generated Mongolia WebP (thumb/medium/full)
│   ├── fonts/             # Self-hosted fonts (no third-party requests)
│   ├── sitemap.xml        # Auto-generated (npm run data:sitemap / prebuild)
│   └── robots.txt
├── scripts/               # Node build/data scripts (see "Scripts" below)
├── src/
│   ├── components/        # Reusable React components (Gallery, Layout, Common)
│   ├── data/              # countries.ts registry + plants.ts / mongolia.ts
│   ├── i18n/              # Translation files (sah.json, ru.json, en.json)
│   ├── pages/             # Route components (HomePage, CatalogPage, etc.)
│   └── types/             # TypeScript definitions
├── ios/                   # Native iOS app (SwiftUI)
├── android/               # Native Android app (Jetpack Compose)
├── shared/                # Generated native data snapshot (git-ignored)
└── index.html
```

Field-photo and illustration **sources live in `_src_originals/`**, outside
`public/` so the large originals are never copied into the build. The optimize
scripts read from there and emit optimized WebP into `public/plants/` and
`public/mongolia/`.

## 🛠 Setup & Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

3. **Build for production:**
   ```bash
   npm run build
   ```

## 🖼 Image Pipeline

To achieve native-app performance, all images are served as heavily optimized
`WebP` files in three sizes: `thumb` (400px), `medium` (800px), and `full`
(1600px). Sources live in `_src_originals/`; the optimize scripts read them and
emit WebP into the auto-generated `public/plants/` (Yakutia) and
`public/mongolia/` (Mongolia) directories.

```bash
# Yakutia photos + illustrations + illustration manifest
npm run optimize

# Just the botanical-plate illustrations (+ manifest)
npm run optimize:illustrations

# Just the Mongolia field photos
npm run optimize:mongolia

# Everything: Yakutia photos, illustrations, Mongolia, and the manifest
npm run optimize:all
```

**Do not manually add files to `public/plants/` or `public/mongolia/`** — they
are auto-generated. A plant's botanical plate lights up automatically once its
`plant-NN-ill` source is optimized: `gen-illustration-manifest.cjs` writes
`src/data/available-illustrations.ts` from the plates that actually exist, so
the data never needs hand-editing.

## 🧰 Scripts

Run via `npm run <name>` where a shortcut exists, otherwise
`node scripts/<file>`.

| Script | Purpose |
|--------|---------|
| `optimize-images.cjs` | Optimize Yakutia field photos → WebP (`npm run optimize`) |
| `optimize-illustrations.cjs` | Optimize botanical plates → WebP |
| `optimize-mongolia.cjs` | Optimize Mongolia field photos → WebP (`npm run optimize:mongolia`) |
| `gen-illustration-manifest.cjs` | Regenerate `src/data/available-illustrations.ts` |
| `gen-sitemap.cjs` | Write `public/sitemap.xml` from all routes + every country's slugs (`npm run data:sitemap`; runs on `prebuild`) |
| `export-native-data.cjs` | Export the dataset + locales + images for the native apps (`npm run data:export`) |
| `gen-icons.cjs` | Generate social + PWA/app icons |
| `fetch-fonts.cjs` | Self-host the app fonts (no third-party font requests) |
| `rotate-photos.cjs` / `swap-photos.cjs` | One-off photo↔species reconciliation helpers |

Handy npm shortcuts: `optimize`, `optimize:illustrations`, `optimize:mongolia`,
`optimize:all`, `data:sitemap`, `data:export`. `prebuild` regenerates the
sitemap automatically before every `npm run build`.

## 📝 Adding New Plants

Each country is a self-contained collection in `src/data/` wired together by
the `COUNTRIES` registry in `src/data/countries.ts`. Yakutia lives in
`plants.ts`, Mongolia in `mongolia.ts`. Slugs must stay **unique across all
countries** (a dev-time guard throws on collisions).

To add a new plant to the encyclopedia:

1. **Add the source photo:** Drop the original into `_src_originals/` — the
   `IMAGE_MAP` in the matching optimize script (`optimize-images.cjs` for
   Yakutia, `optimize-mongolia.cjs` for Mongolia) links a new `plant-NN` /
   `mongolia-NN` `imageId` to your exact filename. For a botanical plate, add a
   `plant-NN-ill` source under `_src_originals/illustrations/`.
2. **Add the data:** Add the plant object to the `plants` array in the
   country's dataset (`src/data/plants.ts` or `src/data/mongolia.ts`). Populate
   every trilingual field (`names`, `description`, `medicinalUses`, `habitat`).
3. **Optimize the images:** `npm run optimize` (Yakutia) or
   `npm run optimize:mongolia`. This regenerates the WebP variants and, for
   plates, the illustration manifest.
4. **Refresh the native snapshot:** `npm run data:export` so the iOS/Android
   apps pick up the new plant and its images.

The sitemap regenerates on every build (`prebuild`), or on demand with
`npm run data:sitemap`.

## ☁️ Cloudflare Pages Deployment

This project is configured for seamless deployment to Cloudflare Pages. 

- **Build command:** `npm run build`
- **Build output directory:** `dist`

The repository includes a `public/_redirects` file that contains `/* /index.html 200`. This ensures that Cloudflare Pages correctly routes all traffic to the React SPA router, preventing 404 errors on direct links.

## 📱 Native apps (iOS + Android)

Both native apps live in this repo and bundle the same trilingual dataset as
the web app — fully offline (thumb + medium images ship in the binary; the
remote `full` size lights up for deep zoom once the site is deployed).

**Shared data pipeline** — after ANY edit to `src/data/*` or `src/i18n/locales/*`:

```bash
node scripts/export-native-data.cjs
```

This regenerates `shared/plants.json` (with `hasIllustration` baked in) plus
each app's bundled copy and images. All three outputs are gitignored.

**iOS** (`ios/` — SwiftUI, iOS 17+, XcodeGen):

```bash
node scripts/export-native-data.cjs   # once, or after data changes
cd ios && xcodegen                    # generates OttorMastar.xcodeproj from project.yml
xcodebuild -project OttorMastar.xcodeproj -scheme OttorMastar \
  -destination 'platform=iOS Simulator,name=iPhone 17' build
```

**Android** (`android/` — Kotlin, Jetpack Compose Material 3, minSdk 26):

```bash
node scripts/export-native-data.cjs
cd android && JAVA_HOME=/opt/homebrew/opt/openjdk@17 ./gradlew :app:assembleDebug
```

Design notes: both apps implement the herbarium tokens from `src/index.css`
(cream canvas, parchment plates, hairline rules, one forest accent, overline
section labels, serif headings with full Cyrillic for Sakha). Settings mirror
the web policy — language, country, Latin names, reset; Yakutia is always the
default collection.
