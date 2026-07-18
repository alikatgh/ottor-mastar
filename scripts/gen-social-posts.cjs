#!/usr/bin/env node
/**
 * Generate a "Plant of the week" social calendar straight from the app's own
 * data (shared/plants.json). Each entry is a ready-to-post unit: the image
 * list (real field photos FIRST, vintage plate LAST), a story caption, the
 * plant's page link for the first comment, hashtags, and the disclaimer.
 *
 * Voice rules (docs/FACEBOOK_STRATEGY.md): no emojis, no em-dashes (plain "-"),
 * story tone. The uniqueness is the real close-up photos - never lead with the
 * illustration.
 *
 * Targeting:
 *   --country mongolia  → Mongolia species, MONGOLIAN caption first, English
 *                         below. Every post carries a National Garden Park
 *                         (Үндэсний цэцэрлэгт хүрээлэн) hook - planted
 *                         ornamentals get "you pass it strolling the park",
 *                         wild species get "we photographed it growing wild
 *                         there" (all field photos were shot in that park).
 *   --country yakutia   → Yakutia species, Russian caption first.
 *   (no --country)      → everything, Russian first.
 *
 * The emitted docs/social/calendar[-country].json is what the Meta Graph API
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

// Every Mongolia field photo was shot in Ulaanbaatar's National Garden Park
// (Үндэсний цэцэрлэгт хүрээлэн, park.ub.gov.mn), so every species truthfully
// gets a park hook - in one of two variants that never overstate:
//   planted ornamentals → "you often pass it strolling the park"
//   wild species        → "we photographed it growing wild in the park"
const isPlanted = (p) =>
  /park|flowerbed|ornamental|цэцэрлэг|мандал|чимэглэл/i.test(
    `${p.habitat?.en || ''} ${p.habitat?.mn || ''}`,
  );
const parkHookMN = (p) =>
  isPlanted(p)
    ? 'Үндэсний цэцэрлэгт хүрээлэнгээр зугаалахад энэ ургамал олонтаа тохиолддог.'
    : 'Энэ ургамлын гэрэл зургийг бид Үндэсний цэцэрлэгт хүрээлэнд авсан - тэнд зэрлэгээрээ ургадаг.';

const HASHTAGS = {
  mongolia:
    '#Монгол #Улаанбаатар #Үндэснийцэцэрлэгтхүрээлэн #ургамал #цэцэг #байгаль #Mongolia #Ulaanbaatar #plants #botanicalart',
  yakutia:
    '#Саха #Якутия #Sakha #Yakutia #этноботаника #botanicalart #herbarium #wildflowers',
};
const DISCLAIMER = {
  mn: 'Зөвхөн боловсролын болон соёлын зорилгоор - эмнэлгийн зөвлөгөө биш.',
  ru: 'Иллюстрация в винтажном ботаническом стиле. Культурная справка - не медицинский совет.',
};

function captionMongolia(p) {
  const name = p.names.mn || p.names.en;
  const folk = firstSentence(p.medicinal?.mn);
  return [
    `${name} · ${p.names.latin}`,
    '',
    [parkHookMN(p), p.description?.mn || ''].filter(Boolean).join(' '),
    folk,
    '',
    `- English -`,
    `${p.names.en}. ${firstSentence(p.description?.en)}`,
    '',
    DISCLAIMER.mn,
    '',
    HASHTAGS.mongolia,
  ].join('\n').replace(/\n{3,}/g, '\n\n').replace(/\s*—\s*/g, ' - ');
}

function captionRussian(p) {
  const folk = firstSentence(p.medicinal?.ru);
  return [
    `${p.names.ru} · ${p.names.latin} · ${p.names.en}`,
    '',
    p.description?.ru || '',
    folk,
    '',
    DISCLAIMER.ru,
    '',
    HASHTAGS.yakutia,
  ].join('\n').replace(/\n{3,}/g, '\n\n').replace(/\s*—\s*/g, ' - ');
}

// Flatten (optionally filtered by country). Image order is the voice rule:
// real field photos first (main photo, then gallery frames discovered from the
// actual files on disk), the vintage plate closes the set.
const plants = [];
for (const c of data.countries) {
  if (countryArg && c.id !== countryArg) continue;
  const dir = path.join(ROOT, 'public', c.imageBase.replace(/^\//, ''), 'full');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  for (const p of c.plants) {
    const galleryRe = new RegExp('^' + p.imageId + '-\\d+\\.webp$');
    const frames = [
      p.imageId,
      ...files.filter((f) => galleryRe.test(f)).sort().map((f) => f.replace(/\.webp$/, '')),
    ];
    if (p.hasIllustration) frames.push(p.imageId + '-ill');
    plants.push({
      country: c.id,
      slug: p.slug,
      names: p.names,
      description: p.description,
      habitat: p.habitat,
      medicinal: p.medicinalUses,
      imageUrls: frames.map((id) => `${HOST}${c.imageBase}/full/${id}.webp`),
      pageUrl: `${HOST}/plant/${p.slug}`,
    });
  }
}

function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// 3 posts a week (Mon/Wed/Fri), varied formats - a page that only reposts one
// template reads as a bot. Monday tells the week's plant story; Wednesday is a
// guess-the-plant close-up teasing NEXT Monday's species (its reveal); Friday
// is a text-only status rotating between folk fact, park question, app tip,
// and the "where next" ask that feeds the funding narrative.
function captionQuizMongolia(nextPlant) {
  return [
    'Энэ ямар ургамал вэ?',
    '',
    'Улаанбаатарын Үндэсний цэцэрлэгт хүрээлэнд авсан зураг. Таамаглалаа коммэнтоор бичээрэй - даваа гарагт бүрэн түүхийг нь хуваалцана.',
    '',
    '- English -',
    'Guess the plant. Photographed in the National Garden Park, Ulaanbaatar. Full story on Monday.',
    '',
    '#Монгол #Улаанбаатар #Үндэснийцэцэрлэгтхүрээлэн #ургамал #цэцэг #таавар',
  ].join('\n').replace(/\s*—\s*/g, ' - ');
}

function captionStatusMongolia(p, weekIdx) {
  const name = p.names.mn || p.names.en;
  const folk = firstSentence(p.medicinal?.mn);
  const variants = [
    folk
      ? `Мэдэх үү? ${name} - ${folk.charAt(0).toLowerCase()}${folk.slice(1)}\n\nТа энэ ургамлын талаар өөр юу мэдэх вэ? Коммэнтоор хуваалцаарай.`
      : `Та ${name}-ийг таньдаг уу? Энэ долоо хоногийн ургамлын түүхийг манай хуудаснаас уншаарай.`,
    'Та Үндэсний цэцэрлэгт хүрээлэнгээр хамгийн сүүлд хэзээ зугаалсан бэ? Ямар цэцэг, ургамал анзаарагдсан бэ? Коммэнтоор бичээрэй - бид тэр ургамлын түүхийг олж хуваалцъя.',
    'Оттор Мастар апп интернэтгүйгээр бүрэн ажилладаг. Хээр, ууланд ч ургамлаа таньж болно. Бүх ургамал монгол, англи, латин нэртэй. Үнэгүй, сурталчилгаагүй.\n\nApp Store: https://apps.apple.com/app/id6789648576',
    'Бид Улаанбаатарын Үндэсний цэцэрлэгт хүрээлэн, Якутын нэгэн тосгоны замаас эхэлсэн. Дараа нь хаашаа алхах ёстой вэ? Санал болгож буй газраа коммэнтоор бичээрэй.',
  ];
  return (variants[weekIdx % variants.length] + '\n\n#Монгол #Улаанбаатар #ургамал #цэцэг')
    .replace(/\s*—\s*/g, ' - ');
}

const list = count > 0 ? plants.slice(0, count) : plants;
const calendar = [];
for (let i = 0; i < list.length; i++) {
  const p = list[i];
  calendar.push({
    week: i + 1,
    format: 'plant',
    date: startArg ? addDays(startArg, i * 7) : null,
    slug: p.slug,
    imageUrls: p.imageUrls,
    caption: PRIMARY === 'mn' ? captionMongolia(p) : captionRussian(p),
    firstComment: `${p.pageUrl}  ·  App Store: https://apps.apple.com/app/id6789648576`,
  });
  if (PRIMARY === 'mn') {
    // Wednesday quiz: a DIFFERENT angle (2nd photo frame) of next week's plant.
    const next = list[i + 1];
    if (next) {
      const photos = next.imageUrls.filter((u) => !u.includes('-ill.webp'));
      calendar.push({
        week: i + 1,
        format: 'quiz',
        date: startArg ? addDays(startArg, i * 7 + 2) : null,
        slug: next.slug,
        imageUrls: [photos[photos.length - 1]],
        caption: captionQuizMongolia(next),
        firstComment: null,
      });
    }
    // Friday status: text-only, rotating format.
    calendar.push({
      week: i + 1,
      format: 'status',
      date: startArg ? addDays(startArg, i * 7 + 4) : null,
      slug: p.slug,
      imageUrls: [],
      caption: captionStatusMongolia(p, i),
      firstComment: null,
    });
  }
}

const outDir = path.join(ROOT, 'docs/social');
fs.mkdirSync(outDir, { recursive: true });
const suffix = countryArg ? `-${countryArg}` : '';
fs.writeFileSync(path.join(outDir, `calendar${suffix}.json`), JSON.stringify(calendar, null, 2) + '\n');

const md = [`# Plant-of-the-week calendar${countryArg ? ` - ${countryArg}` : ''}\n`,
  `_Generated from shared/plants.json - ${calendar.length} posts, ${PRIMARY.toUpperCase()} first._\n`];
for (const e of calendar) {
  md.push(`## Week ${e.week} · ${e.format}${e.date ? ` · ${e.date}` : ''} - ${e.slug}`);
  if (e.imageUrls.length) md.push(`**Images:** ${e.imageUrls.join('  ·  ')}\n`);
  md.push('```\n' + e.caption + '\n```');
  md.push(`**First comment:** ${e.firstComment}\n`);
}
fs.writeFileSync(path.join(outDir, `calendar${suffix}.md`), md.join('\n') + '\n');

console.log(`wrote docs/social/calendar${suffix}.json + .md (${calendar.length} posts, ${PRIMARY} first)`);
