import { useEffect, useState, type ReactNode } from 'react'
import { translations } from './translations'
import type { Language } from './types'
import { I18nContext, type I18nContextValue } from './context'

const LANGUAGE_STORAGE_KEY = 'portfolio-language'

function getInitialLanguage(): Language {
  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (storedLanguage === 'en' || storedLanguage === 'fr') {
    return storedLanguage
  }

  return window.navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

type I18nProviderProps = {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage)

  useEffect(() => {
    document.documentElement.lang = language
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  }, [language])

  const value: I18nContextValue = {
    language,
    setLanguage,
    t: translations[language],
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
