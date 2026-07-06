const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGE_MAP = {
  'plant-01': 'WhatsApp Image 2026-07-04 at 12.36.22.jpeg',
  'plant-02': 'WhatsApp Image 2026-07-04 at 12.36.23.jpeg',
  'plant-03': 'WhatsApp Image 2026-07-04 at 12.36.26.jpeg',
  'plant-04': 'WhatsApp Image 2026-07-04 at 12.36.26 (1).jpeg',
  'plant-05': 'WhatsApp Image 2026-07-04 at 12.36.27.jpeg',
  'plant-06': 'WhatsApp Image 2026-07-04 at 12.36.29.jpeg',
  'plant-07': 'WhatsApp Image 2026-07-04 at 12.36.29 (1).jpeg',
  'plant-08': 'WhatsApp Image 2026-07-04 at 12.36.30.jpeg',
  'plant-09': 'WhatsApp Image 2026-07-04 at 12.36.31.jpeg',
  'plant-10': 'WhatsApp Image 2026-07-04 at 12.36.32 (1).jpeg',
  'plant-11': 'WhatsApp Image 2026-07-04 at 12.36.32.jpeg',
  'plant-12': 'WhatsApp Image 2026-07-04 at 12.36.32 (2).jpeg',
  'plant-13': 'WhatsApp Image 2026-07-04 at 12.36.33 (2).jpeg',
  'plant-14': 'WhatsApp Image 2026-07-04 at 12.36.36 (2).jpeg',
  'plant-15': 'WhatsApp Image 2026-07-04 at 12.36.34.jpeg',
  'plant-16': 'WhatsApp Image 2026-07-04 at 12.36.36.jpeg',
  'plant-17': 'WhatsApp Image 2026-07-04 at 12.36.35.jpeg',
  'plant-18': 'WhatsApp Image 2026-07-04 at 12.36.33.jpeg',
  'plant-19': 'WhatsApp Image 2026-07-04 at 12.36.36 (1).jpeg',
  'plant-20': 'WhatsApp Image 2026-07-04 at 12.36.33 (1).jpeg',
  'plant-21': 'WhatsApp Image 2026-07-04 at 12.36.37 (1).jpeg',
  'plant-22': 'WhatsApp Image 2026-07-04 at 12.36.37.jpeg',
  'plant-23': 'WhatsApp Image 2026-07-04 at 12.36.38.jpeg',
};

// Source photos live OUTSIDE public/ so the (large, unused-at-runtime)
// originals are not copied into the production build. The app serves only the
// optimized /plants/*.webp variants written to OUTPUT_DIR.
const INPUT_DIR = path.join(__dirname, '../_src_originals/whatsapp');
const OUTPUT_DIR = path.join(__dirname, '../public/plants');

const SIZES = {
  thumb: { width: 400, height: 400, fit: 'cover' }, // Square crop for grid
  medium: { width: 800, height: 1200, fit: 'inside' }, // Detail view
  full: { width: 1600, height: null, fit: 'inside' } // Zoom view
};

async function optimizeImages() {
  // Create output directories
  for (const size of Object.keys(SIZES)) {
    const dir = path.join(OUTPUT_DIR, size);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const entries = Object.entries(IMAGE_MAP);
  console.log(`Starting optimization for ${entries.length} images...`);

  for (const [plantId, filename] of entries) {
    const inputPath = path.join(INPUT_DIR, filename);
    
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Missing: ${filename}`);
      continue;
    }

    try {
      const image = sharp(inputPath);
      
      // Generate each size
      for (const [sizeName, config] of Object.entries(SIZES)) {
        const outputPath = path.join(OUTPUT_DIR, sizeName, `${plantId}.webp`);
        
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
      
      console.log(`✅ Processed: ${plantId}`);
    } catch (err) {
      console.error(`❌ Error processing ${filename}:`, err.message);
    }
  }

  console.log('🎉 Image optimization complete!');
}

optimizeImages().catch(console.error);
