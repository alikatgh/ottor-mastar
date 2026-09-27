import { useTranslation } from 'react-i18next';
import { useNews } from '../data/news';
import { loc } from '../types';
import type { Language } from '../types';
import Footer from '../components/Layout/Footer';

export default function NewsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Language;
  const items = useNews();

  const fmtDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    try {
      return new Intl.DateTimeFormat(lang === 'sah' ? 'ru' : lang, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-6">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="font-heading text-3xl font-semibold text-ink mb-6">
          {t('news.title')}
        </h1>

        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-hairline bg-card p-5 sm:p-6"
            >
              <time
                dateTime={item.date}
                className="block text-xs uppercase tracking-wide text-forest mb-2 tabular-nums"
              >
                {fmtDate(item.date)}
              </time>
              <h2 className="font-heading text-xl font-semibold text-ink mb-2 leading-snug">
                {loc(item.title, lang)}
              </h2>
              <p className="text-[15px] leading-relaxed text-ink-muted whitespace-pre-line">
                {loc(item.body, lang)}
              </p>
            </article>
          ))}
        </div>

        {items.length === 0 && (
          <p className="text-center py-12 text-ink-muted">{t('news.empty')}</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
