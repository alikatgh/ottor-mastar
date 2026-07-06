/**
 * swap-photos.cjs — swap the optimized field-photo files between two plants.
 *
 * Built to fix a photo↔species mismatch found in the 2026-07-06 audit: two
 * entries had each other's field photo (the plates were correct; only the
 * photos were swapped). The WhatsApp source originals are no longer in the
 * repo, so we cannot re-run optimize-images.cjs to regenerate — we swap the
 * already-optimized webp variants directly, across all three size buckets.
 *
 * It does NOT touch the `-ill` botanical plates (those are keyed the same but
 * were verified correct) and does NOT touch src/data/plants.ts.
 *
 * Also swaps the matching IMAGE_MAP entries in optimize-images.cjs so the
 * provenance map stays truthful if the originals are ever restored.
 *
 * Usage:  node scripts/swap-photos.cjs plant-10 plant-11
 * Catches: nothing silently — missing files throw before any rename happens.
 */
const fs = require('fs');
const path = require('path');

const [a, b] = process.argv.slice(2);
if (!a || !b) {
  console.error('Usage: node scripts/swap-photos.cjs <plant-A> <plant-B>');
  process.exit(1);
}

const SIZES = ['thumb', 'medium', 'full'];
const OUT = path.join(__dirname, '../public/plants');

// Pre-flight: every file must exist before we move anything.
for (const size of SIZES) {
  for (const id of [a, b]) {
    const f = path.join(OUT, size, `${id}.webp`);
    if (!fs.existsSync(f)) {
      console.error(`❌ Missing, aborting before any change: ${f}`);
      process.exit(1);
    }
  }
}

for (const size of SIZES) {
  const fa = path.join(OUT, size, `${a}.webp`);
  const fb = path.join(OUT, size, `${b}.webp`);
  const tmp = path.join(OUT, size, `__swap_tmp.webp`);
  fs.renameSync(fa, tmp);
  fs.renameSync(fb, fa);
  fs.renameSync(tmp, fb);
  console.log(`✓ swapped ${size}/${a}.webp <-> ${size}/${b}.webp`);
}

// Keep the provenance map consistent.
const mapPath = path.join(__dirname, 'optimize-images.cjs');
let src = fs.readFileSync(mapPath, 'utf8');
const grab = (id) => {
  const m = src.match(new RegExp(`'${id}': '([^']*)'`));
  return m ? m[1] : null;
};
const va = grab(a);
const vb = grab(b);
if (va && vb) {
  src = src.replace(`'${a}': '${va}'`, `'${a}': '__TMP__'`)
           .replace(`'${b}': '${vb}'`, `'${b}': '${va}'`)
           .replace(`'${a}': '__TMP__'`, `'${a}': '${vb}'`);
  fs.writeFileSync(mapPath, src);
  console.log(`✓ swapped IMAGE_MAP provenance for ${a} <-> ${b}`);
} else {
  console.log('… IMAGE_MAP entries not found; left unchanged.');
}

console.log('Done.');
