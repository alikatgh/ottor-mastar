#!/usr/bin/env node
/**
 * Generate a "Plant of the Week" social calendar straight from the app's own
 * data (shared/plants.json). Each entry is a ready-to-post unit: an absolute
 * image URL (the botanical plate, or the photo when there's no plate), a
 * bilingual Russian/English caption, the plant's page link for the first
 * comment, hashtags, and the mandatory disclaimer.
 *
 * This is BOTH the human calendar and the machine feed for auto-posting: the
 * emitted docs/social/calendar.json is exactly what a Meta Graph API poster
 * consumes (see docs/FACEBOOK_STRATEGY.md → automation).
 *
 * Usage:  node scripts/gen-social-posts.cjs [YYYY-MM-DD startMonday] [count]
 *   e.g.  node scripts/gen-social-posts.cjs 2026-07-27 12
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'shared/plants.json'), 'utf8'));
const HOST = data.imageHost || 'https://ottormastar.aulenor.com';

const startArg = process.argv[2];
const count = parseInt(process.argv[3] || '0', 10);

// Flatten every plant with its country image base; prefer the plate as the image.
const plants = [];
for (const c of data.countries) {
  for (const p of c.plants) {
    const file = p.hasIllustration ? `${p.imageId}-ill.webp` : `${p.imageId}.webp`;
    plants.push({
      slug: p.slug,
      names: p.names,
      habitat: p.habitat,
      medicinal: p.medicinalUses,
      season: p.bloomingSeason,
      imageUrl: `${HOST}${c.imageBase}/full/${file}`,
      pageUrl: `${HOST}/plant/${p.slug}`,
    });
  }
}

const firstSentence = (s) => (s ? String(s).split(/(?<=[.!?])\s/)[0] : '');
const SEASON_RU = {
  'may-june': 'цветёт в мае–июне', 'may-july': 'цветёт в мае–июле',
  'june-july': 'цветёт в июне–июле', 'june-august': 'цветёт в июне–августе',
  'july-august': 'цветёт в июле–августе', spring: 'цветёт весной',
};

const HASHTAGS =
  '#Саха #Якутия #Sakha #Yakutia #этноботаника #botanicalart #herbarium #wildflowers';
const DISCLAIMER_RU =
  'Иллюстрация в винтажном ботаническом стиле. Культурная справка — не медицинский совет.';

function caption(p) {
  const season = SEASON_RU[p.season] ? ` · ${SEASON_RU[p.season]}` : '';
  const folk = firstSentence(p.medicinal?.ru);
  return [
    `🌿 ${p.names.ru} · ${p.names.latin} · ${p.names.en}`,
    '',
    `${p.habitat?.ru || ''}${season}`.trim(),
    folk,
    '',
    DISCLAIMER_RU,
    '',
    HASHTAGS,
  ].filter((l) => l !== undefined).join('\n').replace(/\n{3,}/g, '\n\n');
}

// Build the schedule: one plant per week from startMonday (weekly cadence).
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
  caption: caption(p),
  firstComment: `👉 ${p.pageUrl}  ·  App Store: https://apps.apple.com/app/id6789648576`,
}));

const outDir = path.join(ROOT, 'docs/social');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'calendar.json'), JSON.stringify(calendar, null, 2) + '\n');

// Human-readable preview
const md = ['# Plant-of-the-week calendar\n',
  `_Generated from shared/plants.json — ${calendar.length} posts. Edit captions here or regenerate._\n`];
for (const e of calendar) {
  md.push(`## Week ${e.week}${e.date ? ` · ${e.date}` : ''} — ${e.slug}`);
  md.push(`**Image:** ${e.imageUrl}\n`);
  md.push('```\n' + e.caption + '\n```');
  md.push(`**First comment:** ${e.firstComment}\n`);
}
fs.writeFileSync(path.join(outDir, 'calendar.md'), md.join('\n') + '\n');

console.log(`wrote docs/social/calendar.json + calendar.md (${calendar.length} posts)`);
