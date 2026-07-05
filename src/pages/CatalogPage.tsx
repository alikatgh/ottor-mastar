import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, ChevronRight, Leaf, AlertTriangle, Flower2, UtensilsCrossed } from 'lucide-react';
import { getImagePath, CATEGORIES, getPlantsSortedByName } from '../data/plants';
import CategoryBadge from '../components/common/CategoryBadge';

const CATEGORY_FILTERS = [
  { key: 'all', icon: null },
  { key: CATEGORIES.MEDICINAL, icon: Leaf },
  { key: CATEGORIES.EDIBLE, icon: UtensilsCrossed },
  { key: CATEGORIES.ORNAMENTAL, icon: Flower2 },
  { key: CATEGORIES.POISONOUS, icon: AlertTriangle },
];

export default function CatalogPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as import("../types").Language;
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = useMemo(() => {
    let result = getPlantsSortedByName(lang);

    if (activeCategory !== 'all') {
      result = result.filter((p) => p.categories.includes(activeCategory));
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((p) =>
        p.names.sah.toLowerCase().includes(q) ||
        p.names.ru.toLowerCase().includes(q) ||
        p.names.en.toLowerCase().includes(q) ||
        p.names.latin.toLowerCase().includes(q)
      );
    }

    return result;
  }, [lang, search, activeCategory]);

  return (
    <div className="min-h-screen pt-16 pb-20 sm:pb-6">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Title */}
        <h1 className="font-heading text-3xl font-semibold text-ink mb-6">
          {t('catalog.title')}
        </h1>

        {/* Search bar */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('catalog.searchPlaceholder')}
            className="
              w-full pl-10 pr-4 py-3
              bg-cream-dark rounded-xl
              border-none outline-none
              text-sm text-ink
              placeholder:text-ink-muted
              focus:ring-2 focus:ring-forest/30
              transition-shadow
            "
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          {CATEGORY_FILTERS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`
                flex items-center gap-1.5 px-4 py-2
                rounded-full text-sm font-medium whitespace-nowrap
                transition-all duration-200
                ${activeCategory === key
                  ? 'bg-forest text-white shadow-md'
                  : 'bg-cream-dark text-ink-muted hover:bg-cream-dark/80'
                }
              `}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {key === 'all' ? t('gallery.allPlants') : t(`categories.${key}`)}
            </button>
          ))}
        </div>

        {/* Plant list */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-ink-muted">
              <p>{t('catalog.noResults')}</p>
            </div>
          ) : (
            filtered.map((plant, index) => {
              const imgSrc = getImagePath(plant, 'thumb');

              return (
                <motion.div
                  key={plant.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.3 }}
                >
                  <Link
                    to={`/plant/${plant.slug}`}
                    className="
                      flex items-center gap-4 p-3
                      rounded-2xl hover:bg-cream-dark
                      transition-colors duration-200
                      no-underline group
                    "
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={imgSrc}
                        alt={plant.names[lang]}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-ink truncate">
                        {plant.names[lang]}
                      </h3>
                      <p className="text-xs text-ink-muted italic truncate">
                        {plant.names.latin}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {plant.categories.map((cat) => (
                          <CategoryBadge key={cat} category={cat} />
                        ))}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-4 h-4 text-ink-muted/50 flex-shrink-0 group-hover:text-ink-muted transition-colors" />
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
