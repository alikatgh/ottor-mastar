import type { CountryId } from '../data/countries';

/**
 * First-launch, fully-OFFLINE default for which collection and language a new
 * visitor sees, from the device's own timezone + locale region. NO IP lookup,
 * no network, no tracking — that keeps the app's privacy promise intact.
 *
 * Policy (confirmed with the owner):
 *   - Mongolia            → Mongolia collection, Mongolian (mn)
 *   - Russia (incl. Sakha)→ Yakutia collection,  Sakha (sah)   ← "Sakha by default"
 *   - Rest of the world   → Yakutia collection,  English (en)
 *
 * Yakutia and the rest of Russia resolve to the SAME result, so we don't need to
 * isolate the Sakha Republic from Russian timezones — both just default to Sakha.
 *
 * This ONLY decides the initial state when nothing is stored. Settings and the
 * language switcher always override and persist; a returning visitor keeps their
 * own choice (see SettingsContext.loadSettings + i18n detection order).
 */
export interface GeoDefault {
  country: CountryId;
  language: 'sah' | 'ru' | 'en' | 'mn' | 'zh';
}

const MONGOLIA_TZ = new Set(['Asia/Ulaanbaatar', 'Asia/Choibalsan', 'Asia/Hovd']);

// Every IANA zone that lies inside the Russian Federation (Kaliningrad → Anadyr),
// used only as a fallback when the locale carries no region subtag.
const RUSSIA_TZ = new Set([
  'Europe/Kaliningrad', 'Europe/Moscow', 'Europe/Simferopol', 'Europe/Kirov',
  'Europe/Volgograd', 'Europe/Astrakhan', 'Europe/Saratov', 'Europe/Ulyanovsk',
  'Europe/Samara', 'Asia/Yekaterinburg', 'Asia/Omsk', 'Asia/Novosibirsk',
  'Asia/Barnaul', 'Asia/Tomsk', 'Asia/Novokuznetsk', 'Asia/Krasnoyarsk',
  'Asia/Irkutsk', 'Asia/Chita', 'Asia/Yakutsk', 'Asia/Khandyga',
  'Asia/Vladivostok', 'Asia/Ust-Nera', 'Asia/Magadan', 'Asia/Sakhalin',
  'Asia/Srednekolymsk', 'Asia/Kamchatka', 'Asia/Anadyr',
]);

function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    return '';
  }
}

/** ISO region (e.g. "RU", "MN", "US") from the device locale, or "" if unknown. */
function deviceRegion(): string {
  if (typeof navigator === 'undefined') return '';
  const tag = navigator.language || (navigator.languages && navigator.languages[0]) || '';
  if (!tag) return '';
  try {
    // maximize() infers a region for bare tags like "ru" → "ru-Cyrl-RU".
    return new Intl.Locale(tag).maximize().region || '';
  } catch {
    const m = tag.match(/-([A-Z]{2})\b/i);
    return m ? m[1].toUpperCase() : '';
  }
}

export function detectGeoDefault(): GeoDefault {
  const tz = deviceTimeZone();
  const region = deviceRegion();

  if (region === 'MN' || MONGOLIA_TZ.has(tz)) {
    return { country: 'mongolia', language: 'mn' };
  }
  if (region === 'RU' || RUSSIA_TZ.has(tz)) {
    return { country: 'yakutia', language: 'sah' };
  }
  return { country: 'yakutia', language: 'en' };
}
