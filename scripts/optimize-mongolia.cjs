const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Optimize the Mongolia field photos into the same webp variants the app serves
 * for Yakutia, but under public/mongolia/. Mirrors scripts/optimize-images.cjs.
 *
 * IMAGE_MAP picks ONE best photo per species from the ~83 camera originals in
 * _src_originals/mongolia/ (many are repeat shots of the same plant); the keys
 * (`mongolia-01` … ) are the imageIds referenced in src/data/mongolia.ts.
 * Source originals stay OUTSIDE public/ so the large files never enter the build.
 *
 * Re-run after adding/regrouping: `node scripts/optimize-mongolia.cjs`.
 */
const IMAGE_MAP = {
  'mongolia-01': '20260706_133552.jpg', // Tagetes erecta — African marigold
  'mongolia-02': '20260706_130631.jpg', // Centaurea cyanus — cornflower
  'mongolia-03': '20260706_131236.jpg', // Petunia — petunia
  'mongolia-04': '20260706_131309.jpg', // Viola × wittrockiana — garden pansy
  'mongolia-05': '20260706_133127.jpg', // Brassica oleracea — ornamental kale
  'mongolia-06': '20260706_131307.jpg', // Jacobaea maritima — dusty miller
  'mongolia-07': '20260706_133318.jpg', // Galium verum — lady's bedstraw
  'mongolia-08': '20260706_133407.jpg', // Medicago sativa — alfalfa
  'mongolia-09': '20260706_130614.jpg', // Rosa rugosa — rugosa rose
  'mongolia-10': '20260706_130732.jpg', // Achillea millefolium — yarrow
  'mongolia-11': '20260706_130641.jpg', // Dahlia pinnata — dahlia
  'mongolia-12': '20260706_130519.jpg', // Picea pungens — blue spruce
  'mongolia-13': '20260706_130553.jpg', // Salix — willow
  'mongolia-14': '20260706_130943.jpg', // Taraxacum officinale — dandelion
  'mongolia-15': '20260706_132643.jpg', // Artemisia — wormwood
  'mongolia-16': '20260706_133332.jpg', // Phlomoides tuberosa — Jerusalem sage
  'mongolia-17': '20260706_132346.jpg', // Astragalus — milkvetch
  'mongolia-18': '20260706_125944.jpg', // Potentilla — cinquefoil
  'mongolia-19': '20260706_132800.jpg', // Plantago major — plantain
  'mongolia-20': '20260706_132923.jpg', // Leymus chinensis — Chinese ryegrass
  'mongolia-21': '20260706_125955.jpg', // Dracocephalum — dragonhead
  'mongolia-22': '20260706_130602.jpg', // Viburnum opulus — guelder rose
  'mongolia-23': '20260706_132431.jpg', // Crepis — hawksbeard
  'mongolia-24': '20260706_130635.jpg', // Cosmos sulphureus — sulphur cosmos

  // Gallery frames (extra photos of the SAME plant, ordered close→far after the
  // primary). Each `<id>-N` is verified by eye to match its species — the raw
  // camera bursts interleave different flowerbed plants, so these are curated,
  // not taken whole. Referenced by the `gallery` array in src/data/mongolia.ts.
  'mongolia-03-2': '20260706_131224.jpg', // Petunia — purple cluster
  'mongolia-03-3': '20260706_131220.jpg', // Petunia — wider bed
  'mongolia-05-2': '20260706_133131.jpg', // Ornamental kale — purple-centre head
  'mongolia-08-2': '20260706_133414.jpg', // Alfalfa — flower spike detail
  'mongolia-12-2': '20260706_130524.jpg', // Blue spruce — branch detail
  'mongolia-16-2': '20260706_133334.jpg', // Jerusalem sage — second spike
  'mongolia-20-2': '20260706_132931.jpg', // Chinese ryegrass — tuft

  // New species (Jul 2026 shoot) — primary is the closest frame, `-2` the wider
  // (close→far). Each verified by eye and matched to its generated plate.
  'mongolia-25': '20260711_131816.jpg',   // Chamerion angustifolium — fireweed
  'mongolia-25-2': '20260711_131804.jpg', // fireweed — wider spray
  'mongolia-26': '20260712_135335.jpg',   // Cirsium arvense — creeping thistle
  'mongolia-26-2': '20260712_135308.jpg', // thistle — wider stand
  'mongolia-27': '20260711_134113.jpg',   // Euphorbia esula — leafy spurge
  'mongolia-27-2': '20260711_134109.jpg', // spurge — wider mat
  'mongolia-28': '20260711_132759.jpg',   // Allium senescens — wild onion
  'mongolia-28-2': '20260711_132753.jpg', // wild onion — wider
  'mongolia-29': '20260712_140601.jpg',   // Silene repens — creeping catchfly
};

const INPUT_DIR = path.join(__dirname, '../_src_originals/mongolia');
const OUTPUT_DIR = path.join(__dirname, '../public/mongolia');

const SIZES = {
  thumb: { width: 400, height: 400, fit: 'cover' },
  medium: { width: 800, height: 1200, fit: 'inside' },
  full: { width: 1600, height: null, fit: 'inside' },
};

async function run() {
  for (const size of Object.keys(SIZES)) {
    fs.mkdirSync(path.join(OUTPUT_DIR, size), { recursive: true });
  }

  const entries = Object.entries(IMAGE_MAP);
  console.log(`Optimizing ${entries.length} Mongolia images...`);

  for (const [id, filename] of entries) {
    const inputPath = path.join(INPUT_DIR, filename);
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Missing: ${filename}`);
      continue;
    }
    for (const [sizeName, config] of Object.entries(SIZES)) {
      const outputPath = path.join(OUTPUT_DIR, sizeName, `${id}.webp`);
      const resizeOptions = { width: config.width, fit: config.fit, withoutEnlargement: true };
      if (config.height) resizeOptions.height = config.height;
      // .rotate() honours EXIF orientation from the phone camera.
      await sharp(inputPath).rotate().resize(resizeOptions).webp({ quality: 80 }).toFile(outputPath);
    }
    console.log(`✅ ${id}  ←  ${filename}`);
  }
  console.log('Done.');
}

run();
