# Native Apps Audit — iOS & Android

**Scope:** `ios/OttorMastar/Sources/` (14 Swift files), `android/app/src/main/java/com/aulenor/ottormastar/` (14 Kotlin files), `ios/project.yml`  
**Date:** 2026-07-06  
**Cross-reference:** `docs/BUG_JOURNAL.md` — 2026-07-06 fixes verified below; this report covers **remaining** issues only.

---

## Already fixed (do not re-open)

| Fix | Verified in |
|-----|-------------|
| Android `launchSingleTop` on all nav calls | `MainActivity.kt:110-235` |
| Android viewer pinch/pager gesture split | `ViewerScreen.kt:341-364` |
| Plural bare-key fallback (`gallery.photoCount`) | `L10n.kt:35-36`, `L10n.swift:62-63` |
| iOS bundle layout (no top-level `Resources/`) | `project.yml:21-34` |
| Home cover country gating | `HomeScreen.kt:118-138`, `HomeView.swift:105-125` |
| 44dp touch targets on settings/detail | `SettingsScreen.kt:224,248`, `DetailScreen.kt:365-367`, `PlantDetailView.swift:249` |

---

## High severity

### NAT-H01 — iOS Home viewer "Details" button is a no-op

| Field | Value |
|-------|-------|
| **File** | `ios/OttorMastar/Sources/HomeView.swift:39-43` |
| **Platform** | iOS only |
| **Symptom** | Tapping "Details ↗" chip in full-screen viewer from Home does nothing. |
| **Cause** | `onOpenDetail: { _ in }` — empty closure. |
| **Android** | Works correctly via `MainActivity.kt:234-236`. |
| **Fix** | Dismiss viewer, push `PlantDetailView` for selected plant (by slug). |

### NAT-H02 — iOS detail uses `settings.country` not plant's owning collection

| Field | Value |
|-------|-------|
| **Files** | `CatalogView.swift:88-89`, `SearchView.swift:62-63`, `HomeView.swift:28-29`, `AboutView.swift:77-78` |
| **Platform** | iOS |
| **Symptom** | User changes country in Settings while detail screen is on nav stack → images resolve against new `imageBase` with old plant's `imageId` → wrong/missing images. |
| **Android** | Correctly binds `plantCountry` from `PlantStore.findPlant()` at `MainActivity.kt:204-209`. |
| **Fix** | Pass `(Plant, Country)` as navigation value, or resolve country inside destination via `findPlant(slug)`. |

### NAT-H03 — Footer & About still show Yakutia copy when Mongolia selected

| Field | Value |
|-------|-------|
| **Files** | `android/.../Components.kt:221-238`, `ios/.../HomeView.swift:387-397`, `AboutView.swift:28`, `android/.../AboutScreen.kt:64` |
| **Platform** | Both |
| **Symptom** | Footer and About overline show `app.description` / `app.subtitle` (Yakutia-specific) regardless of country. |
| **Cause** | Partial fix — Home cover was gated (BUG_JOURNAL) but footer/about were missed. Same root cause as original home-header bug. |
| **Fix** | Gate on `country.id == "yakutia"`; title → `settings.country_<id>`; description only for Yakutia. Mirror `HomeScreen.kt:118-138`. |
| **Web parity** | Same issue — WEB-M01. Fix all three platforms together. |

### NAT-H04 — About intro/mission are Yakutia-only strings

| Field | Value |
|-------|-------|
| **Files** | `locale-en.json:103-104` (and ru/sah), `AboutScreen.kt`, `AboutView.swift` |
| **Symptom** | "wild herbs and trees of Yakutia" shown when Mongolia is active collection. |
| **Fix** | `about.intro_mongolia` / parameterized intro from `country.id`. |

---

## Medium severity

### NAT-M01 — iOS duplicate navigation on double-tap

| **Files** | All `NavigationLink(value: plant)` sites: `CatalogView.swift:75`, `SearchView.swift:49`, `HomeView.swift:68,184,288` |
| **Symptom** | Rapid double-tap pushes duplicate `PlantDetailView` — Back appears broken. |
| **Android** | Fixed with `launchSingleTop`. |
| **Fix** | Dedupe navigation path (ignore push if top == same slug). |

### NAT-M02 — Android invalid slug → blank screen

| **File** | `MainActivity.kt:203-204` |
| **Symptom** | Missing plant slug silently `return@composable` — blank screen. |
| **Fix** | Pop back stack or show "not found" composable. |

### NAT-M03 — Android `reduceMotion` ignores system setting

| **Files** | `Settings.kt:81-86` vs `AppSettings.swift:59-61` |
| **Symptom** | iOS respects `UIAccessibility.isReduceMotionEnabled`; Android only reads in-app toggle. |
| **Fix** | `toggle || AccessibilityManager.isEnabled(REDUCE_MOTION)`. |

### NAT-M04 — iOS Segmented controls below 44pt

| **File** | `SettingsView.swift:176-202` |
| **Symptom** | `.padding(.vertical, 7)` → ~28-32pt. Android uses `minHeight = 44.dp` at `SettingsScreen.kt:224`. |
| **Fix** | `.frame(minHeight: 44)`. |

### NAT-M05 — Category filter chips too small (both platforms)

| **Files** | `CatalogView.swift:128-132`, `CatalogScreen.kt:134-139` |
| **Fix** | `minHeight(44)` / expanded hit rects. |

### NAT-M06 — Android tab icons lack content descriptions

| **Files** | `MainActivity.kt:135`, `ViewerScreen.kt:126,397` |
| **Fix** | `loc.t(tab.labelKey)` for tabs; decorative images explicitly hidden from TalkBack. |

### NAT-M07 — Android medicinal (?) toggle lacks semantics

| **File** | `DetailScreen.kt:374-382` |
| **iOS** | Has `accessibilityLabel` at `PlantDetailView.swift:252`. |
| **Fix** | `Modifier.semantics { contentDescription = ... }`. |

### NAT-M08 — Country change doesn't reset nav state

| **Files** | Settings country change; `MainActivity.kt` nav stack |
| **Symptom** | User can remain on Yakutia plant page after switching to Mongolia. |
| **Fix** | On `countryId` change: pop to home, dismiss viewer, reset search. |

### NAT-M09 — Legal privacy text factually wrong

| **Files** | `LegalScreen.kt:191-197`, `LegalView.swift:131-135` |
| **Says** | "The app makes no external network requests" |
| **Reality** | Both apps fetch remote `full` images (`ViewerScreen.kt:395-400`, `ImageViewer.swift:274-279`). `AndroidManifest.xml` declares `INTERNET`. |
| **Fix** | "No requests carrying personal data"; mention optional full-res fetches. |
| **Web parity** | WEB-L14. |

### NAT-M10 — iOS disclaimer legal link fragile

| **File** | `PlantDetailView.swift:175-179`, `HomeView.swift:371-375` |
| **Symptom** | Invisible `NavigationLink` under `DisclaimerBox` — screen readers may miss it. |
| **Fix** | Explicit `onOpenLegal` closure or visible `NavigationLink`. |

---

## Low severity

### NAT-L01 — Missing locale keys render as raw strings

| **Files** | `L10n.kt:14`, `L10n.swift:43-44` |
| **Risk** | Same pitfall as BUG_JOURNAL Sakha key gaps. Dynamic keys like `seasons.${plant.bloomingSeason}` need CI coverage. |

### NAT-L02 — About stats hardcoded per language

| **Files** | `AboutScreen.kt:50-58`, `AboutView.swift:13-21` |
| **Fix** | Move to locale JSON via export script. |

### NAT-L03 — Android viewer double AsyncImage flash

| **File** | `ViewerScreen.kt:388-400` |
| **Fix** | Coil crossfade or single composable. |

### NAT-L04 — iOS TabView not disabled when zoomed

| **File** | `ImageViewer.swift:86-102` |
| **Android** | `userScrollEnabled = !zoomed` at `ViewerScreen.kt:152`. |
| **Fix** | Disable TabView paging when `zoomed == true`. |

### NAT-L05 — Zoom affordance decorative only

| **Files** | `DetailScreen.kt:160-172`, `PlantDetailView.swift:115-124` |
| **Fix** | Make tappable or mark accessibility-hidden. |

### NAT-L06 — iOS project.yml bundle layout

| **File** | `project.yml:21-34` |
| **Status** | Correct post-fix. Keep comment when adding assets. |

---

## Native refactoring opportunities

### R-N01 — Legal copy single source (High)

~200 lines duplicated in `LegalScreen.kt` + `LegalView.swift`. Generate from locale JSON or `LegalPage.tsx` via export script.

### R-N02 — iOS navigation destination deduplication (Medium)

Identical `.navigationDestination(for: PushedPage.self)` blocks in 4 tab roots. Extract `.ottorNavigationDestinations()` modifier.

### R-N03 — Footer/About country gating helper (Medium)

Shared logic for web + Android + iOS. Single locale key pattern.

### R-N04 — Split Android MainActivity (Low)

Extract `ViewerHost`, `TabScaffold`, nav graph from ~150-line `AppRoot`.

### R-N05 — L10n test vectors (Low)

Shared JSON test cases for plural/season lookups across Kotlin and Swift.

### R-N06 — iOS four NavigationStacks (Info)

Correct for tabs but detail/legal destinations duplicated. R-N02 addresses this.

---

## Platform parity matrix

| Feature | Web | Android | iOS |
|---------|-----|---------|-----|
| launchSingleTop / dedupe nav | N/A (SPA) | ✅ | ❌ NAT-M01 |
| Viewer Details button | ✅ | ✅ | ❌ NAT-H01 |
| Country on detail screen | ✅ (via context) | ✅ plantCountry | ❌ NAT-H02 |
| Home country gating | ⚠️ WEB-M01 | ✅ | ✅ |
| Footer/About country gating | ⚠️ WEB-M01 | ❌ NAT-H03 | ❌ NAT-H03 |
| reduceMotion system | N/A | ❌ NAT-M03 | ✅ |
| 44dp touch targets | ⚠️ partial | ✅ | ⚠️ NAT-M04/M05 |
| Invalid slug handling | ⚠️ WEB-H06 | ❌ NAT-M02 | ? |
| Remote full images | ✅ | ✅ | ✅ |
| Legal privacy accuracy | ⚠️ WEB-L14 | ❌ NAT-M09 | ❌ NAT-M09 |

---

## Build commands (reference)

```bash
# After ANY data/locale change:
node scripts/export-native-data.cjs

# iOS
cd ios && xcodegen
xcodebuild -project OttorMastar.xcodeproj -scheme OttorMastar \
  -destination 'platform=iOS Simulator,name=iPhone 17' build

# Android
cd android && JAVA_HOME=/opt/homebrew/opt/openjdk@17 ./gradlew :app:assembleDebug
```

---

*See also: [`2026-07-06-FULL-AUDIT-INDEX.md`](./2026-07-06-FULL-AUDIT-INDEX.md)*