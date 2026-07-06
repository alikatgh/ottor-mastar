import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
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
              fading to transparent so the sky stays bright. The old overlay faded
              to cream, washing the white text into an invisible light background. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex flex-col justify-end p-6 pb-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg mb-3">
              {t('app.title')}
            </h1>
            <p className="text-white/80 text-lg sm:text-xl font-light max-w-lg drop-shadow-md">
              {t('app.description')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="pb-20 sm:pb-6">
        <div className="px-4 py-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
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
