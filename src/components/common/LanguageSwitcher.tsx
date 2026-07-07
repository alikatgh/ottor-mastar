import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../i18n';
import { useSettings } from '../../context/SettingsContext';
import { COUNTRIES } from '../../data/countries';

/**
 * Language switcher, scoped to the active country's language set: Yakutia shows
 * Sakha / Russian / English; Mongolia shows Mongolian / Chinese / English.
 * The full label→code table lives in i18n `LANGUAGES`; we render only the
 * codes this country offers, in the country's order.
 */
export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { settings } = useSettings();

  const countryLangs = COUNTRIES[settings.country].languages;
  const shown = countryLangs
    .map((code) => LANGUAGES.find((l) => l.code === code))
    .filter((l): l is (typeof LANGUAGES)[number] => Boolean(l));

  return (
    <div className="lang-switcher">
      {shown.map((lang) => {
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
