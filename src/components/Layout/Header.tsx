import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Leaf, Search } from 'lucide-react';
import LanguageSwitcher from '../common/LanguageSwitcher';

export default function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show header on plant detail page (it has its own)
  const isViewer = location.pathname.includes('/plant/');

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-200 safe-top
        backdrop-blur-header
        border-b border-black/5
        transition-transform duration-300 ease-[var(--ease-ios)]
        ${hidden ? '-translate-y-full' : 'translate-y-0'}
        ${isViewer ? 'hidden' : ''}
      `}
    >
      <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto">
        {/* Logo + Title */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center">
            <Leaf className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-base font-semibold text-ink leading-tight">
              {t('app.title')}
            </span>
            <span className="text-[10px] text-ink-muted leading-tight tracking-wide">
              {t('app.subtitle')}
            </span>
          </div>
        </Link>

        {/* Right side: language + search */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
            aria-label={t('nav.search')}
          >
            <Search className="w-[18px] h-[18px] text-ink-muted" />
          </button>
        </div>
      </div>
    </header>
  );
}
