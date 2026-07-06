import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import sah from './locales/sah.json';
import ru from './locales/ru.json';
import en from './locales/en.json';

export const LANGUAGES = [
  { code: 'sah', label: 'Саха', shortLabel: 'Саха' },
  { code: 'ru', label: 'Русский', shortLabel: 'Рус' },
  { code: 'en', label: 'English', shortLabel: 'Eng' },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      sah: { translation: sah },
      ru: { translation: ru },
      en: { translation: en },
    },
    // Data is keyed by 'sah' | 'ru' | 'en'. Without these, a browser reporting
    // 'en-US' / 'ru-RU' leaves i18n.language region-suffixed, so every
    // plant.xxx[lang] lookup returns undefined and content renders blank.
    supportedLngs: ['sah', 'ru', 'en'],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    fallbackLng: 'sah',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      // Strip region suffix so 'en-US' → 'en', 'ru-RU' → 'ru'. This makes
      // i18n.language exactly match the data keys used for plant.xxx[lang].
      convertDetectedLanguage: (lng: string) => lng.split('-')[0],
    },
  });

export default i18n;
