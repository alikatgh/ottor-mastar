import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Info, Leaf } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function Footer() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const year = new Date().getFullYear();

  // Country-aware subtitle for the colophon, falling back to the generic label
  // (WEB-M01/R-W03).
  const subtitle = t([`app.subtitle_${settings.country}`, 'app.subtitle']);

  return (
    <footer className="border-t border-hairline mt-12">
      <div className="max-w-3xl mx-auto px-5 pt-10 pb-28 md:pb-12">
        {/* Safety disclaimer — kept prominent near the content it applies to */}
        <div className="flex items-start gap-2.5 rounded-xl bg-[#FFF7F2] border border-amber/25 p-4 mb-10">
          <Info className="w-4.5 h-4.5 text-amber-warm shrink-0 mt-0.5" />
          <p className="text-ink-light text-xs leading-relaxed">
            {t('common.disclaimerShort')}{' '}
            <Link to="/legal" className="font-medium text-forest hover:text-forest-dark no-underline">
              {t('common.readDisclaimer')}
            </Link>
          </p>
        </div>

        {/* Wordmark + nav, encyclopedia colophon style */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          <div className="max-w-xs">
            <Link to="/" className="inline-flex items-center gap-2 no-underline">
              <Leaf className="w-5 h-5 text-forest" strokeWidth={1.75} />
              <span className="font-heading text-lg font-semibold text-ink leading-none">
                {t('app.title')}
              </span>
            </Link>
            <p className="text-xs text-ink-muted mt-2.5 leading-relaxed">
              {t([`app.description_${settings.country}`, 'app.description'])}
            </p>
          </div>

          <nav className="flex flex-col gap-2.5 text-sm shrink-0">
            <span className="overline-label !text-[10px] mb-0.5">{t('nav.about')}</span>
            <Link to="/about" className="text-ink-light hover:text-forest no-underline transition-colors">
              {t('nav.about')}
            </Link>
            <Link to="/settings" className="text-ink-light hover:text-forest no-underline transition-colors">
              {t('settings.title')}
            </Link>
            <Link to="/legal" className="text-ink-light hover:text-forest no-underline transition-colors">
              {t('common.legal')}
            </Link>
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-hairline flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
          <span>© {year} Ottor Mastar</span>
          <span className="tabular-nums">{subtitle}</span>
        </div>
      </div>
    </footer>
  );
}
