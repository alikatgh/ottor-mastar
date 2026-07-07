import { lazy, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Layout/Header';
import BottomNav from './components/Layout/BottomNav';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { findPlantBySlug } from './data/countries';
import { Language } from './types';

// Route-level code-splitting: nothing but the shell ships in the initial
// bundle; every screen — including the home page — loads on first navigation.
const HomePage = lazy(() => import('./pages/HomePage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const PlantDetailPage = lazy(() => import('./pages/PlantDetailPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const OG_LOCALES: Record<string, string> = {
  sah: 'sah_RU',
  ru: 'ru_RU',
  en: 'en_US',
};

/**
 * Reset scroll to the top on every route change. Without this, opening a plant
 * page inherits the previous page's scroll position — so the detail page could
 * open already scrolled past its hero image. Runs before paint to avoid a flash.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * Routed content + per-navigation enter transition. Keyed by pathname so each
 * screen mounts fresh and eases in (opacity + a small rise), the iOS
 * push-in feel. Enter-only: exits can't animate cleanly through Suspense, and
 * a fade-out would only delay the next screen. Framer's MotionConfig (in
 * SettingsProvider) neutralizes the transform under reduce-motion.
 */
function AppRoutes() {
  const location = useLocation();
  // The plant detail page owns the full viewport and runs its own entrance
  // (image + sheet spring), so it opts out of the page-level rise.
  const isDetail = location.pathname.startsWith('/plant/');

  return (
    <Suspense fallback={null}>
      <motion.div
        key={location.pathname}
        initial={isDetail ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/plant/:slug" element={<PlantDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </Suspense>
  );
}

/**
 * Keep the document metadata in sync with the chosen language, the active
 * country, and the current route: <html lang> (screen readers, hyphenation),
 * <title>, and the description/OG tags so a shared or bookmarked page carries
 * the reader's language and — on a plant route — that plant's name.
 *
 * Lives inside BrowserRouter + SettingsProvider so it can read the location and
 * the selected country. Depends on [language, country, pathname] rather than the
 * unstable `t` identity (WEB-M21): `t` changes reference on every render, so
 * depending on it re-ran this effect far more than needed; the tuple captures
 * every input that actually changes the output.
 */
function DocumentMeta() {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const { pathname } = useLocation();
  const lang = i18n.language as Language;
  const country = settings.country;

  useEffect(() => {
    document.documentElement.lang = lang;

    // Country-aware subtitle, falling back to the generic one (WEB-M01/R-W03).
    const subtitle = t([`app.subtitle_${country}`, 'app.subtitle']);
    const siteTitle = `${t('app.title')} — ${subtitle}`;
    const siteDescription = t([`app.description_${country}`, 'app.description']);

    // On a plant route, lead the shared/bookmarked card with the plant itself
    // (WEB-M11); everywhere else use the site title/description. Best-effort —
    // an unknown slug just falls back to the site metadata.
    let title = siteTitle;
    let ogTitle = siteTitle;
    let description = siteDescription;
    const plantMatch = pathname.match(/^\/plant\/([^/]+)/);
    if (plantMatch) {
      const plant = findPlantBySlug(decodeURIComponent(plantMatch[1]));
      if (plant) {
        const name = plant.names[lang];
        title = `${name} — ${t('app.title')}`;
        ogTitle = `${name} · ${plant.names.latin}`;
        description = plant.description[lang] || siteDescription;
      }
    }

    document.title = title;

    const setMeta = (selector: string, content: string) => {
      document.querySelector(selector)?.setAttribute('content', content);
    };
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', ogTitle);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:locale"]', OG_LOCALES[lang] ?? OG_LOCALES.sah);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, country, pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
      <ScrollToTop />
      <DocumentMeta />
      <div className="relative min-h-screen bg-cream">
        <Header />
        <main>
          <AppRoutes />
        </main>
        <BottomNav />
      </div>
      </SettingsProvider>
    </BrowserRouter>
  );
}
