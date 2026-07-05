export type Language = 'sah' | 'ru' | 'en';

export type LocalizedString = Record<Language, string>;
export type LocalizedStringWithLatin = LocalizedString & { latin: string };

export interface Plant {
  id: string;
  slug: string;
  imageId: string;
  names: LocalizedStringWithLatin;
  description: LocalizedString;
  medicinalUses: LocalizedString;
  habitat: LocalizedString;
  bloomingSeason: string;
  categories: string[];
  color: string;
}
