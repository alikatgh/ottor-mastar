import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Leaf, SlidersHorizontal } from 'lucide-react';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useSettings } from '../../context/SettingsContext';

const NAV_ITEMS = [
  { path: '/', labelKey: 'nav.gallery' },
  { path: '/catalog', labelKey: 'nav.catalog' },
  { path: '/search', labelKey: 'nav.search' },
  { path: '/about', labelKey: 'nav.about' },
];

export default function Header() {
  const { t } = useTranslation();
  const { settings } = useSettings();
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
        border-b border-hairline
        transition-transform duration-300 ease-[var(--ease-ios)]
        ${hidden ? '-translate-y-full' : 'translate-y-0'}
        ${isViewer ? 'hidden' : ''}
      `}
    >
      <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto">
        {/* Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <Leaf className="w-5 h-5 text-forest" strokeWidth={1.75} />
          <div className="flex flex-col">
            <span className="font-heading text-base font-semibold text-ink leading-tight">
              {t('app.title')}
            </span>
            <span className="overline-label !text-[9px] leading-tight whitespace-nowrap">
              {t([`app.subtitle_${settings.country}`, 'app.subtitle'])}
            </span>
          </div>
        </Link>

        {/* Desktop nav — the bottom tab bar is mobile-only, so every section
            must be reachable from here on larger screens. Active state is a
            reserved underline: geometry never changes, only the color. */}
        <nav className="hidden md:flex items-center gap-6 mr-auto ml-10">
          {NAV_ITEMS.map(({ path, labelKey }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `
                text-sm no-underline py-1
                border-b-[1.5px] transition-colors duration-200
                ${isActive
                  ? 'text-ink border-forest'
                  : 'text-ink-muted border-transparent hover:text-ink'
                }
              `}
            >
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          {/* Desktop-only: on mobile, Settings is reached from the About tab */}
          <NavLink
            to="/settings"
            aria-label={t('settings.title')}
            className={({ isActive }) => `
              hidden md:flex w-9 h-9 rounded-full items-center justify-center
              transition-colors no-underline
              ${isActive ? 'text-forest bg-cream-dark' : 'text-ink-muted hover:text-ink hover:bg-cream-dark'}
            `}
          >
            <SlidersHorizontal className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </NavLink>
        </div>
      </div>
    </header>
  );
}
