import { useTranslation } from 'react-i18next';
import { plants, getImagePath } from '../data/plants';
import GalleryGrid from '../components/Gallery/GalleryGrid';
import Footer from '../components/Layout/Footer';

import { Language } from "../types";
const HERO_PLANT = plants[plants.length - 1]; // Sardaana (Siberian Lily) — the last and most iconic
const HERO_SRC = getImagePath(HERO_PLANT, 'full');

export default function HomePage() {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[400px] max-h-[700px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={HERO_SRC}
            alt={HERO_PLANT.names[i18n.language as Language]}
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Readability scrim — dark at the bottom where the title/tagline sit,
              fading to transparent so the sky stays bright. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
        </div>

        {/* Hero Content — no enter animation: this is the first paint of the app */}
        <div className="relative h-full flex flex-col justify-end p-6 pb-10 max-w-4xl mx-auto">
          <p className="overline-label !text-white/70 mb-3">
            {t('app.subtitle')}
          </p>
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 leading-[0.95] tracking-[-0.01em]">
            {t('app.title')}
          </h1>
          <p className="text-white/85 text-lg sm:text-xl font-light max-w-lg leading-snug">
            {t('app.description')}
          </p>
        </div>

        {/* Plate-style credit for the pictured flower — the way a botanical
            encyclopedia captions its hero image. */}
        <p className="absolute bottom-4 right-5 z-10 text-right text-[11px] text-white/70 italic leading-tight max-w-[45%]">
          {HERO_PLANT.names[i18n.language as Language]}
          <span className="not-italic"> · </span>
          {HERO_PLANT.names.latin}
        </p>
      </section>

      {/* Gallery Section */}
      <section className="pb-20 md:pb-6">
        <div className="px-4 py-6 max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between border-b border-hairline pb-3">
            <h2 className="font-heading text-2xl font-semibold text-ink">
              {t('gallery.title')}
            </h2>
            <span className="text-sm text-ink-muted">
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
