import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Images, BookOpen, Search, Newspaper, Info } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: Images, labelKey: 'nav.gallery' },
  { path: '/catalog', icon: BookOpen, labelKey: 'nav.catalog' },
  { path: '/search', icon: Search, labelKey: 'nav.search' },
  { path: '/news', icon: Newspaper, labelKey: 'nav.news' },
  { path: '/about', icon: Info, labelKey: 'nav.about' },
];

/**
 * Which tab a pathname belongs to. Child pages keep their owning tab lit:
 * Settings/Help/Legal live under About; a plant page belongs to the Gallery.
 * Without this, no tab is active on those routes and the bar looks broken.
 */
function isTabActive(tabPath: string, pathname: string): boolean {
  switch (tabPath) {
    case '/':
      return pathname === '/' || pathname.startsWith('/plant/');
    case '/about':
      return ['/about', '/settings', '/help', '/legal'].some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
      );
    default:
      return pathname === tabPath || pathname.startsWith(`${tabPath}/`);
  }
}

export default function BottomNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-200 safe-bottom
        backdrop-blur-header
        border-t border-hairline
        md:hidden
      "
    >
      {/* min-h (not fixed h) + equal-width tabs: long Sakha labels like
          "Биһиги туспутунан" wrap to two tight-leading lines instead of
          being clipped at the bar's bottom edge. */}
      <div className="flex items-stretch justify-around min-h-[52px] px-1">
        {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => (
          <NavLink
            key={path}
            to={path}
            className={`
              flex flex-col items-center justify-center gap-0.5 px-1 py-1.5
              flex-1 min-w-0
              no-underline transition-colors duration-200
              ${isTabActive(path, pathname) ? 'text-forest' : 'text-ink-muted'}
            `}
          >
            <Icon className="w-[22px] h-[22px] shrink-0" strokeWidth={1.8} />
            <span className="text-[10px] font-medium leading-tight text-center max-w-full">
              {t(labelKey)}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
