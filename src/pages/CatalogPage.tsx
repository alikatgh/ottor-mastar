import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { getImagePath, getIllustrationPath, CATEGORIES } from '../data/plants';
import { usePlants, useSettings } from '../context/SettingsContext';
import CategoryBadge from '../components/common/CategoryBadge';
import { filterPlants } from '../utils/plantSearch';
import { loc } from '../types';

// Blooming-season sort: earliest start first, longest season breaking ties.
const SEASON_ORDER = [
  'spring',
  'may-june',
  'may-july',
  'june-july',
  'june-august',
  'summer',
  'july-august',
  'autumn',
];
const seasonRank = (s: string) => {
  const i = SEASON_ORDER.indexOf(s);
  return i === -1 ? SEASON_ORDER.length : i;
};

const CATEGORY_FILTERS = [
  'all',
  CATEGORIES.MEDICINAL,
  CATEGORIES.EDIBLE,
  CATEGORIES.ORNAMENTAL,
  CATEGORIES.POISONOUS,
];

export default function CatalogPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as import("../types").Language;
  const plants = usePlants();
  const { settings } = useSettings();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = useMemo(() => {
    let result = [...plants].sort((a, b) =>
      loc(a.names, lang).localeCompare(loc(b.names, lang), lang)
    );
    if (settings.catalogSort === 'season') {
      result.sort(
        (a, b) =>
          seasonRank(a.bloomingSeason) - seasonRank(b.bloomingSeason) ||
          loc(a.names, lang).localeCompare(loc(b.names, lang), lang)
      );
    }

    if (activeCategory !== 'all') {
      result = result.filter((p) => p.categories.includes(activeCategory));
    }

    if (search.trim()) {
      result = filterPlants(result, search, lang, { deep: true });
    }

    return result;
  }, [plants, lang, search, activeCategory, settings.catalogSort]);

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-6">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Title */}
        <div className="flex items-baseline justify-between mb-6">
          <h1 className="font-heading text-3xl font-semibold text-ink">
            {t('catalog.title')}
          </h1>
          <span className="text-sm text-ink-muted">{filtered.length}</span>
        </div>

        {/* Search bar — capped so it stays readable in the wider container */}
        <div className="relative mb-5 max-w-3xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('catalog.searchPlaceholder')}
            aria-label={t('catalog.searchPlaceholder')}
            className="
              w-full pl-10 pr-4 py-3
              bg-card rounded-xl
              border border-hairline outline-none
              text-sm text-ink
              placeholder:text-ink-muted
              focus:border-forest/50 focus:ring-2 focus:ring-forest/20
              transition-colors
            "
          />
        </div>

        {/* Category filters — text-only chips; active changes color, never geometry */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          {CATEGORY_FILTERS.map((key) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              aria-pressed={activeCategory === key}
              className={`
                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                border transition-colors duration-200
                ${activeCategory === key
                  ? 'bg-forest text-white border-forest'
                  : 'bg-transparent text-ink-light border-hairline hover:bg-cream-dark'
                }
              `}
            >
              {key === 'all' ? t('gallery.allPlants') : t(`categories.${key}`)}
            </button>
          ))}
        </div>

        {/* Plant list — encyclopedia entries with plate numbers */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-ink-muted">
            <p>{t('catalog.noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((plant, index) => {
              // Index entries show the plate, like an encyclopedia's plate list;
              // the field photo appears on the entry's own page.
              const platePath = getIllustrationPath(plant, 'thumb');
              const hasPlate = !!platePath;
              const imgSrc = platePath ?? getImagePath(plant, 'thumb');

              return (
                <motion.div
                  key={plant.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(index * 0.02, 0.25), duration: 0.25 }}
                >
                  <Link
                    to={`/plant/${plant.slug}`}
                    className="
                      group relative flex h-full min-h-[120px] overflow-hidden
                      rounded-2xl border border-hairline bg-card
                      hover:bg-cream-dark/50 hover:border-hairline-strong
                      transition-colors duration-200
                      no-underline
                    "
                  >
                    {/* Full-bleed leading plate/photo — fills the card's left
                        edge, clipped by the card's corners (the iOS "leading
                        image panel" card anatomy). */}
                    <div className="w-28 h-full shrink-0 overflow-hidden bg-parchment">
                      <img
                        src={imgSrc}
                        alt={plant.names[lang]}
                        className={hasPlate ? 'plate-thumb' : 'w-full h-full object-cover'}
                        loading="lazy"
                      />
                    </div>

                    {/* Info — optically centered in the card; the plate number
                        lives as a corner stamp so it never pushes the text down. */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center pl-4 pr-11 py-3">
                      <h3 className="text-[17px] font-semibold text-ink truncate">
                        {plant.names[lang]}
                      </h3>
                      {settings.showLatin && (
                        <p className="text-sm text-ink-muted italic truncate mt-0.5">
                          {plant.names.latin}
                        </p>
                      )}
                      {/* flex-wrap: chips stay single-line pills and stack
                          instead of overflowing the card (long Sakha labels). */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {plant.categories.map((cat) => (
                          <CategoryBadge key={cat} category={cat} />
                        ))}
                      </div>
                    </div>

                    {/* Plate number — top-right catalog stamp (iOS parity). */}
                    <span className="absolute top-2.5 right-3 text-xs text-ink-muted tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
