import { createContext } from 'react'
import type { PortfolioContent } from './portfolio'

export type PortfolioContextValue = {
  content: PortfolioContent | null
  loading: boolean
  error: string | null
  hasDraft: boolean
  updateContent: (content: PortfolioContent) => void
  saveDraft: (content?: PortfolioContent) => void
  publishContent: (token: string) => Promise<void>
  discardDraft: () => void
  retryLoad: () => void
}

export const PortfolioContext = createContext<PortfolioContextValue | null>(null)
