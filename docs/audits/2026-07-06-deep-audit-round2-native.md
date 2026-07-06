# Deep Audit — Round 2: Native Apps (NEW findings)

**Date:** 2026-07-06  
**Scope:** Full read of all 14 `.swift` + 14 `.kt` sources (second pass)  
**Relation:** Supplements [`2026-07-06-native-apps-bugs.md`](./2026-07-06-native-apps-bugs.md)

---

## High

### SP2-H01 — Android viewer uses `settings.country`, not plant's collection

| Field | Value |
|-------|-------|
| **Files** | `android/.../MainActivity.kt:98,228-231` · `android/.../ViewerScreen.kt:389-396` · `android/.../Components.kt:54-61` |
| **Severity** | **Critical** for cross-collection deep links |
| **Scenario** | 1) Open Yakutia plant detail (correct `plantCountry` on `DetailScreen`). 2) Change Settings country to Mongolia **or** open detail while Mongolia is selected but plant is Yakutia slug. 3) Open full-screen viewer → `plantImageModel(country, …)` uses **settings** `country.imageBase` → wrong path (`/mongolia/mongolia-01.webp` vs `/plants/plant-01.webp`) → broken/missing image. |
| **iOS contrast** | `ViewerItem` embeds `country: Country` per item (`HomeView.swift:50-58`); images resolve correctly. |
| **Fix** | Add `Country` to `ViewerItem`; pass `plantCountry` from `findPlant()` into `ViewerOverlay`; resolve per item. |

### SP2-H02 — iOS `PlantImageView` fetches thumb/medium over network when bundle missing

| Field | Value |
|-------|-------|
| **File** | `ios/OttorMastar/Sources/PlantImage.swift:78-86` |
| **Severity** | **High** |
| **Symptom** | Design intent: thumb+medium bundled offline (`export-native-data.cjs:108-110`). Implementation: any size falls back to `URLSession` if bundle file missing → grid/catalog scroll triggers network storm; offline mode broken; battery drain. |
| **Viewer contrast** | `ImageViewer.swift:274-279` restricts remote fetch to `.full` only. |
| **Fix** | Match viewer policy: no remote fallback for thumb/medium; show parchment placeholder. |

---

## Medium

### SP2-M01 — Android search: no diacritic-insensitive match

| **File** | `android/.../SearchScreen.kt:64` |
| **iOS** | `SearchView.swift:24` uses `.diacriticInsensitive` |
| **Fix** | NFC normalize or `Collator.PRIMARY` |

### SP2-M02 — Android catalog search: same diacritic gap

| **File** | `android/.../CatalogScreen.kt:82` |

### SP2-M03 — iOS remote image load ignores HTTP status

| **File** | `ios/.../PlantImage.swift:82-86` |
| **Symptom** | 404/502 HTML body may decode as garbage; cached in `ImageMemoryCache` |
| **Fix** | Require status 200 (mirror `ImageViewer.swift:276`) |

### SP2-M04 — iOS catalog season-sort tiebreaker not locale-aware

| **File** | `ios/.../CatalogView.swift:26` |
| **Android** | Uses `Collator` at `CatalogScreen.kt:70-72` |

### SP2-M05 — iOS doesn't observe live OS Reduce Motion changes

| **File** | `ios/.../AppSettings.swift:59-61` |
| **Symptom** | `UIAccessibility.isReduceMotionEnabled` read at access time; no subscription to `reduceMotionStatusDidChangeNotification` |
| **Distinct from** | NAT-M03 (Android never reads system setting) |

### SP2-M06 — Invalid persisted `countryId` → silent fallback, broken Settings UI

| **Files** | `Settings.kt:53-58,109` · `AppSettings.swift:28-30,53` · `PlantStore.country()` both platforms |
| **Symptom** | Corrupt country id falls back to default collection but Settings pill shows **no** selection |
| **Web contrast** | Web crashes (WEB-C01) — Android/iOS degrade silently |

### SP2-M07 — Shared `zoomed` flag not reset on viewer page change

| **Files** | `ios/.../ImageViewer.swift:35,90` · `android/.../ViewerScreen.kt:91,152` |
| **Symptom** | Zoom page 1 → swipe to page 2 → dismiss drag and horizontal paging still blocked |
| **Web parity** | R2-W-M05 |

### SP2-M08 — Detail pager index stale when `leadImage` changes

| **Files** | `ios/.../PlantDetailView.swift:15,25-28` · `android/.../DetailScreen.kt:87-91` |
| **Web parity** | R2-W-H01 |

### SP2-M09 — Android home viewer missing photo kind label

| **File** | `android/.../MainActivity.kt:171-172` (`kindLabel = null`) |
| **iOS** | `HomeView.swift:55` sets `plant.photograph` |

### SP2-M10 — Android detail: `HorizontalPager` inside `verticalScroll`

| **File** | `android/.../DetailScreen.kt:107-118` |
| **Symptom** | Horizontal plate↔photo swipe competes with vertical scroll parent |

### SP2-M11 — Empty viewer items unguarded

| **Files** | `ios/.../ImageViewer.swift:40` · `android/.../ViewerScreen.kt:90` |
| **Symptom** | iOS indexes empty array → crash; Android undefined pager state |

---

## Low

| ID | File | Issue |
|----|------|-------|
| SP2-L01 | `CatalogScreen.kt:67-68` | `Collator` recreated every recomposition |
| SP2-L02 | Search/Catalog state | Android `rememberSaveable` vs iOS `@State` — query lost on tab switch (iOS) |
| SP2-L03 | `OttorMastarApp.swift`, `MainActivity.kt` | No `plant/{slug}` deep link / App Links |
| SP2-L04 | All search implementations | No Unicode NFC normalization |
| SP2-L05 | `PlantImage.swift:42-43` | `NSCache` without byte budget |
| SP2-L06 | `ImageViewer.swift:123-132` | Multiple `dismiss()` scheduled on rapid close |
| SP2-L07 | `PlantStore.findPlant()` | First-match across countries — latent collision risk |

---

## Native ↔ Web parity matrix (Round 2 additions)

| Behavior | Web | Android | iOS |
|----------|-----|---------|-----|
| Viewer image country | ✅ `plant.imageBase` | ❌ SP2-H01 settings | ✅ per ViewerItem |
| Offline thumb/medium | ✅ static files | ✅ assets | ⚠️ SP2-H02 network fallback |
| Diacritic-insensitive search | ❌ (raw `includes`) | ❌ SP2-M01 | ✅ |
| leadImage change resets carousel | ❌ R2-W-H01 | ❌ SP2-M08 | ❌ SP2-M08 |
| Zoom reset on viewer page change | ❌ R2-W-M05 | ❌ SP2-M07 | ❌ SP2-M07 |
| System reduce motion (CSS/animations) | ⚠️ R2-W-H02 | ❌ NAT-M03 | ⚠️ SP2-M05 |
| Invalid country in storage | ❌ crash WEB-C01 | ⚠️ silent SP2-M06 | ⚠️ silent SP2-M06 |

---

## Priority (Round 2 native)

1. **SP2-H01** — Android viewer country (blocks trustworthy cross-collection browsing)
2. **SP2-H02** — iOS offline grid integrity
3. **SP2-M07** — Zoom stale state (feels broken in viewer)
4. **SP2-M08** — leadImage carousel reset
5. **SP2-M01/M02** — Android search quality

---

*Parent index: [`2026-07-06-FULL-AUDIT-INDEX.md`](./2026-07-06-FULL-AUDIT-INDEX.md)*