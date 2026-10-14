import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { parsePortfolioContent, type PortfolioContent } from './portfolio'
import { apiRequest } from './api'
import { PortfolioContext, type PortfolioContextValue } from './portfolioContext'

const DRAFT_STORAGE_KEY = 'portfolio-content-draft'

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<PortfolioContent | null>(null)
  const [baseContent, setBaseContent] = useState<PortfolioContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasDraft, setHasDraft] = useState(false)
  const [loadVersion, setLoadVersion] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const controller = new AbortController()
        const timeout = window.setTimeout(() => controller.abort(), 8000)
        let base: PortfolioContent
        try {
          base = parsePortfolioContent(await apiRequest('/api/portfolio', { signal: controller.signal }))
        } finally {
          window.clearTimeout(timeout)
        }

        const savedDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY)
        let draft: PortfolioContent | null = null
        if (savedDraft) {
          try {
            draft = parsePortfolioContent(JSON.parse(savedDraft))
          } catch {
            window.localStorage.removeItem(DRAFT_STORAGE_KEY)
          }
        }
        if (active) {
          setBaseContent(base)
          setContent(draft ?? base)
          setHasDraft(Boolean(draft))
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load portfolio content.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => { active = false }
  }, [loadVersion])

  const updateContent = useCallback((nextContent: PortfolioContent) => {
    setContent(parsePortfolioContent(nextContent))
  }, [])

  const saveDraft = useCallback((nextContent?: PortfolioContent) => {
    const draft = nextContent ?? content
    if (!draft) return
    const parsedDraft = parsePortfolioContent(draft)
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(parsedDraft))
    setContent(parsedDraft)
    setHasDraft(true)
  }, [content])

  const publishContent = useCallback(async (token: string) => {
    if (!content) return
    const result = await apiRequest<{ content: PortfolioContent }>('/api/admin/portfolio', {
      method: 'PUT',
      token,
      body: JSON.stringify(content),
    })
    const saved = parsePortfolioContent(result.content)
    window.localStorage.removeItem(DRAFT_STORAGE_KEY)
    setContent(saved)
    setBaseContent(saved)
    setHasDraft(false)
  }, [content])

  const discardDraft = useCallback(() => {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY)
    setContent(baseContent)
    setHasDraft(false)
  }, [baseContent])

  const value: PortfolioContextValue = {
    content,
    loading,
    error,
    hasDraft,
    updateContent,
    saveDraft,
    publishContent,
    discardDraft,
    retryLoad: () => setLoadVersion((version) => version + 1),
  }

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
}
