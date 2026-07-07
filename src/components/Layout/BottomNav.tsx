import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Images, BookOpen, Search, Info } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: Images, labelKey: 'nav.gallery' },
  { path: '/catalog', icon: BookOpen, labelKey: 'nav.catalog' },
  { path: '/search', icon: Search, labelKey: 'nav.search' },
  { path: '/about', icon: Info, labelKey: 'nav.about' },
];

export default function BottomNav() {
  const { t } = useTranslation();

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
            end={path === '/'}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-0.5 px-1 py-1.5
              flex-1 min-w-0
              no-underline transition-colors duration-200
              ${isActive ? 'text-forest' : 'text-ink-muted'}
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
