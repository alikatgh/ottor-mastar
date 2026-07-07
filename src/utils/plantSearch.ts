import { Language, Plant } from '../types';

// Combining diacritical marks (U+0300–U+036F), left over after NFD decomposition.
const COMBINING_MARKS = /[̀-ͯ]/g;

/**
 * Normalize a string for search comparison: decompose (NFD) and strip
 * combining marks so the match is diacritic-insensitive, then lowercase.
 * This lets "yolgen" match "Yölgön", "ezhevika" match "ежевика", etc.,
 * across the Sakha/Russian/English/Latin name fields.
 */
export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .trim();
}

export interface FilterOptions {
  /** Also match description[lang] and medicinalUses[lang], not just names. */
  deep?: boolean;
}

/**
 * Filter plants by a free-text query.
 *
 * Always matches against names.sah / names.ru / names.en / names.latin.
 * When `deep` is set, also matches the active-language description and
 * medicinal-uses text. Matching is case- AND diacritic-insensitive.
 *
 * An empty/whitespace query returns the list unchanged (callers that want
 * an empty result for a blank query should guard before calling).
 */
export function filterPlants(
  plants: Plant[],
  query: string,
  lang: Language,
  { deep = false }: FilterOptions = {}
): Plant[] {
  const q = normalizeForSearch(query);
  if (!q) return plants;

  return plants.filter((p) => {
    // All name forms, including the optional Mongolian/Chinese ones so a
    // Mongolia plant is findable by its mn/zh name, not just sah/ru/en/latin.
    const haystacks = [
      p.names.sah, p.names.ru, p.names.en, p.names.latin,
      p.names.mn ?? '', p.names.zh ?? '',
    ];
    if (deep) {
      haystacks.push(p.description[lang] ?? '', p.medicinalUses[lang] ?? '');
    }
    return haystacks.some((h) => normalizeForSearch(h).includes(q));
  });
}
