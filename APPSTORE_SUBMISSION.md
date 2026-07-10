# 🍎 App Store Submission — Ottor Mastar (iOS)

**Status: binary-side compliance COMPLETE (reviewed 2026-07-08).** Everything below
the checklist is done in-repo and build-verified. What remains is account-side
work on your machine with Xcode.

Bundle id: `com.aulenor.ottormastar` · Version **1.0 (1)** · iOS **17.0+** · iPhone + iPad

---

## Build it on this laptop (fresh clone)

```bash
git clone <repo> && cd ottor-mastar
npm install
npm run data:export        # regenerates the bundled plants/images/locales (gitignored)
cd ios && xcodegen         # regenerates OttorMastar.xcodeproj from project.yml
open OttorMastar.xcodeproj
```

In Xcode: select the **OttorMastar** target → Signing & Capabilities → set your **Team**
(signing style is already Automatic). Build & run.

> `brew install xcodegen` if missing. The .xcodeproj is generated — never edit it;
> `ios/project.yml` is the source of truth.

---

## ✅ Already done (do not redo)

| Requirement | State |
|---|---|
| App icon | `AppIcon.appiconset` 1024² (RGB, no alpha) wired via `ASSETCATALOG_COMPILER_APPICON_NAME` |
| Privacy manifest | `ios/OttorMastar/Resources/PrivacyInfo.xcprivacy` — no tracking, no data collected, UserDefaults reason `CA92.1` |
| Export compliance | `ITSAppUsesNonExemptEncryption = false` (no export docs needed) |
| Launch screen / orientations / device families | `UILaunchScreen`, portrait iPhone / all iPad, family "1,2" |
| Guideline 2.3.10 | iOS UI contains **no Android / Google Play references** (Help uses platform-neutral copy) |
| Crashes | None known; Mongolia About crash fixed; app is fully offline (IPv6-only review network is a non-issue) |
| Dark mode, Dynamic-type-ish text sizing, 44pt targets, 5 languages | Shipped |
| Disclaimers (Guideline 1.4.1 mitigation) | Per-plant "(?)" note, footer notice, full Legal page — no dosages/instructions anywhere |

## 📋 Your checklist (account-side, in order)

1. **Apple Developer Program** enrolled; Team set on the target.
2. **App Store Connect** → New App → bundle id `com.aulenor.ottormastar`, name **Ottor Mastar**.
3. **Screenshots**: 6.9" & 6.7" iPhone + 13" iPad (simulator screenshots are fine; dark mode makes great shots).
4. **Privacy Policy URL**: `https://ottormastar.aulenor.com/legal`
   ⚠️ MUST be live at review time — the Cloudflare Pages deploy is currently stuck:
   add env var `NODE_VERSION = 20` in the Pages project settings → Retry deployment.
5. **App Privacy** questionnaire → **"Data Not Collected"** (matches the privacy manifest).
6. **Age rating** → *Medical/Treatment Information: Infrequent/Mild* (expect 12+).
7. **Category**: Reference (or Education). Description/keywords — **never mention Android**.
8. **App Review Notes** — paste this:
   > Educational/cultural reference about the flora of Yakutia and Mongolia.
   > It records folk tradition only; it contains no instructions, dosages, or
   > medical advice. Prominent disclaimers appear on every relevant screen and
   > in the Legal section. The app is fully offline; no account or setup needed.
9. **Archive & upload**: Product ▸ Archive (Any iOS Device) → Distribute App → App Store Connect.
10. Submit for review.

## ⚠️ The one review-risk to expect
**1.4.1 Physical harm** — medicinal info about wild (incl. poisonous) plants draws
scrutiny. The mitigations are in the binary (see table) and the Review Note above
answers it pre-emptively. If a reviewer still asks, point to the Legal page and
the per-section disclaimers.

---

*Android/Play-Store counterpart: `docs/STORE_SUBMISSION.md`. Signed Android APK/AAB
live in `builds/` (keystore is local-only: `android/ottor-upload.jks`, password in
`android/keystore.properties` — back these up, they are NOT in git).*
