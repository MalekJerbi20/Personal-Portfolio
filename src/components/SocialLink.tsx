import { useI18n } from '../i18n/useI18n'

type SocialLinkProps = {
  href: string
  network: 'github' | 'linkedin'
  label: string
}

function SocialLink({ href, network, label }: SocialLinkProps) {
  const { t } = useI18n()

  return (
    <a className="inline-flex items-center gap-2 text-muted transition hover:text-strong" href={href} target="_blank" rel="noreferrer">
      {network === 'github' ? (
        <svg aria-hidden="true" className="social-mark size-4" viewBox="0 0 19 19">
          <use href="/icons.svg#github-icon" />
        </svg>
      ) : (
        <span aria-hidden="true" className="inline-flex size-4 items-center justify-center border border-current text-[0.6rem] font-bold leading-none">in</span>
      )}
      <span>{label}</span>
      <span className="sr-only">{t.contact.opensNewTab}</span>
    </a>
  )
}

export default SocialLink
