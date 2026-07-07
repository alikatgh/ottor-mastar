export type Language = 'sah' | 'ru' | 'en' | 'mn' | 'zh';

/**
 * A field translated into the app's languages. `sah`/`ru`/`en` are the original
 * trilingual base present on every plant; `mn` (Mongolian) and `zh` (Chinese)
 * are added for the Mongolia collection. A lookup for an absent language falls
 * back to English — see `loc()`.
 */
export interface LocalizedString {
  sah: string;
  ru: string;
  en: string;
  mn?: string;
  zh?: string;
}
export type LocalizedStringWithLatin = LocalizedString & { latin: string };

/** Safe localized read: the requested language, or English as the universal fallback. */
export function loc(s: LocalizedString, lang: Language): string {
  return s[lang] ?? s.en;
}

export interface Plant {
  id: string;
  slug: string;
  imageId: string;
  illustrationId?: string;
  names: LocalizedStringWithLatin;
  description: LocalizedString;
  medicinalUses: LocalizedString;
  habitat: LocalizedString;
  bloomingSeason: string;
  /** Base public path for this plant's images; defaults to the Yakutia set at /plants. */
  imageBase?: string;
  categories: string[];
  color: string;
}
