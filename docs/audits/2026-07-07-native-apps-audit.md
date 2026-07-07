# Native Apps Audit — 2026-07-07

**Platforms:** iOS 17+ (SwiftUI, XcodeGen) · Android minSdk 26 (Jetpack Compose Material 3)

---

## iOS file list

### Swift sources (14 files, 2,818 lines)

| File | Lines | Role |
|------|------:|------|
| `OttorMastar/Sources/HomeView.swift` | 467 | Home + hero + gallery |
| `OttorMastar/Sources/ImageViewer.swift` | 376 | Full-screen viewer |
| `OttorMastar/Sources/PlantDetailView.swift` | 333 | Plant detail |
| `OttorMastar/Sources/SettingsView.swift` | 239 | Settings |
| `OttorMastar/Sources/CatalogView.swift` | 212 | Catalog |
| `OttorMastar/Sources/Models.swift` | 178 | Data models |
| `OttorMastar/Sources/LegalView.swift` | 159 | Legal |
| `OttorMastar/Sources/Theme.swift` | 157 | Design tokens |
| `OttorMastar/Sources/SearchView.swift` | 146 | Search |
| `OttorMastar/Sources/AboutView.swift` | 136 | About |
| `OttorMastar/Sources/AppSettings.swift` | 133 | Settings persistence |
| `OttorMastar/Sources/PlantImage.swift` | 101 | Image loading |
| `OttorMastar/Sources/L10n.swift` | 74 | i18n |
| `OttorMastar/Sources/OttorMastarApp.swift` | 62 | App entry |

### Config

| File | Lines | Role |
|------|------:|------|
| `ios/project.yml` | 54 | XcodeGen manifest |

### Bundled resources (gitignored, from `data:export`)

| Path | Contents |
|------|----------|
| `OttorMastar/Resources/plants.json` | 47 plants |
| `OttorMastar/Resources/locale-{sah,ru,en,mn,zh}.json` | 5 locales on disk |
| `OttorMastar/Resources/PlantImages/` | 288 WebP (thumb + medium) |

---

## Android file list

### Kotlin sources (14 files, 2,789 lines)

| File | Lines | Role |
|------|------:|------|
| `ui/DetailScreen.kt` | 454 | Plant detail |
| `ui/ViewerScreen.kt` | 417 | Full-screen viewer |
| `ui/HomeScreen.kt` | 373 | Home |
| `MainActivity.kt` | 332 | Navigation |
| `ui/SettingsScreen.kt` | 273 | Settings |
| `ui/Components.kt` | 257 | Shared UI |
| `ui/CatalogScreen.kt` | 224 | Catalog |
| `ui/LegalScreen.kt` | 224 | Legal |
| `ui/SearchScreen.kt` | 169 | Search |
| `ui/AboutScreen.kt` | 162 | About |
| `data/Models.kt` | 158 | Data models |
| `data/Settings.kt` | 175 | Settings persistence |
| `data/L10n.kt` | 69 | i18n |
| `ui/Theme.kt` | 93 | Design tokens |

### Gradle config

| File | Role |
|------|------|
| `android/app/build.gradle.kts` | App module |
| `android/build.gradle.kts` | Root |
| `android/settings.gradle.kts` | Settings |
| `android/gradle/libs.versions.toml` | Version catalog |

### Bundled assets (gitignored, from `data:export`)

| Path | Contents |
|------|----------|
| `app/src/main/assets/plants.json` | 47 plants |
| `app/src/main/assets/locale-{sah,ru,en,mn,zh}.json` | All 5 locales |
| `app/src/main/assets/images/` | 288 WebP |

---

## Findings

### Critical — 1

| ID | Issue | Location |
|----|-------|----------|
| **NAT-C01** | **iOS `project.yml` omits `locale-mn.json` and `locale-zh.json`** — files exist on disk after export but are NOT in build resources. Mongolia on iOS will show raw i18n keys. Android bundles all 5. | `ios/project.yml:30-35` |

### High — 3

| ID | Issue | Location |
|----|-------|----------|
| NAT-H01 | Hero uses `plants.last` not `heroSlug` — same bug as web | `HomeView.swift:~90`, `HomeScreen.kt:~71` |
| NAT-H02 | Search omits mn/zh names | `CatalogView.swift`, `SearchView.swift`, `CatalogScreen.kt`, `SearchScreen.kt` |
| NAT-H03 | iOS About stats hardcoded Yakutia trilingual labels + "3 languages" | `AboutView.swift:13-28` |

### Medium — 5

| ID | Issue | Location |
|----|-------|----------|
| NAT-M01 | iOS no plant-not-found screen (Android has `PlantNotFound`) | `MainActivity.kt:294-331` vs iOS gap |
| NAT-M02 | iOS footer always Yakutia copy (`app.description` + `app.subtitle`) | `HomeView.swift` FooterView |
| NAT-M03 | iOS `countryId` not validated on write — invalid id → no selection in picker | `AppSettings.swift:57-67` |
| NAT-M04 | Legal copy sah/ru/en only on both platforms | `LegalView.swift`, `LegalScreen.kt` |
| NAT-M05 | Android About still hardcodes `"3"` for language stat | `AboutScreen.kt:51-59` |

### Low — 4

| ID | Issue | Location |
|----|-------|----------|
| NAT-L01 | No deep links / App Links for `plant/{slug}` | Both platforms |
| NAT-L02 | iOS `NSCache` unbounded for decoded images | `PlantImage.swift:42-43` |
| NAT-L03 | iOS search state lost on tab switch (`@State` vs `rememberSaveable`) | `SearchView.swift:8` |
| NAT-L04 | iOS Xcode project gitignored — requires `xcodegen` after clone | `ios/project.yml` |

---

## Verified fixed (July 6 → now)

| Finding | Status |
|---------|--------|
| Android viewer wrong country (SP2-H01) | ✅ `ViewerItem.country` per item |
| iOS grid network for thumb/medium (SP2-H02) | ✅ Bundled-first in `PlantImage.swift` |
| leadImage carousel reset | ✅ All platforms |
| iOS Home viewer Details no-op | ✅ `HomeView.swift:55-58` |
| iOS install "Missing bundle ID" | ✅ `project.yml` PlantImages folder fix |
| Android viewer swipe/gesture conflict | ✅ Custom gesture in `ViewerScreen.kt` |
| Per-country languages (mn/zh) | ✅ Data layer; **iOS bundle incomplete (NAT-C01)** |
| Native plural `gallery.photoCount` | ✅ L10n fallback chain |
| Touch targets <44dp | ✅ Fixed both platforms |
| `launchSingleTop` on nav | ✅ Android |

---

## iOS project.yml fix required (P0)

Add after line 34:

```yaml
      - path: OttorMastar/Resources/locale-mn.json
        buildPhase: resources
      - path: OttorMastar/Resources/locale-zh.json
        buildPhase: resources
```

Then: `cd ios && xcodegen`