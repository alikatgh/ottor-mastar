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
├── public/
│   ├── _redirects         # Cloudflare Pages SPA configuration
│   ├── images/            # Original raw JPEGs & generated illustrations
│   └── plants/            # Auto-generated optimized WebP images (thumb/medium/full)
├── scripts/
│   ├── optimize-images.cjs        # Script to optimize raw JPEGs to WebP
│   └── optimize-illustrations.cjs # Script to optimize generated illustrations
├── src/
│   ├── components/        # Reusable React components (Gallery, Layout, Common)
│   ├── data/              # plants.ts (Central data store)
│   ├── i18n/              # Translation files (sah.json, ru.json, en.json)
│   ├── pages/             # Route components (HomePage, CatalogPage, etc.)
│   └── types/             # TypeScript definitions
└── index.html
```

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

To achieve native-app performance, all images in the app are served as heavily optimized `WebP` files in three sizes: `thumb` (400px), `medium` (800px), and `full` (1600px).

If you add new photos or illustrations to the `public/images/` directory, you must run the optimization scripts before starting the dev server:

```bash
# Optimize original photographs
node scripts/optimize-images.cjs

# Optimize vintage illustrations
node scripts/optimize-illustrations.cjs
```

This will generate the required WebP files in `public/plants/`. **Do not manually add files to `public/plants/`** as it is an auto-generated directory.

## 📝 Adding New Plants

To add a new plant to the encyclopedia:

1. **Add Photos:** Place the original high-resolution photo in `public/images/`. (If you have a vintage illustration, place it in `public/images/illustrations/`).
2. **Update Image Map:** In `src/data/plants.ts`, update the `IMAGE_MAP` object to link a new `plant-XX` ID to your exact filename.
3. **Add Data:** Add the plant object to the `plants` array in `src/data/plants.ts`. Ensure all trilingual fields (`names`, `description`, `medicinalUses`) are populated.
4. **Run Optimization:** Run `node scripts/optimize-images.cjs`.

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
