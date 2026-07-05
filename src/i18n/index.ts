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
    fallbackLng: 'sah',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
