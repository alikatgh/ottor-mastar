import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline mt-8">
      <div className="max-w-2xl mx-auto px-5 pt-8 pb-24 md:pb-10">
        {/* Safety disclaimer — kept prominent near the content it applies to */}
        <div className="flex items-start gap-2.5 rounded-xl bg-[#FFF7F2] border border-amber/25 p-4 mb-6">
          <Info className="w-4.5 h-4.5 text-amber-warm shrink-0 mt-0.5" />
          <p className="text-ink-light text-xs leading-relaxed">
            {t('common.disclaimerShort')}{' '}
            <Link to="/legal" className="font-medium text-forest hover:text-forest-dark no-underline">
              {t('common.readDisclaimer')}
            </Link>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-ink-muted">
          <span>© {year} Ottor Mastar</span>
          <nav className="flex items-center gap-4">
            <Link to="/about" className="hover:text-forest no-underline transition-colors">
              {t('nav.about')}
            </Link>
            <Link to="/legal" className="hover:text-forest no-underline transition-colors">
              {t('common.legal')}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
