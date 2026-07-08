import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowUpRight, Download } from 'lucide-react';
import Footer from '../components/Layout/Footer';

/**
 * Help — a short, plain-language guide: browsing, the zoom viewer's gestures,
 * languages/collections, offline app, and the safety pointer. Content lives in
 * the `help.*` locale keys (all five languages), so the native apps reuse the
 * exact same copy via the data export.
 */
export default function HelpPage() {
  const { t } = useTranslation();

  const sections: { title: string; body: string; link?: { to: string; label: string; external?: boolean } }[] = [
    { title: t('help.browseTitle'), body: t('help.browseBody') },
    { title: t('help.viewerTitle'), body: t('help.viewerBody') },
    { title: t('help.langTitle'), body: t('help.langBody') },
    {
      title: t('help.appTitle'),
      body: t('help.appBody'),
      link: { to: '/app', label: t('help.appLink'), external: true },
    },
    {
      title: t('help.safetyTitle'),
      body: t('help.safetyBody'),
      link: { to: '/legal', label: t('help.safetyLink') },
    },
  ];

  return (
    <div className="min-h-screen pt-16 pb-24 sm:pb-10">
      <div className="max-w-2xl mx-auto px-5 py-6">
        <Link
          to="/about"
          className="inline-flex items-center gap-1.5 mb-6 text-sm font-medium text-ink-muted hover:text-forest no-underline transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('nav.about')}
        </Link>

        <p className="overline-label mb-2">{t('app.title')}</p>
        <h1 className="font-heading text-3xl font-bold text-ink mb-2">{t('help.title')}</h1>
        <p className="text-ink-light text-[15px] leading-relaxed mb-10">{t('help.intro')}</p>

        <div className="space-y-8">
          {sections.map(({ title, body, link }) => (
            <section key={title}>
              <h2 className="overline-label !font-body border-t border-hairline pt-3 mb-3">
                {title}
              </h2>
              <p className="text-[15px] text-ink-light leading-relaxed">{body}</p>
              {link &&
                (link.external ? (
                  // /app is a static page outside the SPA router — a plain <a>.
                  <a
                    href={link.to}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-forest hover:text-forest-dark no-underline transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.to}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-forest hover:text-forest-dark no-underline transition-colors"
                  >
                    {link.label}
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                ))}
            </section>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
