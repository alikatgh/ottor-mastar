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
