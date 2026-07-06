import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import BottomNav from './components/Layout/BottomNav';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import PlantDetailPage from './pages/PlantDetailPage';
import SearchPage from './pages/SearchPage';
import AboutPage from './pages/AboutPage';
import LegalPage from './pages/LegalPage';

export default function App() {
  const { i18n } = useTranslation();

  // Keep <html lang> in sync with the chosen language (screen readers,
  // hyphenation, and search engines all read it).
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <BrowserRouter>
      <div className="relative min-h-screen bg-cream">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/plant/:slug" element={<PlantDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/legal" element={<LegalPage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
