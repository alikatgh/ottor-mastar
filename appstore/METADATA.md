# App Store listing — Ottor Mastar (v1.0, build 1)

Everything App Store Connect will ask for, ready to paste.
Bundle ID: `com.aulenor.ottormastar` · Team: 9M2B2P4KSA · Signed .ipa: `ios/build/export/OttorMastar.ipa`

## Name & subtitle (30 chars max each)

| Field | Value | Chars |
|---|---|---|
| Name | `Ottor Mastar` | 12 |
| Subtitle (en) | `Sakha herbarium & plant guide` | 29 |
| Subtitle (ru) | `Гербарий растений Якутии` | 24 |

## Primary language
Russian — the app's audience is Sakha/Russian-speaking; English localization included.

## Category
- Primary: **Education**
- Secondary: **Reference**

## Description (en)

```
Ottor Mastar is an illustrated herbarium of the wild plants of Yakutia —
flowers, herbs, and healing plants of the Sakha land.

• 23 species with botanical plates and field photographs
• Names in Sakha, Russian, English, and Latin
• Habitat, flowering season, and notes on traditional Sakha use
• Full-text search across all names and descriptions
• Interface in Sakha, Russian, English, Mongolian, and Chinese
• Works completely offline — all content and images are bundled
• No accounts, no ads, no tracking

Plant descriptions combine general botanical knowledge with the folk
tradition of the Sakha people. Traditional uses are recorded for cultural
and historical interest only — the app is not medical advice and must not
be used to identify, gather, or consume plants.
```

## Description (ru)

```
«Оттор Мастар» — иллюстрированный гербарий дикорастущих растений Якутии:
цветы, травы и лечебные растения земли саха.

• 23 вида с ботаническими иллюстрациями и полевыми фотографиями
• Названия на якутском, русском, английском и латыни
• Места обитания, сроки цветения, сведения о народном применении
• Полнотекстовый поиск по всем названиям и описаниям
• Интерфейс на якутском, русском, английском, монгольском и китайском
• Полностью офлайн — весь контент и изображения встроены
• Без аккаунтов, рекламы и слежки

Описания сочетают общие ботанические сведения и народную традицию саха.
Сведения о традиционном применении приведены исключительно из культурного
и исторического интереса — приложение не является медицинским советом и не
должно использоваться для определения, сбора или употребления растений.
```

## Keywords (100 chars max)

- en: `herbarium,plants,botany,yakutia,sakha,flowers,herbs,flora,siberia,wildflowers,plant guide` (90)
- ru: `гербарий,растения,ботаника,якутия,саха,цветы,травы,флора,сибирь,определитель` (76)

## URLs
- Support URL: `https://ottormastar.aulenor.com/help`
- Marketing URL: `https://ottormastar.aulenor.com`
- Privacy Policy URL: `https://ottormastar.aulenor.com/legal`  ← live, verified 200

## Age rating questionnaire — answer honestly
- Medical/Treatment Information: **Infrequent/Mild** (folk-medicine notes with disclaimer)
- Everything else: None
- Expected rating: **12+** (driven by the medical item; all else is 4+ content)

## App Privacy (nutrition label)
- Data collection: **None** ("Data Not Collected")
- Matches the bundled PrivacyInfo.xcprivacy (no tracking, no collected data types,
  UserDefaults CA92.1 only).

## Pricing
- Free, all territories (or trim territories as desired).

## Review notes (paste into "Notes" for the reviewer)

```
Fully offline educational reference app. No account needed, no server
component — all content is bundled in the app. Traditional-use notes are
cultural/historical; a prominent disclaimer is in the app under
Settings → Legal & Privacy, and at https://ottormastar.aulenor.com/legal.
Interface language can be switched in Settings (Sakha default).
```

## Screenshots (`appstore/screenshots/`)
- iPhone 6.9" (1320×2868): 01-home, 02-catalog, 03-detail, 04-viewer
- iPad 13" (2064×2752): 01-home, 02-catalog, 03-detail, 04-viewer
- Order suggestion: home → detail → viewer → catalog (lead with the strongest visual)

## Remaining steps (in order)
1. Create the app record: App Store Connect → My Apps → **+** → New App
   (iOS, name "Ottor Mastar", primary language Russian, bundle
   `com.aulenor.ottormastar`, SKU e.g. `ottormastar-ios`).
2. Upload the build — either:
   - Xcode → Window → Organizer → latest OttorMastar archive → Distribute App → App Store Connect, or
   - `cd ios && sed -i '' 's|<string>export</string>|<string>upload</string>|' ExportOptions.plist && xcodebuild -exportArchive -archivePath build/OttorMastar.xcarchive -exportOptionsPlist ExportOptions.plist -allowProvisioningUpdates`
3. In ASC: fill the fields above, upload screenshots, answer age rating +
   privacy questionnaires, select the build, submit for review.

---

# macOS (Mac Catalyst) — v1.1, build 2 · added 2026-07-14

Same app record (**6789648576**), same bundle id `com.aulenor.ottormastar` —
the Catalyst build ships as a **universal purchase**. Archive:
`ios/build/OttorMastar-macos.xcarchive` (universal arm64 + x86_64, macOS 14+,
App Sandbox + outbound-network entitlements).

## One-command rebuild + upload
```
cd ios && xcodegen \
  && xcodebuild -project OttorMastar.xcodeproj -scheme OttorMastar \
       -destination 'generic/platform=macOS,variant=Mac Catalyst' \
       -archivePath build/OttorMastar-macos.xcarchive archive -allowProvisioningUpdates \
  && xcodebuild -exportArchive -archivePath build/OttorMastar-macos.xcarchive \
       -exportOptionsPlist ExportOptions.plist -allowProvisioningUpdates
```

## What's New (v1.1 — both platforms)

en:
```
• New app icon — the Sardaana lily, the collection's signature bloom
• Catalog updates now arrive automatically, no app update needed
• First release for Mac
```

ru:
```
• Новая иконка приложения — сардаана, символ коллекции
• Обновления каталога теперь приходят автоматически
• Первый выпуск для Mac
```

## Screenshots (`appstore/screenshots/macos/`, 2880×1800 JPEG, no alpha)
- 01-home (Sardaana frontispiece hero) · 02-catalog · 03-detail · 04-about
- Captured from the real Catalyst app — light appearance, Sakha UI, Yakutia collection.

## ASC steps for the macOS platform (user, in App Store Connect)
1. My Apps → Ottor Mastar → left sidebar → **+ → macOS** (adds the platform;
   the uploaded Catalyst build appears under it).
2. Version 1.1: paste name/subtitle/description/keywords from the iOS listing
   above (fields are per-platform but the copy is identical).
3. Upload the 4 screenshots from `appstore/screenshots/macos/` (use the .jpg).
4. Privacy policy URL per localization (same gotcha as iOS: the dialog has an
   inner language dropdown — fill EVERY localization).
5. Select build 1.1 (2), age rating + privacy carry over, submit for review.

Note: iOS 1.1 (2) can be rebuilt/uploaded with the same commands minus the
`-destination` (or Product → Archive) whenever you want the new icon live on
iPhone/iPad too.
