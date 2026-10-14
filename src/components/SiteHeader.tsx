import { useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { useI18n } from '../i18n/useI18n'
import { usePortfolio } from '../data/usePortfolio'

const navigation = [
  { label: 'home', to: '/#home' },
  { label: 'about', to: '/#about' },
  { label: 'projects', to: '/#projects' },
  { label: 'skills', to: '/#skills' },
  { label: 'contact', to: '/#contact' },
] as const

type NavigationKey = (typeof navigation)[number]['label']

function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n()

  return (
    <div className="flex items-center gap-1" role="group" aria-label={t.language.label}>
      <button
        type="button"
        className={`inline-flex min-h-11 min-w-11 items-center justify-center px-1.5 py-1 text-xs font-semibold transition ${language === 'en' ? 'text-accent' : 'text-faint hover:text-strong'}`}
        aria-label={t.language.english}
        aria-pressed={language === 'en'}
        onClick={() => setLanguage('en')}
      >
        EN
      </button>
      <span className="text-faint" aria-hidden="true">|</span>
      <button
        type="button"
        className={`inline-flex min-h-11 min-w-11 items-center justify-center px-1.5 py-1 text-xs font-semibold transition ${language === 'fr' ? 'text-accent' : 'text-faint hover:text-strong'}`}
        aria-label={t.language.french}
        aria-pressed={language === 'fr'}
        onClick={() => setLanguage('fr')}
      >
        FR
      </button>
    </div>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 20 20" fill="none">
      {open ? (
        <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      ) : (
        <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  )
}

function SiteHeader() {
  const { t } = useI18n()
  const { content } = usePortfolio()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-canvas/95 backdrop-blur-sm">
      <div className="container-shell flex min-h-20 items-center justify-between gap-2 md:gap-6">
        <Link className="text-base font-semibold tracking-tight text-strong" to="/" onClick={closeMenu}>
          {content?.settings.displayName}<span className="text-accent">.</span>
        </Link>

        <nav className="hidden items-center gap-5 lg:gap-7 md:flex" aria-label={t.nav.primary}>
          {navigation.map((item) => (
            <Link key={item.to} className="text-sm text-muted transition hover:text-strong" to={item.to}>
              {t.nav[item.label as NavigationKey]}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center border border-line text-muted transition hover:border-accent hover:text-strong md:hidden"
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      <nav id="mobile-navigation" hidden={!menuOpen} className="border-t border-line md:hidden" aria-label={t.nav.mobile}>
        <div className="container-shell flex flex-col py-3">
          {navigation.map((item) => (
            <Link key={item.to} className="border-b border-line/70 py-4 text-sm text-muted transition last:border-0 hover:text-strong" to={item.to} onClick={closeMenu}>
              {t.nav[item.label as NavigationKey]}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}

export default SiteHeader
