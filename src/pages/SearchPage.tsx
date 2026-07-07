import { Language } from "../types";
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search as SearchIcon } from 'lucide-react';
import { getImagePath, getIllustrationPath } from '../data/plants';
import { usePlants, useSettings } from '../context/SettingsContext';
import { filterPlants } from '../utils/plantSearch';

export default function SearchPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Language;
  const plants = usePlants();
  const { settings } = useSettings();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return filterPlants(plants, query, lang, { deep: true });
  }, [plants, query, lang]);

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-6">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Big search input — stays centered and comfortable; results below
            fan out into the full width. */}
        <div className="relative mb-8 max-w-2xl mx-auto">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('catalog.searchPlaceholder')}
            aria-label={t('catalog.searchPlaceholder')}
            className="
              w-full pl-12 pr-5 py-4
              bg-card rounded-2xl
              border border-hairline outline-none
              text-base text-ink
              placeholder:text-ink-muted
              focus:border-forest/50 focus:ring-2 focus:ring-forest/20
              transition-colors
            "
          />
        </div>

        {/* Results */}
        {query.trim() && (
          results.length === 0 ? (
            <p className="text-center text-ink-muted py-8">{t('catalog.noResults')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {results.map((plant, index) => {
                const platePath = getIllustrationPath(plant, 'thumb');
                const hasPlate = !!platePath;
                const imgSrc = platePath ?? getImagePath(plant, 'thumb');

                return (
                  <motion.div
                    key={plant.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(index * 0.03, 0.25), duration: 0.2 }}
                  >
                    <Link
                      to={`/plant/${plant.slug}`}
                      className="
                        flex items-center gap-4 p-3 h-full
                        rounded-xl border border-hairline bg-card
                        hover:bg-cream-dark/50 hover:border-hairline-strong
                        transition-colors no-underline
                      "
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-hairline bg-parchment">
                        <img
                          src={imgSrc}
                          alt={plant.names[lang]}
                          className={hasPlate ? 'plate-thumb' : 'w-full h-full object-cover'}
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-semibold text-ink truncate">
                          {plant.names[lang]}
                        </h3>
                        {settings.showLatin && (
                          <p className="text-xs text-ink-muted italic truncate">
                            {plant.names.latin}
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )
        )}

        {/* Empty state — browse prompt */}
        {!query.trim() && (
          <div className="text-center py-12">
            <SearchIcon className="w-12 h-12 text-ink-muted/30 mx-auto mb-4" />
            <p className="text-ink-muted text-sm">{t('catalog.searchPlaceholder')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
