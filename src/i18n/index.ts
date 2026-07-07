import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import sah from './locales/sah.json';
import ru from './locales/ru.json';
import en from './locales/en.json';
import mn from './locales/mn.json';
import zh from './locales/zh.json';

// All five languages the app can render. Which subset a reader sees is decided
// per country (see countries.ts `languages`); the switcher filters this list.
export const LANGUAGES = [
  { code: 'sah', label: 'Саха', shortLabel: 'Саха' },
  { code: 'ru', label: 'Русский', shortLabel: 'Рус' },
  { code: 'en', label: 'English', shortLabel: 'Eng' },
  { code: 'mn', label: 'Монгол', shortLabel: 'Мон' },
  { code: 'zh', label: '中文', shortLabel: '中' },
];

// Sakha-first: new visitors default to Sakha (Yakut). Returning visitors keep
// their stored choice; the browser language is intentionally NOT used as the
// default. `fallbackLng` (English) still governs missing-key fallback — this
// only sets the initial language when nothing is stored.
const languageDetector = new LanguageDetector();
languageDetector.addDetector({ name: 'sahDefault', lookup: () => 'sah' });

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      sah: { translation: sah },
      ru: { translation: ru },
      en: { translation: en },
      mn: { translation: mn },
      zh: { translation: zh },
    },
    // Data is keyed by these exact codes. Without listing them, a browser
    // reporting 'en-US' / 'zh-CN' leaves i18n.language region-suffixed, so
    // every plant.xxx[lang] lookup returns undefined and content renders blank.
    supportedLngs: ['sah', 'ru', 'en', 'mn', 'zh'],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    // English is the universal fallback across all five languages (a missing
    // Mongolian/Chinese key must never fall back to Sakha Cyrillic).
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'sahDefault'],
      caches: ['localStorage'],
      // Strip region suffix so 'en-US' → 'en', 'ru-RU' → 'ru'. This makes
      // i18n.language exactly match the data keys used for plant.xxx[lang].
      convertDetectedLanguage: (lng: string) => lng.split('-')[0],
    },
  });

export default i18n;
