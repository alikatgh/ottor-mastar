const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Drop new botanical-plate sources (PNG/JPG named `plant-NN-ill.png`) here.
// Kept outside public/ so large source art is never copied into the build.
const INPUT_DIR = path.join(__dirname, '../_src_originals/illustrations');
const OUTPUT_DIR = path.join(__dirname, '../public/plants');

const SIZES = {
  thumb: { width: 400, height: 400, fit: 'cover' },
  medium: { width: 800, height: 1200, fit: 'inside' },
  full: { width: 1600, height: null, fit: 'inside' }
};

async function optimizeIllustrations() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.log(`No source folder at ${INPUT_DIR} — nothing to optimize. Add plant-NN-ill.png files there.`);
    return;
  }
  const files = fs
    .readdirSync(INPUT_DIR)
    .filter((f) => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.webp'));

  if (files.length === 0) {
    console.log(`No illustration sources found in ${INPUT_DIR}.`);
    return;
  }

  console.log(`Starting optimization for ${files.length} illustrations...`);

  for (const filename of files) {
    const inputPath = path.join(INPUT_DIR, filename);
    const basename = path.basename(filename, path.extname(filename)); // e.g. plant-01-ill
    
    try {
      const image = sharp(inputPath);
      
      for (const [sizeName, config] of Object.entries(SIZES)) {
        const outputPath = path.join(OUTPUT_DIR, sizeName, `${basename}.webp`);
        
        const resizeOptions = {
          width: config.width,
          fit: config.fit,
          withoutEnlargement: true
        };
        
        if (config.height) {
          resizeOptions.height = config.height;
        }

        await image
          .resize(resizeOptions)
          .webp({ quality: 80 })
          .toFile(outputPath);
      }
      
      console.log(`✅ Processed: ${basename}`);
    } catch (err) {
      console.error(`❌ Error processing ${filename}:`, err.message);
    }
  }

  console.log('🎉 Illustration optimization complete!');
}

optimizeIllustrations().catch(console.error);
