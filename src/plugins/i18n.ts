import { createI18n } from 'vue-i18n'
import { messages } from '@/locales'

export type AppLocale = 'uz' | 'ru'

const STORAGE_KEY = 'locale'

const getInitialLocale = (): AppLocale => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'uz' || saved === 'ru') return saved
  return 'uz'
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getInitialLocale(),
  fallbackLocale: 'uz',
  messages,
})

export const setLocale = (locale: AppLocale) => {
  ;(i18n.global.locale as unknown as { value: AppLocale }).value = locale
  localStorage.setItem(STORAGE_KEY, locale)
  document.documentElement.setAttribute('lang', locale)
}

document.documentElement.setAttribute('lang', getInitialLocale())

export default i18n
