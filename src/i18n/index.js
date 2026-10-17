import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ru from './locales/ru.json'
import en from './locales/en.json'
import ky from './locales/ky.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      ky: { translation: ky },
    },
    lng: localStorage.getItem('carzone-lang') || 'ru',
    fallbackLng: 'ru',
    interpolation: { escapeValue: false },
  })

export default i18n
