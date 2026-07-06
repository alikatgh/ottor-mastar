import { Plant } from '../types';
import { plants as yakutiaPlants } from './plants';
import { mongoliaPlants } from './mongolia';

/**
 * Country registry — each country is a self-contained plant collection with its
 * own image root. The app always defaults to Yakutia; other countries become
 * selectable in Settings automatically once their dataset is non-empty.
 */
export type CountryId = 'yakutia' | 'mongolia';

export interface Country {
  id: CountryId;
  /** Public path root for this collection's images. */
  imageBase: string;
  plants: Plant[];
}

export const COUNTRIES: Record<CountryId, Country> = {
  yakutia: { id: 'yakutia', imageBase: '/plants', plants: yakutiaPlants },
  mongolia: { id: 'mongolia', imageBase: '/mongolia', plants: mongoliaPlants },
};

export const COUNTRY_IDS = Object.keys(COUNTRIES) as CountryId[];

export const DEFAULT_COUNTRY: CountryId = 'yakutia';

export function isCountryAvailable(id: CountryId): boolean {
  return COUNTRIES[id].plants.length > 0;
}

/**
 * Find a plant in ANY country's collection. Detail routes use this so a shared
 * /plant/<slug> link keeps working no matter which country the visitor has
 * selected. Slugs must therefore stay unique across countries.
 */
export function findPlantBySlug(slug: string): Plant | undefined {
  for (const country of Object.values(COUNTRIES)) {
    const plant = country.plants.find((p) => p.slug === slug);
    if (plant) return plant;
  }
  return undefined;
}
