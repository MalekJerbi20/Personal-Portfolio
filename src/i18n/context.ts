import { createContext } from 'react'
import type { Language, UiTranslations } from './types'

export type I18nContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: UiTranslations
}

export const I18nContext = createContext<I18nContextValue | null>(null)
