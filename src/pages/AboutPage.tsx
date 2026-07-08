import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../data/plants';
import { usePlants, useSettings } from '../context/SettingsContext';
import { LANGUAGES } from '../i18n';
import Footer from '../components/Layout/Footer';

export default function AboutPage() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const plants = usePlants();

  const medicinalCount = plants.filter((p) =>
    p.categories.includes(CATEGORIES.MEDICINAL)
  ).length;

  // Country-aware copy, falling back to the generic strings (WEB-M01/R-W03).
  const subtitle = t([`app.subtitle_${settings.country}`, 'app.subtitle']);
  const intro = t([`about.intro_${settings.country}`, 'about.intro']);

  // Numbers stay computed from the live data; only the labels are localized
  // (WEB-M03). The language count is derived from the actual LANGUAGES list so
  // it can never drift from what the app really ships.
  const STATS: { value: string; label: string }[] = [
    { value: String(plants.length), label: t('about.statPlants') },
    { value: String(medicinalCount), label: t('about.statMedicinal') },
    { value: String(LANGUAGES.length), label: t('about.statLanguages') },
  ];

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-6">
      <div className="max-w-2xl mx-auto px-5 py-8">
        {/* Title */}
        <p className="overline-label mb-2">{subtitle}</p>
        <h1 className="font-heading text-4xl font-bold text-ink mb-8">
          {t('about.title')}
        </h1>

        {/* Mission — lead text, no card chrome */}
        <div className="space-y-4 mb-10">
          <p className="text-ink text-lg leading-relaxed font-heading">
            {intro}
          </p>
          <p className="text-ink-light text-[15px] leading-relaxed">
            {t('about.mission')}
          </p>
        </div>

        {/* Stats — the numbers carry the page; hairline card, no shadows */}
        <div className="grid grid-cols-3 divide-x divide-hairline border border-hairline rounded-2xl bg-card mb-10">
          {STATS.map(({ value, label }) => (
            <div key={label} className="px-4 py-5 text-center">
              <div className="font-heading text-3xl sm:text-4xl font-semibold text-forest leading-none mb-2">
                {value}
              </div>
              <div className="text-[11px] sm:text-xs text-ink-muted leading-snug">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Settings & Legal entries */}
        <div className="space-y-3">
          <Link
            to="/settings"
            className="
              flex items-center gap-3 border border-hairline rounded-2xl bg-card p-5
              no-underline hover:bg-cream-dark/40 transition-colors
            "
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-ink font-body">{t('settings.title')}</h3>
              <p className="text-xs text-ink-muted mt-0.5">{t('settings.storageNote')}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-ink-muted/60 flex-shrink-0" />
          </Link>
          <Link
            to="/help"
            className="
              flex items-center gap-3 border border-hairline rounded-2xl bg-card p-5
              no-underline hover:bg-cream-dark/40 transition-colors
            "
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-ink font-body">{t('help.title')}</h3>
              <p className="text-xs text-ink-muted mt-0.5">{t('help.intro')}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-ink-muted/60 flex-shrink-0" />
          </Link>
          <Link
            to="/legal"
            className="
              flex items-center gap-3 border border-hairline rounded-2xl bg-card p-5
              no-underline hover:bg-cream-dark/40 transition-colors
            "
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-ink font-body">{t('common.legal')}</h3>
              <p className="text-xs text-ink-muted mt-0.5">{t('common.readDisclaimer')}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-ink-muted/60 flex-shrink-0" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
