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
        border-t border-black/5
        sm:hidden
      "
    >
      <div className="flex items-center justify-around h-[52px] px-2">
        {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `
              flex flex-col items-center gap-0.5 px-3 py-1
              no-underline transition-colors duration-200
              ${isActive ? 'text-forest' : 'text-ink-muted'}
            `}
          >
            <Icon className="w-[22px] h-[22px]" strokeWidth={1.8} />
            <span className="text-[10px] font-medium">{t(labelKey)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
