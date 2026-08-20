import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

const savedLang = localStorage.getItem('lh_lang') || 'en';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: savedLang,
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'gu'],
    interpolation: {
      escapeValue: false
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json'
    },
    react: {
      useSuspense: false
    }
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('lh_lang', lng);
});

export default i18n;
