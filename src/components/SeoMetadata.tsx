import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { localizeProject } from '../data/portfolio'
import { usePortfolio } from '../data/usePortfolio'
import { useI18n } from '../i18n/useI18n'

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.append(element)
  }
  element.content = content
}

function SeoMetadata() {
  const { pathname } = useLocation()
  const { language, t } = useI18n()
  const { content } = usePortfolio()

  useEffect(() => {
    if (!content) return
    const slug = pathname.match(/^\/projects\/([^/]+)\/?$/)?.[1]
    const project = content.projects.find((item) => item.slug === slug)
    const localizedProject = project ? localizeProject(project, language, content.translations.fr.projects) : undefined
    const siteTitle = t.siteTitle.replace('Malek', content.settings.displayName)
    const isHome = pathname === '/'
    const isAdmin = pathname === '/admin'
    const isProjectRoute = pathname.startsWith('/projects/')
    const pageTitle = isAdmin
      ? `${t.admin.title} | ${siteTitle}`
      : localizedProject
      ? `${localizedProject.title} | ${siteTitle}`
      : isHome
        ? siteTitle
        : isProjectRoute
          ? `${t.projectDetail.missingProjectTitle} | ${siteTitle}`
          : `${t.notFound.title} | ${siteTitle}`
    const description = localizedProject?.shortDescription
      ?? (isHome ? t.metaDescription : isAdmin ? t.admin.description : t.notFound.description)
    const canonicalUrl = new URL(pathname, content.settings.siteUrl).toString()

    document.title = pageTitle
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:title"]', 'property', 'og:title', pageTitle)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', language === 'fr' ? 'fr_FR' : 'en_US')
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', pageTitle)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    setMeta('meta[name="robots"]', 'name', 'robots', isAdmin ? 'noindex,nofollow' : 'index,follow')

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href = canonicalUrl
  }, [content, language, pathname, t])

  return null
}

export default SeoMetadata
