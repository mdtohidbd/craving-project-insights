import i18next from 'i18next';
import middleware from 'i18next-http-middleware';

import en from './locales/en.json';
import bn from './locales/bn.json';

i18next
  .use(middleware.LanguageDetector)
  .init({
    preload: ['en', 'bn'],
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      bn: { translation: bn }
    }
  });

export { i18next, middleware };
