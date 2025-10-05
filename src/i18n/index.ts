import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en.json';
import ptTranslations from './locales/pt.json';

const getDefaultLanguage = () => {
  const savedLanguage = localStorage.getItem('i18nextLng');
  if (savedLanguage) {
    return savedLanguage;
  }

  const browserLanguage = navigator.language || navigator.languages?.[0] || 'en';
  const languageCode = browserLanguage.toLowerCase().split('-')[0];

  const portugueseLanguages = ['pt'];

  if (portugueseLanguages.includes(languageCode)) {
    return 'pt';
  }

  return 'en';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      pt: {
        translation: ptTranslations
      }
    },
    lng: getDefaultLanguage(),
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;