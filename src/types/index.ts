export type Language = 'sah' | 'ru' | 'en';

export type LocalizedString = Record<Language, string>;
export type LocalizedStringWithLatin = LocalizedString & { latin: string };

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
