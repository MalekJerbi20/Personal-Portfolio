import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/useI18n'

type Theme = 'dark' | 'light'

function getInitialTheme(): Theme {
  const storedTheme = window.localStorage.getItem('theme')
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function ThemeToggle() {
  const { t } = useI18n()
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('theme', theme)
  }, [theme])

  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 border border-line px-3 text-xs font-semibold text-muted transition hover:border-accent hover:text-strong"
      onClick={() => setTheme(nextTheme)}
      aria-label={theme === 'dark' ? t.theme.switchToLight : t.theme.switchToDark}
    >
      <span aria-hidden="true" className="text-sm">{theme === 'dark' ? '◐' : '◑'}</span>
      <span className="hidden sm:inline">{theme === 'dark' ? t.theme.lightMode : t.theme.darkMode}</span>
    </button>
  )
}

export default ThemeToggle
