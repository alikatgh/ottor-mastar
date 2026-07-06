import { lazy, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
      <div className="relative min-h-screen bg-cream">
        <Header />
        <main>
          {/* Chunks load in well under a beat on repeat visits; a spinner for
              that flash would be noisier than the blank canvas. */}
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/plant/:slug" element={<PlantDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Suspense>
        </main>
        <BottomNav />
      </div>
      </SettingsProvider>
    </BrowserRouter>
  );
}
