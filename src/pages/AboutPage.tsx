import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { Language } from '../types';
import { plants, CATEGORIES } from '../data/plants';
import Footer from '../components/Layout/Footer';

const MEDICINAL_COUNT = plants.filter((p) => p.categories.includes(CATEGORIES.MEDICINAL)).length;

const STATS: { value: string; label: Record<Language, string> }[] = [
  {
    value: String(plants.length),
    label: {
      sah: 'Кыыл үүнээйи',
      ru: 'Дикорастущих растений',
      en: 'Wild plants',
    },
  },
  {
    value: String(MEDICINAL_COUNT),
    label: {
      sah: 'Эм оттор',
      ru: 'Лекарственных трав',
      en: 'Medicinal herbs',
    },
  },
  {
    value: '3',
    label: {
      sah: 'Тыл: сахалыы, нууччалыы, аҥылычаанныы',
      ru: 'Языка: якутский, русский, английский',
      en: 'Languages: Yakut, Russian, English',
    },
  },
];

export default function AboutPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Language;

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-6">
      <div className="max-w-2xl mx-auto px-5 py-8">
        {/* Title */}
        <p className="overline-label mb-2">{t('app.subtitle')}</p>
        <h1 className="font-heading text-4xl font-bold text-ink mb-8">
          {t('about.title')}
        </h1>

        {/* Mission — lead text, no card chrome */}
        <div className="space-y-4 mb-10">
          <p className="text-ink text-lg leading-relaxed font-heading">
            {t('about.intro')}
          </p>
          <p className="text-ink-light text-[15px] leading-relaxed">
            {t('about.mission')}
          </p>
        </div>

        {/* Stats — the numbers carry the page; hairline card, no shadows */}
        <div className="grid grid-cols-3 divide-x divide-hairline border border-hairline rounded-2xl bg-card mb-10">
          {STATS.map(({ value, label }) => (
            <div key={value + label.en} className="px-4 py-5 text-center">
              <div className="font-heading text-3xl sm:text-4xl font-semibold text-forest leading-none mb-2">
                {value}
              </div>
              <div className="text-[11px] sm:text-xs text-ink-muted leading-snug">
                {label[lang]}
              </div>
            </div>
          ))}
        </div>

        {/* Legal & Privacy entry */}
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

      <Footer />
    </div>
  );
}
