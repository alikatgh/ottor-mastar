# Mongolia botanical plates — generation & drop-in

Nine Mongolia plants are currently **photo-only** because their original
AI plates depicted the wrong species (see
`audits/2026-07-06-illustration-species-audit.md`). This doc has (1) ready-to-use
image-generation prompts to make correct, style-matched plates, and (2) the exact
drop-in steps so a new plate lights up automatically.

> Two Mongolia species already have correct plates (reused from Yakutia, same
> species): **yarrow** (`mongolia-10`, *Achillea millefolium*) and **bedstraw**
> (`mongolia-07`, *Galium verum*). Don't regenerate those.

## Drop-in pipeline (once you have the images)

1. Save each generated plate as a PNG named by its `imageId`, into
   `_src_originals/illustrations/` — e.g. `mongolia-01-ill.png`.
2. Run `npm run optimize:illustrations`.
   This writes `public/mongolia/{thumb,medium,full}/<id>-ill.webp` and
   regenerates `src/data/available-illustrations.ts` (the manifest that drives
   `hasIllustration()`), so the plant switches from photo-only to plate-led.
3. `node scripts/export-native-data.cjs` (carries the plates + updated
   `hasIllustration` into the iOS/Android bundles).
4. `npm run build` (web), then rebuild native if shipping those.

Hand me the images (or point me at a folder) and I'll run all of this end to end,
rebuild every platform, and redeploy the web.

## Shared style (paste as a prefix to every prompt)

> A vintage botanical illustration plate on aged cream/ivory paper, in the style
> of a 19th-century hand-coloured engraving (Curtis's Botanical Magazine / English
> Botany). A single species, botanically accurate, drawn whole: habit, leaves,
> and flowers, with one or two small magnified detail studies (flower, seed) to
> the side. Soft natural watercolour tints, fine ink linework, subtle foxing and
> deckled edges on the paper. Centered composition on a portrait 3:4 canvas, wide
> paper margin. A restrained caption in small caps at the bottom: the Latin
> binomial then the English common name — nothing else (no fabricated author,
> date, or plate-number citations). No modern elements, no borders, no watermark.

## Per-species prompts (the 9 photo-only plants)

| Source file | Species | Prompt suffix (append to the shared style) |
|-------------|---------|--------------------------------------------|
| `mongolia-01-ill.png` | Marigold | *Tagetes erecta* (African Marigold): erect annual, deeply divided dark-green pinnate leaves, large globular double flowerheads in warm orange-gold. Caption "TAGETES ERECTA · African Marigold". |
| `mongolia-02-ill.png` | Cornflower | *Centaurea cyanus* (Cornflower): slender grey-green stems, narrow leaves, vivid azure-blue fringed flowerheads. Caption "CENTAUREA CYANUS · Cornflower". |
| `mongolia-03-ill.png` | Petunia | *Petunia × atkinsiana* (Petunia): trailing soft-hairy stems, oval leaves, large trumpet/funnel flowers in violet-purple with a paler throat. Caption "PETUNIA × ATKINSIANA · Petunia". |
| `mongolia-04-ill.png` | Garden Pansy | *Viola × wittrockiana* (Garden Pansy): low tufted plant, rounded scalloped leaves, flat five-petalled "faced" flowers in purple/yellow/white. Caption "VIOLA × WITTROCKIANA · Garden Pansy". |
| `mongolia-05-ill.png` | Ornamental Kale | *Brassica oleracea* (Ornamental Kale): a low rosette of thick frilled/ruffled blue-green leaves fading to creamy-white or magenta at the centre. Caption "BRASSICA OLERACEA · Ornamental Kale". |
| `mongolia-06-ill.png` | Dusty Miller | *Jacobaea maritima* (Dusty Miller): mounded plant grown for its silvery-white, deeply lobed felted foliage; small yellow daisy flowers optional. Caption "JACOBAEA MARITIMA · Dusty Miller". |
| `mongolia-08-ill.png` | Alfalfa | *Medicago sativa* (Alfalfa): slender legume, trifoliate leaves, short racemes of blue-violet pea flowers, coiled spiral seed-pods shown in detail. Caption "MEDICAGO SATIVA · Alfalfa". |
| `mongolia-09-ill.png` | Rugosa Rose | *Rosa rugosa* (Rugosa Rose): thorny shrub stem, deeply veined "wrinkled" dark-green leaves, large single pink-magenta 5-petalled flower, round red-orange hip in detail. Caption "ROSA RUGOSA · Rugosa Rose". |
| `mongolia-11-ill.png` | Dahlia | *Dahlia pinnata* (Dahlia): sturdy stem, pinnate leaves, one large fully-double ball flowerhead in warm pink/red with a smaller bud. Caption "DAHLIA PINNATA · Dahlia". |

Any image model works (the originals were Gemini-generated). Generate at a
portrait resolution (e.g. 1024×1365) so the `full` webp stays crisp.
