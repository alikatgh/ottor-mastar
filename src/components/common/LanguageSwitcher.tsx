import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../i18n';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="lang-switcher">
      {LANGUAGES.map((lang) => {
        const active = i18n.language === lang.code;
        return (
          <button
            key={lang.code}
            className={active ? 'active' : ''}
            aria-pressed={active}
            onClick={() => i18n.changeLanguage(lang.code)}
            aria-label={`Switch to ${lang.label}`}
            title={lang.label}
          >
            {lang.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
