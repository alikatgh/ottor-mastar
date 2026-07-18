#!/usr/bin/env node
/**
 * Generate a "Plant of the week" social calendar straight from the app's own
 * data (shared/plants.json). Each entry is a ready-to-post unit: the botanical
 * plate URL, a story-style caption, the plant's page link for the first
 * comment, hashtags, and the disclaimer.
 *
 * Targeting (see docs/FACEBOOK_STRATEGY.md):
 *   --country mongolia  → Mongolia species, MONGOLIAN caption first, English
 *                         below. Park-grown species get an Ulaanbaatar Central
 *                         Park hook ("the flower you walked past") — the geo
 *                         relevance that makes locals stop and share.
 *   --country yakutia   → Yakutia species, Russian caption first, English below.
 *   (no --country)      → everything, Russian first.
 *
 * The emitted docs/social/calendar.json is exactly what the Meta Graph API
 * poster (scripts/post-to-facebook.cjs) consumes.
 *
 * Usage:  node scripts/gen-social-posts.cjs [YYYY-MM-DD startMonday] [count] [--country mongolia]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'shared/plants.json'), 'utf8'));
const HOST = data.imageHost || 'https://ottormastar.aulenor.com';

const argv = process.argv.slice(2);
const countryArg = (() => {
  const i = argv.indexOf('--country');
  return i >= 0 ? argv[i + 1] : null;
})();
const positional = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--country');
const startArg = positional[0] || null;
const count = parseInt(positional[1] || '0', 10);

// Primary caption language per market; English always rides below for reach.
const PRIMARY = countryArg === 'mongolia' ? 'mn' : 'ru';

const firstSentence = (s) => (s ? String(s).split(/(?<=[.!?])\s/)[0] : '');
const isParkPlant = (p) => /park|цэцэрлэг/i.test(`${p.habitat?.en || ''} ${p.habitat?.mn || ''}`);

// Mongolian "you walked past it in Central Park" hook — only for species that
// actually grow there, so it never lies about a steppe plant.
const parkHookMN = () =>
  'Улаанбаатарын Төв цэцэрлэгт хүрээлэнгээр зугаалахад энэ цэцэг олонтаа тохиолддог. 🌳';

const HASHTAGS = {
  mongolia:
    '#Монгол #Улаанбаатар #Төвцэцэрлэгтхүрээлэн #ургамал #цэцэг #байгаль #Mongolia #Ulaanbaatar #plants #botanicalart',
  yakutia:
    '#Саха #Якутия #Sakha #Yakutia #этноботаника #botanicalart #herbarium #wildflowers',
};
const DISCLAIMER = {
  mn: 'Зөвхөн боловсролын болон соёлын зорилгоор — эмнэлгийн зөвлөгөө биш.',
  ru: 'Иллюстрация в винтажном ботаническом стиле. Культурная справка — не медицинский совет.',
};

function captionMongolia(p) {
  const name = p.names.mn || p.names.en;
  const lead = isParkPlant(p) ? parkHookMN() : (p.description?.mn || '');
  const extra = isParkPlant(p) ? (p.description?.mn || '') : '';
  const folk = firstSentence(p.medicinal?.mn);
  return [
    `🌸 ${name} · ${p.names.latin}`,
    '',
    [lead, extra].filter(Boolean).join(' '),
    folk,
    '',
    `— English —`,
    `🌍 ${p.names.en}. ${firstSentence(p.description?.en)}`,
    '',
    DISCLAIMER.mn,
    '',
    HASHTAGS.mongolia,
  ].join('\n').replace(/\n{3,}/g, '\n\n');
}

function captionRussian(p) {
  const folk = firstSentence(p.medicinal?.ru);
  return [
    `🌿 ${p.names.ru} · ${p.names.latin} · ${p.names.en}`,
    '',
    p.description?.ru || '',
    folk,
    '',
    DISCLAIMER.ru,
    '',
    HASHTAGS.yakutia,
  ].join('\n').replace(/\n{3,}/g, '\n\n');
}

// Flatten (optionally filtered by country) with the plate as the image.
const plants = [];
for (const c of data.countries) {
  if (countryArg && c.id !== countryArg) continue;
  for (const p of c.plants) {
    const file = p.hasIllustration ? `${p.imageId}-ill.webp` : `${p.imageId}.webp`;
    plants.push({
      country: c.id,
      slug: p.slug,
      names: p.names,
      description: p.description,
      habitat: p.habitat,
      medicinal: p.medicinalUses,
      imageUrl: `${HOST}${c.imageBase}/full/${file}`,
      pageUrl: `${HOST}/plant/${p.slug}`,
    });
  }
}

function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const list = count > 0 ? plants.slice(0, count) : plants;
const calendar = list.map((p, i) => ({
  week: i + 1,
  date: startArg ? addDays(startArg, i * 7) : null,
  slug: p.slug,
  imageUrl: p.imageUrl,
  caption: PRIMARY === 'mn' ? captionMongolia(p) : captionRussian(p),
  firstComment: `👉 ${p.pageUrl}  ·  App Store: https://apps.apple.com/app/id6789648576`,
}));

const outDir = path.join(ROOT, 'docs/social');
fs.mkdirSync(outDir, { recursive: true });
const suffix = countryArg ? `-${countryArg}` : '';
fs.writeFileSync(path.join(outDir, `calendar${suffix}.json`), JSON.stringify(calendar, null, 2) + '\n');

const md = [`# Plant-of-the-week calendar${countryArg ? ` — ${countryArg}` : ''}\n`,
  `_Generated from shared/plants.json — ${calendar.length} posts, ${PRIMARY.toUpperCase()} first._\n`];
for (const e of calendar) {
  md.push(`## Week ${e.week}${e.date ? ` · ${e.date}` : ''} — ${e.slug}`);
  md.push(`**Image:** ${e.imageUrl}\n`);
  md.push('```\n' + e.caption + '\n```');
  md.push(`**First comment:** ${e.firstComment}\n`);
}
fs.writeFileSync(path.join(outDir, `calendar${suffix}.md`), md.join('\n') + '\n');

console.log(`wrote docs/social/calendar${suffix}.json + .md (${calendar.length} posts, ${PRIMARY} first)`);
