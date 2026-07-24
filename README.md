<div align="center">
  <img src="public/icon-512.png" width="132" alt="Ottor Mastar app icon" />
</div>

<h1 align="center">Ottor Mastar · Оттор Мастар</h1>

> A living herbarium, built in the open — real plants photographed where they
> grow, drawn as vintage botanical plates, named in five languages, free and
> offline.

**Ottor Mastar** ("herbs and trees" in Sakha) began in exactly two places: a
remote **village road in Yakutia (Sakha)** and the **National Garden Park in
Ulaanbaatar, Mongolia** — every plant photographed on foot, on walks and runs.
Not "the flora of two countries," but two transects documented completely, by
one person, growing place by place. That honesty is the whole idea: the method
is cheap, proven, and repeatable — every new place is just another walk.

- 🌍 **Website:** https://ottormastar.aulenor.com
- 🍎 **iOS &amp; macOS:** **[Download on the App Store](https://apps.apple.com/app/id6789648576)** — live now
- 🤖 **Android:** **in closed testing** — [help us test it](#apps) (we're looking for testers!)
- 📘 **Facebook:** [facebook.com/ottormastar](https://www.facebook.com/ottormastar) — a plant story three times a week
- 🌱 Trilingual+ content (Sakha, Russian, English, Mongolian, Latin), fully offline, no ads, no tracking

### Building in public

This repo is public on purpose. Ottor Mastar is not chasing partnerships — it's
building an open, provable track record (traction, a documented method, real
community demand) to earn **funding** and scale to new places. If you're a
botanist, a funder, a translator, or someone who wants their own region
documented, you're in the right place. See what's next in
[`docs/PLACES_ROADMAP.md`](docs/PLACES_ROADMAP.md) and the outreach plan in
[`docs/FACEBOOK_STRATEGY.md`](docs/FACEBOOK_STRATEGY.md).

**Two honesty rules carried everywhere** (site, apps, social):
1. The plates are **illustrations in a 19th-century botanical style**, not scans
   of archival originals.
2. Folk-medicine notes are **cultural/historical only, never medical advice.**

### Status

| Surface | State |
|---------|-------|
| Web (Cloudflare Pages) | ✅ live, auto-deploys on push to `main` |
| iOS + macOS | ✅ live on the [App Store](https://apps.apple.com/app/id6789648576) |
| Android | 🧪 in **closed testing** — [sign up to test](#apps) |
| Facebook | ✅ live — 3 posts/week (Mon plant · Wed guess-the-plant · Fri status), auto-posted from this repo |
| Collections | Yakutia (village-road transect) + Mongolia (National Garden Park, 30 species) |

### How to help / follow along

- **Suggest a place** to document next (open an issue, or comment "do my region" on Facebook).
- **Improve a translation** or a folk-knowledge note (PRs welcome — see *Adding New Plants*).
- **Spot a misidentification** — botanical accuracy is the point; open an issue with the plate/photo.
- **Fund or amplify** — biodiversity, citizen-science, indigenous-language, and digital-culture programs are the target; a share from the right place is worth weeks of organic reach.

> **License / reuse:** the code here is open to read, learn from, and build on.
> The botanical plates and field photographs are the creators' own work — please
> ask before reusing the imagery. A formal license file is coming; until then,
> treat the art as all-rights-reserved and the code as reference.

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

<a id="apps"></a>

## 📱 Apps

The same herbarium, native and **fully offline** — every plant's photos, plates,
and five-language names travel in the app, no signal needed in the field.

### 🍎 iOS &amp; macOS — live

**[Download on the App Store →](https://apps.apple.com/app/id6789648576)**
One universal app for iPhone, iPad, and Mac. Free, offline, no ads, no tracking.

### 🤖 Android — in closed testing (looking for testers!)

The Android app is built and running — we're in **closed testing** before the
public Play Store launch, and we'd love your help shaping it. Testers get the
app early and their feedback goes straight into the release.

**Want in?** Comment on the [Facebook page](https://www.facebook.com/ottormastar)
or [open an issue](https://github.com/alikatgh/ottor-mastar/issues/new) and we'll
send you the join link. *(Self-serve sign-up link coming soon.)*

The apps carry the herbarium's visual language (cream canvas, parchment plates,
hairline rules, one forest accent, serif headings with full Cyrillic for Sakha)
and mirror the web settings — language, place, Latin names. Both apps stay in
sync with the site because all three read the same generated dataset.

## 🤖 Automation (deploy + social)

Two GitHub Actions run the public-facing side of the project straight from this
repo — no dashboards, everything in version control:

- **Auto-deploy** (`.github/workflows/deploy.yml`) — every push to `main` builds
  the site and ships it to Cloudflare Pages (`ottormastar.aulenor.com`). Needs
  `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` secrets.
- **Plant of the Week → Facebook** (`.github/workflows/social-post.yml`) — a
  Mon/Wed/Fri cron posts to the Facebook Page from a calendar generated out of
  the app's own data. Needs a `FB_PAGE_TOKEN` secret.

The social calendar is **generated from `shared/plants.json`**, so the page can
never drift from the app:

```bash
# 3 posts/week (plant story · guess-the-plant · text status), Mongolian-first
node scripts/gen-social-posts.cjs 2026-07-20 --country mongolia
# preview what would post, calling nothing
node scripts/post-to-facebook.cjs --calendar mongolia --dry-run
```

Voice rules live in the generator (`docs/FACEBOOK_STRATEGY.md`): real field
photos first and the vintage plate last, no emoji, plain hyphens, story-first
captions with an Ulaanbaatar National Garden Park hook. The poster publishes
against the Page token (`me/feed`) and is idempotent with the hand-scheduled
launch window via `FB_AUTOPILOT_FROM` + a `MANUAL_DONE` skip-set, so the cron
and Facebook's own scheduler never double-post. Full setup:
[`docs/social/FACEBOOK_SETUP.md`](docs/social/FACEBOOK_SETUP.md).
