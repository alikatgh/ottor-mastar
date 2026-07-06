import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Home } from 'lucide-react';

/**
 * Catch-all 404 page (WEB-H03). Herbarium-styled to match the rest of the app —
 * cream canvas, overline label, serif heading, one forest accent, no shadows —
 * and fully localized (notFound.title / notFound.body). Offers the two clearest
 * ways back: the title page ('/') and the catalog index ('/catalog').
 */
export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-6 flex items-center justify-center">
      <div className="max-w-md w-full px-6 py-12 text-center">
        <p className="overline-label mb-4">404</p>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-ink leading-tight mb-4">
          {t('notFound.title')}
        </h1>
        <p className="text-ink-light text-base leading-relaxed mb-9">
          {t('notFound.body')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="
              inline-flex items-center gap-2
              bg-forest hover:bg-forest-dark text-white
              text-sm font-medium px-5 py-2.5 rounded-[10px]
              no-underline transition-colors
            "
          >
            <Home className="w-4 h-4" />
            {t('notFound.home')}
          </Link>
          <Link
            to="/catalog"
            className="
              inline-flex items-center gap-2
              text-forest hover:text-forest-dark
              text-sm font-medium
              no-underline transition-colors
            "
          >
            {t('notFound.catalog')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
