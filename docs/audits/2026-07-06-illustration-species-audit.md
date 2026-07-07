# Illustration ↔ Species Audit (botanical plates)

**Date:** 2026-07-06
**Method:** Rendered labeled contact sheets of every `*-ill.webp` plate and read
each plate's printed Latin caption against the plant it is assigned to
(`plant.imageId` → `{imageId}-ill`, expected = `plant.names.latin`).
**Scope:** 23 Yakutia plates + 11 Mongolia plates.

---

## Yakutia — 23/23 correct ✓

Every Yakutia plate's printed caption matches its plant's declared species
(Achillea millefolium, Linum sibiricum, Galium verum, Campanula glomerata ×2,
Veronica longifolia, Pratum mixtum, Ranunculus acris, Anemone sylvestris,
Filipendula ulmaria, Vicia cracca, Leucanthemum vulgare, Delphinium elatum,
Lupinus polyphyllus, Dianthus deltoides, Geranium pratense, Fragaria vesca,
Lathyrus pratensis, Oxytropis jacutica, Ranunculus auricomus, Geranium
sibiricum, Valeriana officinalis, Lilium pensylvanicum). **No change.**

## Mongolia — 0/11 correct ✗ (all plates depicted unrelated species)

The AI-generated Mongolia plates each depict a *different* real Mongolian
steppe plant with a fabricated "A. Petrov 1892 / Wild Mongolian…" caption —
and none of the depicted species is in the dataset. This is **not** a
re-ordering problem: no plate matched any Mongolia plant.

| Plate | Assigned plant | Plate actually depicts (caption) |
|-------|----------------|-----------------------------------|
| mongolia-01 | Marigold (Tagetes erecta) | Salsola laricifolia |
| mongolia-02 | Cornflower (Centaurea cyanus) | Arnebia guttata |
| mongolia-03 | Petunia | Gentiana macrophylla |
| mongolia-04 | Pansy (Viola ×wittrockiana) | Caragana spinosa |
| mongolia-05 | Ornamental Kale (Brassica oleracea) | Rosularia paniculata |
| mongolia-06 | Dusty Miller (Jacobaea maritima) | Stipa krylovii |
| mongolia-07 | Bedstraw (Galium verum) | Aconitum turczaninowii |
| mongolia-08 | Alfalfa (Medicago sativa) | Dryopteris (fern) |
| mongolia-09 | Rose (Rosa rugosa) | Saussurea involucrata |
| mongolia-10 | Yarrow (Achillea millefolium) | Achnatherum splendens |
| mongolia-11 | Dahlia (Dahlia pinnata) | Caryopteris mongholica |

---

## Fix applied

- **Removed** the 9 wrong plates whose species do not occur anywhere in the
  dataset (mongolia-01/02/03/04/05/06/08/09/11). Those plants now render
  **photo-only** (correct behavior — no misleading plate).
- **Reused the correct Yakutia plate** for the two Mongolia species that also
  occur in Yakutia (same species ⇒ the same plate is genuinely correct):
  - Mongolia **bedstraw** (Galium verum) → Yakutia `plant-03-ill` copied to `mongolia-07-ill`
  - Mongolia **yarrow** (Achillea millefolium) → Yakutia `plant-01-ill` copied to `mongolia-10-ill`
- Regenerated `available-illustrations.ts` (now 25 slugs: 23 Yakutia + 2 Mongolia).
- `export-native-data.cjs` now cleans destination image roots before copying,
  so removed plates don't linger stale in native bundles.
- Updated the stale "first 11 have plates" comment in `mongolia.ts`.

**Verified:** `hasIllustration()` → Yakutia 23, Mongolia 2 (bedstraw, yarrow);
web + both native apps build; native bundles carry exactly the 2 correct plates.

## Follow-up (not done)

The 9 photo-only Mongolia plants need genuine, species-matched plates
(re-generated or sourced) before they can show an illustration again. Dropping a
correct `<imageId>-ill` into the pipeline + `npm run optimize` re-lights it.
