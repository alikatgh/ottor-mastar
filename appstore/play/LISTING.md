# Google Play Android beta listing — 1.1.0 (4)

The Android beta is a botanical reference with 53 plants: 23 from Yakutia and 30 from Mongolia. Medicinal-use sections, categories and search content are disabled on Android. The shared website and iOS retain their own content.

Category: Education. No ads, accounts, tracking or financial features. Target audience 13+. IARC questionnaire completed in Play Console: Everyone / PEGI 3. App content declares no health features and no data collected or shared. Android 4 bundles the catalog and community news, with optional public catalog/news updates and full-resolution images from the app's own site.

The live Russian listing is maintained in Play Console; illustrations are identified as AI-generated and are not medical guidance or a reliable basis for consuming wild plants. Genuine emulator screenshots are used for Android. Production access is separate from beta approval.

# Historical first-build listing (superseded)

Paste-ready for Play Console. Package `com.aulenor.ottormastar` (matches iOS bundle).
Free, no ads, no IAP. Category: **Education**.

## App name (30 chars max)
```
Ottor Mastar
```

## Short description (80 chars max)
```
Illustrated herbarium of Yakutia's wild plants — 23 species, fully offline.
```
(74 chars)

## Full description (4000 chars max)
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

## Graphics
- Phone screenshots (1080×2400, from arm64 emulator): Gallery hero, Catalog list, Plant detail, About — in `appstore/play/screenshots/`
- Feature graphic 1024×500: TODO (compose from a botanical plate + wordmark)
- App icon 512×512: export from `android/app/src/main/res/mipmap-*` (adaptive icon → 512 PNG, no alpha)

## Store settings
- Category: Education. Tags: education, reference/books.
- Contact email: Play account email (or a support address).
- Website: https://ottormastar.aulenor.com
- Privacy policy: https://ottormastar.aulenor.com/legal  (live, 200)

## Declarations (App content)
- **Privacy policy**: URL above.
- **Ads**: No.
- **App access**: All functionality available without special access (no login).
- **Content rating (IARC)**: category Reference/Education. Medical/treatment info =
  references traditional/folk medicine (Infrequent/Mild) → expect ~PEGI 12 / Teen.
  Everything else (violence, sexuality, gambling, drugs as featured content): No.
- **Target audience**: 13+ (avoid child-directed / Families policy; folk-medicine notes).
- **Data safety**: Data collected NONE, shared NONE. Only egress = the launch-time
  catalog.json GET for over-the-air data sync (no personal data). No foreground service.
- **Government app**: No. **Financial**: None. **Health**: None (cultural/historical notes only, with disclaimer).
- **News**: No. **COVID-19**: No.

## Closed testing (12-tester / 14-day gate)
1. Closed testing → Alpha: upload `android/app/build/outputs/bundle/release/app-release.aab`.
2. Release name `1 (1.0)`; notes: "First Android build — illustrated Yakutia herbarium, 5-language UI, fully offline."
3. Testers via **Google Group** (self-serve "Anyone can join"), same pattern as Quenderin.
4. Countries: all. Feedback email: support address.

## Review notes
```
Fully offline educational reference app. No account, no server. Traditional-use
notes are cultural/historical with a prominent in-app disclaimer (Settings → Legal
& Privacy) and at https://ottormastar.aulenor.com/legal. UI language switches in
Settings (Sakha default).
```
