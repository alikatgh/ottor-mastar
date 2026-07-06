import { Plant } from '../types';

/**
 * Mongolia dataset — plants and trees that grow in Mongolia.
 *
 * HOW TO ADD PLANTS (mirrors the Yakutia pipeline):
 * 1. Put optimized webp images under `public/mongolia/thumb|medium|full/<imageId>.webp`
 *    (source originals go in `_src_originals/mongolia/`, NOT in public/ — see
 *    BUG_JOURNAL: publicDir is copied verbatim into every build).
 * 2. Add entries to RAW below using the same Plant shape as `plants.ts`
 *    (trilingual names/description/medicinalUses/habitat + latin, bloomingSeason,
 *    categories). Keep slugs unique ACROSS countries — `findPlantBySlug` in
 *    `countries.ts` searches every dataset.
 * 3. That's it: the Mongolia option in Settings enables itself as soon as this
 *    array is non-empty (see `isCountryAvailable`). Botanical plates additionally
 *    need a Mongolia manifest before `hasIllustration` can return true.
 */
const RAW: Omit<Plant, 'imageBase'>[] = [];

// Every Mongolia plant resolves its images under /mongolia instead of /plants.
export const mongoliaPlants: Plant[] = RAW.map((p) => ({ ...p, imageBase: '/mongolia' }));
