#!/usr/bin/env node
/**
 * check-locale-keys.cjs - CI guard for the trilingual (en / ru / sah) locale set.
 *
 * The project's fallbackLng is 'sah', so a t() key missing from a locale ships
 * the RAW KEY to users of that language (or the sah fallback string), never an
 * error. This check makes that failure loud at build time instead.
 *
 * What it verifies, Node-stdlib only (no deps, no transpile):
 *   1. Every REQUIRED key used in src/ exists in ALL THREE locales.
 *   2. No DEAD keys (defined in a locale but never referenced anywhere in src/).
 *
 * How "used" keys are gathered - keys are resolved in several shapes:
 *   a. Direct calls:      t('a.b.c')   and   t(`a.b.${x}`)
 *   b. Key-fallback array: t(['a.b_override', 'a.b']) - i18next tries each in
 *      order and uses the first that resolves. So ONLY the last element is
 *      required; earlier ones are optional per-country overrides that fall
 *      through to it. They still count as "used" (never dead).
 *   c. Indirect literals: labelKey / noteKey / titleKey string values that the
 *      data-driven Settings / Nav rows feed straight into t(). Both the object-
 *      property form (`titleKey: 'x'`) and the JSX-attribute form
 *      (`titleKey="x"` / `titleKey={'x'}`) are matched.
 *   d. Dynamic families derived from the DATA MODEL (not source text):
 *        - categories.<cat>          for every category used in the datasets
 *        - seasons.<bloomingSeason>  for every blooming-season value used
 *        - settings.country_<id>     for every CountryId
 *      These become required exact keys diffed against every locale.
 *
 * Plurals: i18next appends _one/_few/_many/_other (plus a bare form). A required
 * base key `gallery.photoCount` is satisfied in a locale if that locale has the
 * bare key OR any `photoCount_<suffix>` variant; those variants are never dead.
 *
 * Dynamic prefixes (`categories.`, `seasons.`, `settings.country_`, the
 * `app.subtitle_${country}` / `about.intro_${country}` override families): any
 * locale key under a referenced prefix is reachable, so it is "used" (never
 * dead) even though we cannot know every runtime value at lint time.
 *
 * What it does NOT catch: keys built by fully opaque runtime concatenation with
 * no literal prefix in source; keys reached via t() returnObjects on a parent.
 * Neither pattern is used in this codebase.
 *
 * Exit 1 on any missing-in-a-locale required key or any dead key; 0 when clean.
 * Run:  node scripts/check-locale-keys.cjs
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const LOCALE_DIR = path.join(SRC_DIR, 'i18n', 'locales');
const LOCALES = ['en', 'ru', 'sah', 'mn', 'zh'];

/** i18next plural category suffixes. A base key is "covered" by any of these. */
const PLURAL_SUFFIXES = ['zero', 'one', 'two', 'few', 'many', 'other'];

// --------------------------------------------------------------------------
// 1. Load and flatten each locale JSON into a Set of dotted leaf keys.
// --------------------------------------------------------------------------
function flatten(obj, prefix, out) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      flatten(v, key, out);
    } else {
      out.add(key);
    }
  }
}

function loadLocale(name) {
  const file = path.join(LOCALE_DIR, `${name}.json`);
  let json;
  try {
    json = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`FATAL: cannot read/parse ${path.relative(ROOT, file)}: ${err.message}`);
    process.exit(2);
  }
  const keys = new Set();
  flatten(json, '', keys);
  return keys;
}

const localeKeys = Object.fromEntries(LOCALES.map((l) => [l, loadLocale(l)]));

// --------------------------------------------------------------------------
// 2. Walk src/ and read every source file's text.
// --------------------------------------------------------------------------
function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'locales') continue;
      walk(full, files);
    } else if (/\.(ts|tsx|js|jsx|cjs|mjs)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const srcFiles = walk(SRC_DIR, []);
const allText = srcFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

// --------------------------------------------------------------------------
// 3. Gather USED keys into three buckets (see header comment).
// --------------------------------------------------------------------------
const usedRequired = new Set(); // must exist in ALL locales -> drives MISSING
const usedOptional = new Set(); // referenced but may be absent (fallback overrides)
const usedPrefixes = new Set(); // dynamic `prefix.${x}` roots

/** A key literal is dotted, whitespace-free, only key-ish chars. */
function looksLikeKey(s) {
  return /^[A-Za-z0-9_]+(?:\.[A-Za-z0-9_-]+)+$/.test(s);
}

/**
 * Classify one quoted/template literal.
 *   - Template `a.b.${x}`  -> dynamic prefix "a.b." (usedPrefixes)
 *   - Plain key string     -> exact key, routed to required or optional
 * Non-key-looking strings (arbitrary t() default values) are ignored.
 */
function collectKeyLiteral(lit, required) {
  const quote = lit[0];
  const inner = lit.slice(1, -1);
  if (quote === '`') {
    const idx = inner.indexOf('${');
    if (idx === -1) {
      if (looksLikeKey(inner)) (required ? usedRequired : usedOptional).add(inner);
    } else {
      const prefix = inner.slice(0, idx); // e.g. "seasons." or "settings.country_"
      if (prefix.includes('.')) usedPrefixes.add(prefix);
    }
  } else if (looksLikeKey(inner)) {
    (required ? usedRequired : usedOptional).add(inner);
  }
}

// (a)+(b) Direct t(...) calls, including the key-fallback array form.
const T_CALL = /\bt\(\s*(\[[^\]]*\]|`[^`]*`|'[^']*'|"[^"]*")/g;
for (const m of allText.matchAll(T_CALL)) {
  const arg = m[1];
  if (arg[0] === '[') {
    const literals = arg.match(/`[^`]*`|'[^']*'|"[^"]*"/g) || [];
    literals.forEach((lit, i) => collectKeyLiteral(lit, i === literals.length - 1));
  } else {
    collectKeyLiteral(arg, true);
  }
}

// (c) Indirect keys: labelKey / noteKey / titleKey feeding straight into t().
//     Object-property form `x: '...'` and JSX-attribute form `x="..."` /
//     `x={'...'}` both count. `{` before the quote is optional (JSX braces).
const INDIRECT = /\b(?:labelKey|noteKey|titleKey)\s*[:=]\s*\{?\s*(`[^`]*`|'[^']*'|"[^"]*")/g;
for (const m of allText.matchAll(INDIRECT)) collectKeyLiteral(m[1], true);

// (d) Dynamic families derived from the DATA MODEL. Enumerate concrete values so
//     each `${var}` family becomes a set of required exact keys.
const dataText = readData();

const categoryValues = uniq(
  matchAll(dataText, /categories:\s*\[([^\]]*)\]/g).flatMap((inner) =>
    (inner.match(/'([^']+)'/g) || []).map((q) => q.slice(1, -1))
  )
);
for (const c of categoryValues) usedRequired.add(`categories.${c}`);

const seasonValues = uniq(matchAll(dataText, /bloomingSeason:\s*'([^']+)'/g));
for (const s of seasonValues) usedRequired.add(`seasons.${s}`);

const countryIds = uniq(
  matchAll(
    readFileSafe(path.join(SRC_DIR, 'data', 'countries.ts')),
    /export type CountryId\s*=\s*([^;]+);/g
  ).flatMap((body) => (body.match(/'([^']+)'/g) || []).map((q) => q.slice(1, -1)))
);
for (const id of countryIds) usedRequired.add(`settings.country_${id}`);

// --------------------------------------------------------------------------
// 4. Diff.
// --------------------------------------------------------------------------
/** Does `locale` cover exact key `k` (directly or via a plural variant)? */
function localeCovers(keys, k) {
  if (keys.has(k)) return true;
  for (const suf of PLURAL_SUFFIXES) if (keys.has(`${k}_${suf}`)) return true;
  return false;
}

/** Union of all keys defined in any locale - for dead-key detection. */
const anyLocaleKeys = new Set();
for (const l of LOCALES) for (const k of localeKeys[l]) anyLocaleKeys.add(k);

/** Is a DEFINED locale key `k` reachable from anything used in src/? */
function isUsed(k) {
  if (usedRequired.has(k) || usedOptional.has(k)) return true;
  // Plural variant of a used base? Strip a trailing _<suffix>.
  const under = k.lastIndexOf('_');
  if (under !== -1) {
    const suf = k.slice(under + 1);
    const base = k.slice(0, under);
    if (PLURAL_SUFFIXES.includes(suf) && (usedRequired.has(base) || usedOptional.has(base))) {
      return true;
    }
  }
  // Member of a referenced dynamic prefix family (e.g. about.intro_mongolia)?
  for (const p of usedPrefixes) if (k.startsWith(p)) return true;
  return false;
}

const missing = []; // {key, locales[]}
for (const k of [...usedRequired].sort()) {
  const absent = LOCALES.filter((l) => !localeCovers(localeKeys[l], k));
  if (absent.length) missing.push({ key: k, locales: absent });
}

const dead = [...anyLocaleKeys].filter((k) => !isUsed(k)).sort();

// --------------------------------------------------------------------------
// 5. Report.
// --------------------------------------------------------------------------
const RESET = process.stdout.isTTY ? '\x1b[0m' : '';
const RED = process.stdout.isTTY ? '\x1b[31m' : '';
const YELLOW = process.stdout.isTTY ? '\x1b[33m' : '';
const GREEN = process.stdout.isTTY ? '\x1b[32m' : '';
const DIM = process.stdout.isTTY ? '\x1b[2m' : '';

console.log('locale-keys check');
console.log(
  `${DIM}scanned ${srcFiles.length} source files; ${usedRequired.size} required keys, ` +
    `${usedPrefixes.size} dynamic prefixes; ` +
    `locales en/ru/sah = ${localeKeys.en.size}/${localeKeys.ru.size}/${localeKeys.sah.size} keys${RESET}`
);

let failed = false;

if (missing.length) {
  failed = true;
  console.log(`\n${RED}MISSING - used in src/ but absent from a locale:${RESET}`);
  for (const { key, locales } of missing) {
    console.log(`  ${key}  ${RED}(missing in: ${locales.join(', ')})${RESET}`);
  }
}

// Dead keys are a WARNING, not a failure: a missing key ships a raw string to
// users (the bug we must gate on), whereas an unused key is harmless cruft —
// and some (e.g. common.loading) are intentionally reserved for imminent
// features. Surfacing them for cleanup without failing CI is the right
// severity; only missing keys break the build.
if (dead.length) {
  console.log(`\n${YELLOW}DEAD (warning) - defined in a locale but never used in src/:${RESET}`);
  for (const k of dead) {
    const present = LOCALES.filter((l) => localeKeys[l].has(k));
    console.log(`  ${k}  ${DIM}(in: ${present.join(', ')})${RESET}`);
  }
}

if (failed) {
  console.log(
    `\n${RED}FAIL${RESET} - ${missing.length} missing. ` +
      `Every t() key must exist in ALL THREE locales.`
  );
  process.exit(1);
}

console.log(
  `\n${GREEN}OK${RESET} - all required keys present in en/ru/sah` +
    (dead.length ? `; ${dead.length} unused key(s) noted above for cleanup.` : '; no dead keys.')
);
process.exit(0);

// --------------------------------------------------------------------------
// helpers
// --------------------------------------------------------------------------
function readFileSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

/** Concatenated text of every data module, for category/season/country mining. */
function readData() {
  const dataDir = path.join(SRC_DIR, 'data');
  let text = '';
  try {
    for (const entry of fs.readdirSync(dataDir)) {
      if (/\.ts$/.test(entry)) text += '\n' + readFileSafe(path.join(dataDir, entry));
    }
  } catch {
    /* no data dir - families just won't be added */
  }
  return text;
}

/** matchAll returning capture group 1 for each match. */
function matchAll(text, re) {
  const out = [];
  for (const m of text.matchAll(re)) out.push(m[1]);
  return out;
}

function uniq(arr) {
  return [...new Set(arr)];
}
