# Add the 6 missing botanical plates

Six plants currently have no botanical illustration (their originals were
wrong-species duplicates). Generate one plate per plant with the prompts below,
save them here with the **exact filenames**, then run one command — the app
picks them up automatically.

## Steps

1. Generate each image (Midjourney, DALL·E, Firefly, SDXL — any tool).
2. Save each into **this folder** (`_src_originals/illustrations/`) with the exact
   filename in the table. PNG or JPG is fine.
3. From the project root run:

   ```bash
   npm run optimize:illustrations
   ```

   This creates the thumb/medium/full `.webp` variants in `public/plants/…` **and**
   regenerates `src/data/available-illustrations.ts`. The plate now appears on the
   plant's detail page (as the primary image) and the gallery marker turns on —
   no code change needed.

| Save as              | Plant (EN)            | Species                 |
|----------------------|-----------------------|-------------------------|
| `plant-18-ill.png`   | Meadow Vetchling      | *Lathyrus pratensis*    |
| `plant-19-ill.png`   | Yakut Oxytropis       | *Oxytropis jacutica*    |
| `plant-20-ill.png`   | Goldilocks Buttercup  | *Ranunculus auricomus*  |
| `plant-21-ill.png`   | Siberian Geranium     | *Geranium sibiricum*    |
| `plant-22-ill.png`   | Valerian              | *Valeriana officinalis* |
| `plant-23-ill.png`   | Siberian Lily (Sardaana) | *Lilium pensylvanicum* |

Aspect ratio ~**2:3 portrait** to match the existing plates.

## Shared style (paste before each species line)

> Antique 19th-century hand-colored botanical engraving of a single whole plant
> specimen (flower, stem, leaves and roots shown), in the style of a vintage
> herbarium plate. Printed on aged ivory laid paper with soft foxing, faint brown
> age spots and a slightly deckled edge. Delicate engraved linework with muted,
> naturalistic watercolor tint. A few small labelled detail studies (flower parts,
> seed) beside the main specimen. Elegant engraved caption at the bottom with the
> Latin name in italic serif and the common name, plus a small plate number.
> Centered composition, generous cream margins, no modern text, no watermark,
> portrait 2:3.

## Per-species (append to the shared style)

- **plant-18-ill** — *Lathyrus pratensis* (Meadow Vetchling): slender climbing
  legume with bright yellow pea-shaped flowers, pinnate leaves ending in curling
  tendrils. Caption: “Lathyrus pratensis — Meadow Vetchling”.
- **plant-19-ill** — *Oxytropis jacutica* (Yakut Oxytropis): low cushion-forming
  legume, dense head of pink-purple pea flowers, silvery pinnate leaves, stout
  taproot; alpine endemic. Caption: “Oxytropis jacutica — Yakut Oxytropis”.
- **plant-20-ill** — *Ranunculus auricomus* (Goldilocks Buttercup): glossy
  golden-yellow five-petalled flowers, rounded lobed basal leaves and finely
  divided stem leaves, fibrous roots. Caption: “Ranunculus auricomus — Goldilocks
  Buttercup”.
- **plant-21-ill** — *Geranium sibiricum* (Siberian Geranium): small pale-pink
  five-petalled flowers, deeply cut palmate leaves, trailing stems, slender roots.
  Caption: “Geranium sibiricum — Siberian Geranium”.
- **plant-22-ill** — *Valeriana officinalis* (Valerian): tall stem topped with
  rounded umbel-like clusters of tiny white-and-pink flowers, opposite pinnate
  leaves, fibrous rhizome. Caption: “Valeriana officinalis — Valerian”.
- **plant-23-ill** — *Lilium pensylvanicum* (Siberian Lily / Sardaana): a single
  striking fiery orange lily with upward-facing, dark-spotted recurved petals,
  whorled lance-shaped leaves, scaly bulb with roots — the iconic flower of
  Yakutia. Caption: “Lilium pensylvanicum — Siberian Lily (Sardaana)”.
