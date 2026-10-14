import ProjectCard from '../components/ProjectCard'
import SocialLink from '../components/SocialLink'
import { localizeProject, localizeSkillGroup } from '../data/portfolio'
import { usePortfolio } from '../data/usePortfolio'
import { useI18n } from '../i18n/useI18n'

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-strong sm:text-4xl">{title}</h2>
    </div>
  )
}

function HomePage() {
  const { language, t } = useI18n()
  const { content } = usePortfolio()
  if (!content) return null
  const { settings, projects, skillGroups, translations } = content

  return (
    <main>
      <section id="home" className="container-shell scroll-mt-24 flex min-h-[calc(100svh-5rem)] items-center py-20 sm:py-28">
        <div className="max-w-4xl motion-reveal">
          <p className="mb-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">{t.hero.eyebrow}</p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.04] tracking-[-0.04em] text-strong sm:text-6xl lg:text-7xl">
            {t.hero.title}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
            {t.hero.description.replace('{{name}}', settings.displayName)}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a className="button button-primary" href="#projects">{t.hero.viewProjects} <span aria-hidden="true">-&gt;</span></a>
            {settings.cvAvailable ? (
              <>
                <a className="button button-secondary" href={settings.cvUrl} target="_blank" rel="noreferrer">
                  {t.cv.view}<span className="sr-only"> {t.contact.opensNewTab}</span>
                </a>
                <a className="button button-secondary" href={settings.cvUrl} download>
                  {t.cv.download}
                </a>
              </>
            ) : (
              <span className="inline-flex min-h-11 items-center border border-line px-4 text-sm text-faint" role="status">
                {t.cv.notAvailable}
              </span>
            )}
          </div>
          <div className="mt-16 flex items-center gap-3 font-mono text-xs text-faint">
            <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
            <span>{t.hero.availability}</span>
          </div>
        </div>
      </section>

      <section id="projects" className="scroll-mt-24 border-y border-line bg-subtle/35 py-24 sm:py-32">
        <div className="container-shell">
          <SectionHeading eyebrow={t.projects.eyebrow} title={t.projects.title} />
          <div className="grid gap-4 lg:grid-cols-3">
            {projects.map((project, index) => <ProjectCard key={project.slug} project={localizeProject(project, language, translations.fr.projects)} index={index} />)}
          </div>
        </div>
      </section>

      <section id="about" className="container-shell scroll-mt-24 grid gap-10 py-24 sm:py-32 lg:grid-cols-[0.7fr_1fr] lg:gap-24">
        <SectionHeading eyebrow={t.about.eyebrow} title={t.about.title} />
        <div className="space-y-5 text-base leading-8 text-muted">
          {t.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </section>

      <section id="skills" className="scroll-mt-24 border-y border-line bg-subtle/35 py-24 sm:py-32">
        <div className="container-shell">
          <SectionHeading eyebrow={t.skills.eyebrow} title={t.skills.title} />
          <div className="grid gap-4 md:grid-cols-3">
            {skillGroups.map((group) => (
              <div key={group.name} className="border-t border-accent pt-5">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-strong">{localizeSkillGroup(group, language, translations.fr.skillGroups).name}</h3>
                <ul className="mt-5 space-y-3 text-sm text-muted">
                  {localizeSkillGroup(group, language, translations.fr.skillGroups).skills.map((skill) => <li key={skill}>{skill}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="container-shell scroll-mt-24 py-24 sm:py-32">
        <div className="border border-line bg-raised p-7 sm:p-12">
          <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">{t.contact.eyebrow}</p>
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight text-strong sm:text-5xl">{t.contact.title}</h2>
              <p className="mt-5 max-w-xl leading-7 text-muted">{t.contact.description}</p>
            </div>
            <div className="grid gap-x-8 gap-y-5 text-sm sm:grid-cols-3 lg:min-w-[32rem]">
              <div>
                <h3 className="mb-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-faint">{t.contact.email}</h3>
                {settings.email ? (
                  <a className="font-semibold text-accent transition hover:text-accent-strong" href={`mailto:${settings.email}`} aria-label={`${t.contact.contactMe}: ${settings.email}`}>
                    {settings.email}
                  </a>
                ) : <p className="text-muted">{t.contact.emailPlaceholder}</p>}
              </div>
              <div>
                <h3 className="mb-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-faint">{t.contact.github}</h3>
                {settings.githubUrl ? (
                  <SocialLink href={settings.githubUrl} network="github" label={t.contact.github} />
                ) : <p className="text-muted">{t.contact.githubPlaceholder}</p>}
              </div>
              <div>
                <h3 className="mb-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-faint">{t.contact.linkedin}</h3>
                {settings.linkedinUrl ? (
                  <SocialLink href={settings.linkedinUrl} network="linkedin" label={t.contact.linkedin} />
                ) : <p className="text-muted">{t.contact.linkedinPlaceholder}</p>}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default HomePage
