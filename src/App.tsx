import { lazy, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Layout/Header';
import BottomNav from './components/Layout/BottomNav';
import HomePage from './pages/HomePage';
import { SettingsProvider } from './context/SettingsContext';

// Route-level code-splitting: only the gallery ships in the initial bundle;
// every other screen loads on first navigation.
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const PlantDetailPage = lazy(() => import('./pages/PlantDetailPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

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
        </Routes>
      </motion.div>
    </Suspense>
  );
}

export default function App() {
  const { t, i18n } = useTranslation();

  // Keep the document metadata in sync with the chosen language: <html lang>
  // (screen readers, hyphenation), <title>, and the description/OG tags so a
  // shared or bookmarked page carries the reader's language.
  useEffect(() => {
    document.documentElement.lang = i18n.language;

    const title = `${t('app.title')} — ${t('app.subtitle')}`;
    document.title = title;

    const setMeta = (selector: string, content: string) => {
      document.querySelector(selector)?.setAttribute('content', content);
    };
    setMeta('meta[name="description"]', t('app.description'));
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', t('app.description'));
    setMeta('meta[property="og:locale"]', OG_LOCALES[i18n.language] ?? OG_LOCALES.sah);
  }, [i18n.language, t]);

  return (
    <BrowserRouter>
      <SettingsProvider>
      <ScrollToTop />
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
