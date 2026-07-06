# Content Quality Audit

**Scope:** Botanical accuracy, photo↔species assignment, taxonomy, citations, legal copy accuracy  
**Date:** 2026-07-06  
**Primary reference:** [`2026-07-06-photo-species-audit.md`](./2026-07-06-photo-species-audit.md)

---

## Yakutia field photos — current status

### Resolution timeline

| Stage | Matched | Mismatched | Date |
|-------|---------|------------|------|
| Initial audit | 8/23 | 15/23 | 2026-07-06 AM |
| After swaps + rotate | **19/23** | **4/23** | 2026-07-06 PM |

### Fixes applied (verified in audit §7)

| Operation | Entries | Result |
|-----------|---------|--------|
| swap | plant-10 ↔ plant-11 | Filipendula ✓ / Vicia ✓ |
| swap | plant-21 ↔ plant-22 | Geranium sibiricum ✓ / Valeriana ✓ |
| swap | plant-03 ↔ plant-04 | Galium verum ✓ / Campanula ✓ |
| swap | plant-14 ↔ plant-20 | Ranunculus auricomus ✓ (plant-14 orphaned) |
| rotate | plant-13 ← 15 ← 16 ← 18 | Delphinium ✓ / Dianthus ✓ / Geranium pratense ✓ |

### 4 remaining orphans — NEED RE-SHOOTING (P1)

No correct photo exists anywhere in the current set:

| ID | Slug (approx) | Declared species | Currently shows | Action |
|----|---------------|------------------|-----------------|--------|
| plant-12 | `oxeye-daisy` | *Leucanthemum vulgare* | Small white Erigeron/anemone | **Re-shoot** |
| plant-14 | `lupine` | *Lupinus polyphyllus* | A vetch (Vicia) | **Re-shoot** |
| plant-18 | `meadow-vetchling` | *Lathyrus pratensis* | Magenta pea legume | **Re-shoot** |
| plant-19 | `astragalus` | *Oxytropis jacutica* | Cream Pedicularis (lousewort) | **Re-shoot** |

**Impact:** Users see botanical plate matching declared species but field photo showing a different plant — undermines encyclopedia credibility.

**Workflow after re-shoot:**
1. Place original in `_src_originals/whatsapp/`
2. Update `IMAGE_MAP` in both `plants.ts` and `optimize-images.cjs` (or unified map)
3. Run `node scripts/optimize-images.cjs`
4. Re-verify by eye before committing
5. Run `node scripts/export-native-data.cjs`

### Entries needing better framing (not wrong species)

| ID | Species | Issue | Action |
|----|---------|-------|--------|
| plant-07 | `Pratum mixtum` (generic meadow) | Flax bloom dominates; invites misidentification | Re-frame or add caption caveat |
| plant-17 | *Fragaria vesca* | Strawberry not compositional focus | Re-shoot with trifoliate leaves centered |

---

## Botanical plates

| Collection | Plates | Status |
|------------|--------|--------|
| Yakutia | 23/23 | All match declared species |
| Mongolia | 11/24 | 13 photo-only (`mongolia-12` … `mongolia-24`) |

### Important caveat (from photo audit §5)

> All reference plates are stylised/AI-generated with **fabricated citations** (invented "Tab." numbers, invented authorities/dates). Plate botanical rendering may be correct while citations are not real historical works.

**Recommended action:** Add standing caveat to About/Legal/credits page.

---

## Taxonomy & data quality issues

### CONTENT-T01 — Duplicate Latin name for two entries

| **File** | `src/data/plants.ts:154-212` |
| **Entries** | `bellflower-clustered` and `bellflower-deep` |
| **Issue** | Both use `latin: 'Campanula glomerata'` |
| **Impact** | Wikipedia links identical; users can't distinguish entries taxonomically |
| **Fix** | Verify if they should be subspecies/variants or merge entries |

### CONTENT-T02 — Synthetic Latin binomial

| **File** | `src/data/plants.ts:244-272` |
| **Entry** | `wildflower-meadow` |
| **Latin** | `Pratum mixtum` — not a real species |
| **Status** | Intentional generic meadow entry (documented in photo audit) |
| **Fix** | Ensure UI communicates "mixed meadow" not a single species; consider removing from species-indexed features |

### CONTENT-T03 — plant-05 kept despite audit flag

| **Entry** | `bellflower-deep` / plant-05 |
| **Audit** | Initially flagged mismatch (geranium leaves in frame) |
| **Resolution** | Kept as *Campanula glomerata* — purple clustered heads plausible; geranium is co-occurring |
| **Status** | Acceptable but composition could improve |

### CONTENT-T04 — Mongolia data completeness

24 entries with varying illustration coverage. No photo↔species audit performed for Mongolia collection yet.

**Recommended:** Run same audit methodology on Mongolia field photos before public launch of that collection.

---

## i18n content gaps

| Key / pattern | Issue | Severity |
|---------------|-------|----------|
| `seasons.${plant.bloomingSeason}` | Dynamic keys — coverage grep must enumerate data values | Medium (fixed for sah, pattern remains) |
| `home.plateCount` Russian `_other` | Broken plural for some counts | Medium |
| `gallery.photoCount` English | "1 photos" grammar error | Medium |
| `about.intro` / `about.mission` | Yakutia-only when Mongolia active | High |
| Sakha dead keys | `sah.json:62,110-119` never referenced | Low |

---

## Legal & privacy content accuracy

### CONTENT-L01 — "No external network requests"

| **Platforms** | Web (`LegalPage.tsx:59-65`), Android (`LegalScreen.kt:191-197`), iOS (`LegalView.swift:131-135`) |
| **Claims** | App makes no external network requests with user data |
| **Reality** | Wikipedia links (user-initiated); native apps fetch remote `full` images for deep zoom |
| **Fix** | Clarify: no automatic tracking/analytics; user-initiated external links excluded; optional full-res image fetches |

### CONTENT-L02 — Legal copy not in shared locale pipeline

Duplicated across 3 platforms × 3 languages = 9 copies to maintain. See R-D07 / R-N01.

---

## SEO content gaps

| Issue | Impact |
|-------|--------|
| Sitemap missing 24 Mongolia URLs | Mongolia collection invisible to crawlers |
| No per-plant OG tags on web | Poor social sharing previews |
| `LASTMOD` in sitemap hardcoded | Stale crawl signals |

---

## Content quality checklist for new plants

- [ ] Field photo verified: in-focus subject matches declared Latin
- [ ] Botanical plate matches declared species (if present)
- [ ] `md5` check — no duplicate illustration files
- [ ] All three locale files have keys for dynamic fields (`seasons.*`, `categories.*`)
- [ ] Slug unique across all countries (`countries.ts` assertion)
- [ ] Run `optimize-images.cjs` or `optimize-mongolia.cjs`
- [ ] Run `gen-illustration-manifest.cjs`
- [ ] Run `export-native-data.cjs`
- [ ] Run `gen-sitemap.cjs`
- [ ] Eye-verify on production build (`npm run build && npm run preview`)

---

*See also: [`2026-07-06-photo-species-audit.md`](./2026-07-06-photo-species-audit.md) for full 23-entry adjudication table*