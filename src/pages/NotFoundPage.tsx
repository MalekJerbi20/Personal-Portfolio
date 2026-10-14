import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/useI18n'

function NotFoundPage() {
  const { t } = useI18n()

  return (
    <main className="container-shell flex min-h-[calc(100svh-5rem)] items-center py-20">
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">{t.notFound.eyebrow}</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-strong sm:text-6xl">{t.notFound.title}</h1>
        <p className="mt-4 max-w-lg leading-7 text-muted">{t.notFound.description}</p>
        <Link className="button button-primary mt-8" to="/">{t.notFound.returnHome} <span aria-hidden="true">-&gt;</span></Link>
      </div>
    </main>
  )
}

export default NotFoundPage
