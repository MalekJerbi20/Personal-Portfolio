import { Link } from 'react-router-dom'
import SocialLink from './SocialLink'
import { useI18n } from '../i18n/useI18n'
import { usePortfolio } from '../data/usePortfolio'

function SiteFooter() {
  const { t } = useI18n()
  const { content } = usePortfolio()
  if (!content) return null
  const { settings } = content

  return (
    <footer className="border-t border-line">
      <div className="container-shell flex flex-col gap-5 py-8 text-sm text-faint sm:flex-row sm:items-center sm:justify-between">
        <p>{settings.displayName} <span className="text-accent">/</span> {new Date().getFullYear()}</p>
        <nav className="flex gap-5" aria-label={t.footer.navigation}>
          {settings.githubUrl && <SocialLink href={settings.githubUrl} network="github" label={t.contact.github} />}
          {settings.linkedinUrl && <SocialLink href={settings.linkedinUrl} network="linkedin" label={t.contact.linkedin} />}
          <Link className="transition hover:text-strong" to="/#contact">{t.footer.contact}</Link>
          <Link className="transition hover:text-strong" to="/admin">{t.admin.openEditor}</Link>
        </nav>
      </div>
    </footer>
  )
}

export default SiteFooter
