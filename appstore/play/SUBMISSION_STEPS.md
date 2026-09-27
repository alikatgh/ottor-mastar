# Ottor Mastar — Google Play submission: your remaining steps

**App:** Ottor Mastar · package `com.aulenor.ottormastar` · v1.0 (versionCode 1)
**Account:** albert.chromium@gmail.com — make sure the top-right avatar shows *Albert Albert* (`/u/1/`)
**Console home for this app:**
https://play.google.com/console/u/1/developers/6289191549337108258/app/4976182243999455599/app-dashboard

## Files to upload (all under `~/Documents/projects/ottor_mastar/`)
| What | Path | Specs |
|---|---|---|
| **App bundle (AAB)** | `android/app/build/outputs/bundle/release/app-release.aab` | 30 MB, signed |
| **App icon** | `appstore/play/icon-512.png` | 512×512 |
| **Feature graphic** | `appstore/play/feature-graphic-1024x500.png` | 1024×500 |
| **Screenshot 1** | `appstore/play/screenshots/01-gallery.png` | 1080×2400 |
| **Screenshot 2** | `appstore/play/screenshots/02-catalog.png` | 1080×2400 |
| **Screenshot 3** | `appstore/play/screenshots/03-detail.png` | 1080×2400 |
| **Screenshot 4** | `appstore/play/screenshots/04-about.png` | 1080×2400 |

## Already done for you (no action)
App record · Russian store-listing text · category (Education) · contact details · 9 of 10 app-content declarations.

---

## Step 1 — Content rating (IARC)  ·  ~3 min
Open: **App content → Content ratings → Start questionnaire**
https://play.google.com/console/u/1/developers/6289191549337108258/app/4976182243999455599/app-content/overview
1. Enter an email for the rating certificate.
2. Category: **Reference, News, or Educational**.
3. Answer **No** to violence, sexuality, gambling, crude humour, controlled substances *as featured content*.
4. For any question about **references to medicine / drugs**: the app *does* mention traditional (folk) medicinal plant uses — answer truthfully (it's mild/educational, with an in-app disclaimer). Expect a **Teen / PEGI-12**-type rating.
5. Submit.
> I left this for you because submitting **accepts IARC's third-party Terms of Service**.

## Step 2 — Store-listing graphics  ·  ~3 min
Open: **Grow users → Store presence → Store listings** (scroll to *Graphics*)
https://play.google.com/console/u/1/developers/6289191549337108258/app/4976182243999455599/main-store-listing
- **App icon** → Add → `appstore/play/icon-512.png`
- **Feature graphic** → Add → `appstore/play/feature-graphic-1024x500.png`
- **Phone screenshots** → Add → the four files in `appstore/play/screenshots/`
- **Save** (the Russian text is already filled — once graphics are in, the whole listing saves without errors).

## Step 3 — Two choices to confirm (optional)
- **Health apps** — I set it to *“no health features”* (the folk-medicine notes are cultural content, matching how iOS classifies the app). To be more conservative: **App content → Health apps** → *“Medical reference and education.”*
- **Contact email** — I entered `ottormastar@aulenor.com`. If that mailbox doesn’t exist, change it under **Store settings → Store listing contact details**.

## Step 4 — Create the tester Google Group  ·  ~2 min
1. https://groups.google.com/  (signed in as albert.chromium)
2. **Create group** → name *Ottor Mastar Testers*, email `ottormastar-testers`.
3. *Who can join group* → **Anyone can join**  ← this is the CAPTCHA step only you can do.
4. Tester join link to share later: **https://groups.google.com/g/ottormastar-testers**

## Step 5 — Closed-testing release  ·  ~5 min
Open: **Test and release → Testing → Closed testing** → *Create new release* (this also creates the Alpha track)
1. **App bundles → Upload** → `android/app/build/outputs/bundle/release/app-release.aab`
2. **Release name:** `1 (1.0)`
3. **Release notes** (paste):
   `Первая версия для Android — иллюстрированный гербарий Якутии, интерфейс на 5 языках, полностью офлайн.`
4. **Save** (as draft).
5. **Countries / regions** tab → *Add countries/regions* → select all → **Save**.
6. **Testers** tab → **Google Groups** → `ottormastar-testers@googlegroups.com` → Feedback email `ottormastar@aulenor.com` → **Save**.

## Step 6 — Send for review  ·  ~1 min
Open: **Publishing overview → Send for review**
https://play.google.com/console/u/1/developers/6289191549337108258/app/4976182243999455599/publishing
- No foreground-service prompt for this app (unlike Quenderin — nothing to upload there).
- After review passes, the tester **opt-in link** appears on the *Testers* tab — post it in the Google Group so testers can install.

## The 12-tester / 14-day gate
As with Quenderin: **12 testers must opt in and stay active for 14 continuous days** before you can apply for production. Recruit into the group early — people can join the group even before the build is live.
