import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ChevronsRight } from 'lucide-react';
import { getImagePath, getIllustrationPath, hasIllustration } from '../data/plants';
import { usePlants, useSettings } from '../context/SettingsContext';
import { getHeroPlant } from '../data/countries';
import GalleryGrid from '../components/Gallery/GalleryGrid';
import AppStoreBadge from '../components/common/AppStoreBadge';
import Footer from '../components/Layout/Footer';
import { Language } from '../types';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Language;
  const { settings } = useSettings();
  const plants = usePlants();

  // Country-aware subtitle, falling back to the generic label when a country
  // has no specific one (WEB-M01/R-W03).
  const subtitle = t([`app.subtitle_${settings.country}`, 'app.subtitle']);

  // Cover plant = the collection's explicit hero (Sardaana for Yakutia, marigold
  // for Mongolia), resolved from the country's `heroSlug`; falls back to the
  // last entry if that ever fails to match. The cover of an encyclopedia is its
  // finest plate, not an arbitrary snapshot.
  const HERO_PLANT = getHeroPlant(settings.country) ?? plants[plants.length - 1];
  const HERO_PLATE =
    getIllustrationPath(HERO_PLANT, 'medium') ?? getImagePath(HERO_PLANT, 'medium');
  const PLATED = useMemo(() => plants.filter(hasIllustration), [plants]);

  return (
    <div className="min-h-screen">
      {/* ============ HERO — encyclopedia cover: title page + leading plate ============ */}
      <section className="pt-14 border-b border-hairline">
        <div className="md:grid md:grid-cols-2 md:h-[calc(100dvh-3.5rem)] md:min-h-[540px] md:max-h-[760px]">
          {/* Plate panel — the cover image. First in DOM so mobile opens on it. */}
          <div
            className="
              relative bg-parchment border-b md:border-b-0 md:border-l border-hairline
              md:order-2 flex items-center justify-center
              h-[46vh] min-h-[320px] md:h-auto
              p-6 pb-9 sm:p-10 sm:pb-11 lg:p-14 lg:pb-14
            "
          >
            <img
              src={HERO_PLATE}
              alt={`${HERO_PLANT.names[lang]} — ${t('plant.illustration')}`}
              className="max-w-full max-h-full object-contain drop-shadow-xl"
              loading="eager"
            />
            {/* Figure caption, the way an encyclopedia captions its frontispiece */}
            <p className="absolute bottom-3 right-4 text-[11px] italic text-ink-muted leading-tight text-right max-w-[60%]">
              {HERO_PLANT.names[lang]}
              <span className="not-italic"> · </span>
              {HERO_PLANT.names.latin}
            </p>
          </div>

          {/* Title panel */}
          <div className="md:order-1 flex items-center justify-center px-6 py-12 sm:px-10 md:py-0">
            <div className="max-w-md w-full">
              <p className="overline-label mb-4">{subtitle}</p>
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-ink leading-[0.98] tracking-[-0.01em] mb-5">
                {t('app.title')}
              </h1>
              <p className="text-ink-light text-lg lg:text-xl font-light leading-snug mb-9">
                {t([`app.description_${settings.country}`, 'app.description'])}
              </p>
              <div className="flex items-center gap-5">
                <Link
                  to="/catalog"
                  className="
                    inline-flex items-center gap-2
                    bg-forest hover:bg-forest-dark text-white
                    text-sm font-medium px-5 py-2.5 rounded-[10px]
                    no-underline transition-colors
                  "
                >
                  {t('home.cta')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="text-sm text-ink-muted">
                  {PLATED.length > 0
                    ? t('home.plateCount', { count: PLATED.length })
                    : t('gallery.photoCount', { count: plants.length })}
                </span>
              </div>

              {/* Now on the App Store — the badge inverts with the theme (black
                  on light, white on dark). Android arrives via Google Play. */}
              <div className="mt-7 pt-7 border-t border-hairline">
                <AppStoreBadge />
                <p className="mt-2.5 text-xs text-ink-muted">
                  {t('home.appStoreNote')} · iPhone · iPad
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PLATES — the herbarium drawer, every plate in order ============ */}
      {PLATED.length > 0 && (
      <section className="pt-10 pb-2">
        <div className="px-4 max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between border-b border-hairline pb-3">
            <h2 className="font-heading text-xl sm:text-2xl font-semibold text-ink">
              {t('home.platesTitle')}
            </h2>
            <div className="flex items-baseline gap-3 shrink-0 pl-4">
              {/* Mobile swipe cue — drifting chevrons say "this row scrolls" */}
              <span className="md:hidden inline-flex items-center gap-1 text-xs text-forest whitespace-nowrap">
                {t('home.swipeHint')}
                <ChevronsRight className="w-3.5 h-3.5 swipe-drift" strokeWidth={2.2} />
              </span>
              <span className="text-sm text-ink-muted whitespace-nowrap">
                {t('home.plateCount', { count: PLATED.length })}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto overflow-x-auto hide-scrollbar snap-x scroll-fade-x px-4 mt-5">
          <div className="flex gap-4 w-max pb-2 shelf-nudge">
            {PLATED.map((plant, index) => (
              <Link
                key={plant.id}
                to={`/plant/${plant.slug}`}
                className="snap-start shrink-0 w-48 sm:w-56 no-underline group"
              >
                <div className="border border-hairline rounded-lg overflow-hidden bg-parchment aspect-square">
                  <img
                    src={getIllustrationPath(plant, 'thumb')!}
                    alt={`${plant.names[lang]} — ${t('plant.illustration')}`}
                    className="plate-thumb transition-[scale] duration-500 ease-[var(--ease-ios)] group-hover:scale-[1.42]"
                    loading={index < 6 ? 'eager' : 'lazy'}
                    draggable={false}
                  />
                </div>
                <div className="flex items-baseline gap-2 mt-2.5 px-0.5">
                  <span className="text-xs text-ink-muted shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate group-hover:text-forest transition-colors">
                      {plant.names[lang]}
                    </p>
                    {settings.showLatin && (
                      <p className="text-xs italic text-ink-muted truncate">
                        {plant.names.latin}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ============ FIELD PHOTOGRAPHS ============ */}
      {/* No bottom padding here — the Footer owns the bottom (incl. mobile
          bottom-nav clearance), so the grid runs straight into it. */}
      <section>
        <div className="px-4 py-6 max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between border-b border-hairline pb-3">
            <h2 className="font-heading text-xl sm:text-2xl font-semibold text-ink">
              {t('home.photosTitle')}
            </h2>
            <span className="text-sm text-ink-muted shrink-0 pl-4 whitespace-nowrap">
              {t('gallery.photoCount', { count: plants.length })}
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <GalleryGrid plants={plants} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
