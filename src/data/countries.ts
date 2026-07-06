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
  /**
   * Slug of the plant used as this collection's cover / hero. Its illustration
   * plate (falling back to the field photo) is the encyclopedia frontispiece.
   */
  heroSlug: string;
  plants: Plant[];
}

/**
 * Registry definition BEFORE normalization. `imageBase` lives here once per
 * country; it is stamped onto every plant below so no dataset has to repeat it.
 */
interface CountryDef {
  id: CountryId;
  imageBase: string;
  heroSlug: string;
  /** Datasets omit `imageBase`; it is stamped on during normalization below. */
  plants: Omit<Plant, 'imageBase'>[];
}

const COUNTRY_DEFS: Record<CountryId, CountryDef> = {
  yakutia: {
    id: 'yakutia',
    imageBase: '/plants',
    // Sardaana (Siberian Lily) — the most iconic Yakutian plate.
    heroSlug: 'daylily',
    plants: yakutiaPlants,
  },
  mongolia: {
    id: 'mongolia',
    imageBase: '/mongolia',
    heroSlug: 'mn-marigold',
    plants: mongoliaPlants,
  },
};

/**
 * The one choke point for `imageBase`: every plant in every country gets its
 * collection's base stamped on here, at registry build time. Datasets stay free
 * of per-plant image-root bookkeeping and image helpers can rely on the field
 * always being present. Identical resulting behavior to the previous
 * '/plants' default for Yakutia and the mongolia.ts `.map()` for Mongolia.
 */
export const COUNTRIES: Record<CountryId, Country> = Object.fromEntries(
  (Object.entries(COUNTRY_DEFS) as [CountryId, CountryDef][]).map(([id, def]) => [
    id,
    {
      id: def.id,
      imageBase: def.imageBase,
      heroSlug: def.heroSlug,
      plants: def.plants.map((p) => ({ ...p, imageBase: def.imageBase })),
    },
  ])
) as Record<CountryId, Country>;

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

/**
 * The hero (cover) plant for a country — its `heroSlug` resolved to the Plant.
 * Consumers render the plate (falling back to the field photo). Falls back to
 * the collection's last entry if `heroSlug` ever fails to match.
 */
export function getHeroPlant(id: CountryId): Plant | undefined {
  const { heroSlug, plants } = COUNTRIES[id];
  return plants.find((p) => p.slug === heroSlug) ?? plants[plants.length - 1];
}

/**
 * Dev-time guard: slugs MUST stay unique across every country because
 * findPlantBySlug and the shared /plant/<slug> route resolve globally. A
 * collision would silently shadow one plant.
 *
 * Exposed as a function (not a module-load side effect) and called from
 * main.tsx under `import.meta.env.DEV`. Keeping it out of module scope means
 * this file references neither `process` nor `import.meta`, so it still
 * transpiles cleanly to CommonJS for scripts/export-native-data.cjs and
 * gen-sitemap.cjs (both compile it with bare `tsc --module commonjs`).
 */
export function assertUniqueSlugs(): void {
  const seen = new Map<string, CountryId>();
  for (const country of Object.values(COUNTRIES)) {
    for (const plant of country.plants) {
      const owner = seen.get(plant.slug);
      if (owner) {
        throw new Error(
          `Duplicate plant slug "${plant.slug}" in "${country.id}" — already ` +
            `used by "${owner}". Slugs must be unique across all countries.`
        );
      }
      seen.set(plant.slug, country.id);
    }
  }
}
