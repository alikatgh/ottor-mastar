# App Store & Play Store — submission checklist

Status of the native apps against store requirements, and what still needs **you**
(accounts, signing, listings — things that can't be done from the codebase).

Privacy-policy URL for both stores: **https://ottormastar.aulenor.com/legal**

---

## Android beta update — 2026-09-27

- Signed Android 1.0.1 (version code 3), compile/target SDK 36, minimum SDK 26.
- Android presents botanical reference content; medicinal sections, filters, badges, search content and introduction copy are disabled. Shared web and iOS content is unchanged.
- Release lint, APK and AAB builds passed. The signed APK installed and launched on qa_pixel; catalog navigation was checked on the emulator.
- Google Play internal release is available to the dedicated internal tester list. The closed Alpha release uses build 3 and the dedicated Ottor Mastar Google Group; countries and store metadata are prepared for review.
- IARC rating, privacy URL, no-ads/no-financial/no-health declarations, no-data-collected form, Russian listing and genuine native phone screenshots have been completed in Play Console. AI-generated botanical illustrations are disclosed in store assets.
- Public production access still requires Google's closed-test eligibility and review. Internal availability is not production approval.
- Signing keys, keystore properties, generated bundles and screenshots remain outside Git.

## ✅ Done in-repo (build-verified 2026-07-07)

Both apps compile clean:
- **iOS** — `cd ios && xcodegen && xcodebuild -scheme OttorMastar -sdk iphonesimulator build` → **BUILD SUCCEEDED**
- **Android** — `cd android && ./gradlew assembleDebug` → **BUILD SUCCESSFUL** (`app-debug.apk`, 33.7 MB)

| Requirement | iOS | Android |
|---|---|---|
| App icon | ✅ `AppIcon.appiconset` (1024², from brand leaf mark) | ✅ adaptive icon (vector fg + `anydpi-v26`) |
| Privacy manifest | ✅ `PrivacyInfo.xcprivacy` (no tracking, no data; UserDefaults reason `CA92.1`) | n/a (uses Data safety form) |
| Version | ✅ `MARKETING_VERSION 1.0` / build `1` | ✅ `versionName 1.0` / `versionCode 1` |
| Bundle / app id | ✅ `com.aulenor.ottormastar` | ✅ `com.aulenor.ottormastar` |
| OS target | ✅ deployment iOS 17 | ✅ `targetSdk 35` (meets Play's 2025 floor), `minSdk 26` |
| Orientation / devices | ✅ portrait phone, all-orientation iPad; family 1,2 | ✅ |
| Encryption declaration | ✅ `ITSAppUsesNonExemptEncryption=false` | n/a |
| Launch screen | ✅ `UILaunchScreen` | ✅ Compose theme |
| Bundled content (offline) | ✅ 288 webp + 5 locales + plants.json via `npm run data:export` | ✅ same, in `assets/` |

Regenerate the bundled assets any time with **`npm run data:export`** (they're gitignored).

---

## You must do — iOS (App Store)

1. **Apple Developer Program** — enrol ($99/yr).
2. **Signing** — in Xcode, set the target's Team; `CODE_SIGN_STYLE` is already `Automatic`. For CI, create a Distribution cert + App Store provisioning profile.
3. **App Store Connect** — create the app record (bundle id `com.aulenor.ottormastar`).
4. **Archive & upload** — `Product ▸ Archive` (Release, real device) → Distribute App → App Store Connect (or `xcodebuild archive` + `xcrun altool`/Transporter).
5. **Listing** — name, subtitle, description, keywords, support URL, **privacy policy URL** (above), category (Reference / Education).
6. **Screenshots** — 6.7" + 6.1" iPhone and 12.9" iPad (required sizes). Run the app in the simulator and capture.
7. **App Privacy** — answer "Data Not Collected" (matches `PrivacyInfo.xcprivacy`).
8. Submit for review.

## You must do — Android (Play Store)

1. **Play Console** — create account ($25 one-time).
2. **Signing** — enable **Play App Signing**; create an upload keystore. Add a `signingConfigs.release` in `android/app/build.gradle.kts` reading from a gitignored `keystore.properties` (I can scaffold this on request).
3. **Release build** — `./gradlew bundleRelease` → `app-release.aab` (upload an AAB, not APK).
4. **Store listing** — title, short + full description, feature graphic (1024×500), app icon (512), **privacy policy URL** (above), category.
5. **Screenshots** — ≥2 phone (+ 7" & 10" tablet recommended, since the app supports large-window/iPad-parity layouts).
6. **Data safety form** — declare "No data collected / shared" (matches the app).
7. **Content rating** questionnaire (IARC).
8. Roll out to internal testing → production.

---

## Notes / known low-priority items

- Deep links / App Links for `plant/{slug}` are not wired (NAT-L01) — optional, add if you want shareable plant URLs to open the app.
- iOS `project.pbxproj` is gitignored — after a fresh clone run `cd ios && xcodegen` before opening/building.
- The apps are offline-first (all content bundled), so neither store's networking/permission disclosures apply — there are **no runtime permissions** requested on either platform.
