import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { localizeProject, type Project } from '../data/portfolio'
import { usePortfolio } from '../data/usePortfolio'
import { useI18n } from '../i18n/useI18n'

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 16 16" fill="none">
      <path d="M3.5 12.5 12.5 3.5m0 0H5.75m6.75 0v6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ProjectImage({ source, alt, placeholder }: { source: string; alt: string; placeholder: string }) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <figure className="flex aspect-video items-center justify-center border border-line bg-subtle/40 p-3 text-center">
      {!imageFailed ? (
        <img
          className="size-full object-cover"
          src={source}
          alt={alt}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <figcaption className="font-mono text-xs uppercase tracking-[0.14em] text-faint">{placeholder}</figcaption>
      )}
    </figure>
  )
}

function ProjectGallery({ project, placeholder, imageAlt }: { project: Project; placeholder: string; imageAlt: string }) {
  const images = project.images?.length ? project.images : project.image ? [project.image] : []

  if (images.length === 0) {
    return (
      <figure className="mt-12 flex aspect-[16/7] items-center justify-center border border-line bg-subtle/40 p-6 text-center">
        <figcaption className="font-mono text-xs uppercase tracking-[0.14em] text-faint">{placeholder}</figcaption>
      </figure>
    )
  }

  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-2" aria-label={imageAlt}>
      {images.map((source, index) => (
        <ProjectImage key={`${source}-${index}`} source={source} alt={`${imageAlt} ${index + 1}`} placeholder={placeholder} />
      ))}
    </div>
  )
}

function ProjectDetailPage() {
  const { language, t } = useI18n()
  const { content } = usePortfolio()
  const { slug } = useParams()
  if (!content) return null
  const { projects, translations } = content
  const projectIndex = projects.findIndex((project) => project.slug === slug)
  const project = projects[projectIndex]

  if (!project) {
    return (
      <main className="container-shell flex min-h-[calc(100svh-5rem)] items-center py-20">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">{t.projectDetail.projectNotFound}</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-strong">{t.projectDetail.missingProjectTitle}</h1>
          <p className="mt-4 max-w-lg leading-7 text-muted">{t.projectDetail.missingProjectDescription}</p>
          <Link className="button button-primary mt-8" to="/#projects">{t.projectDetail.backToProjects} <span aria-hidden="true">-&gt;</span></Link>
        </div>
      </main>
    )
  }

  const previousProject = projects[projectIndex - 1]
  const nextProject = projects[projectIndex + 1]
  const localizedProject = localizeProject(project, language, translations.fr.projects)

  return (
    <main className="container-shell py-16 sm:py-24">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-accent" to="/#projects">
        <span aria-hidden="true">&lt;-</span> {t.projectDetail.backToProjects}
      </Link>

      <article className="mt-16">
        <header className="max-w-4xl border-b border-line pb-12">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">{localizedProject.category}</p>
          <h1 className="mt-5 text-5xl font-semibold leading-tight tracking-[-0.04em] text-strong sm:text-6xl">{localizedProject.title}</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">{localizedProject.shortDescription}</p>
          <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
            <div>
              <dt className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-faint">{t.projectDetail.year}</dt>
              <dd className="mt-2 text-sm text-strong">{localizedProject.year}</dd>
            </div>
            <div>
              <dt className="font-mono text-[0.68em] uppercase tracking-[0.14em] text-faint">{t.projectDetail.role}</dt>
              <dd className="mt-2 text-sm text-strong">{localizedProject.role}</dd>
            </div>
            <div>
              <dt className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-faint">{t.projectDetail.category}</dt>
              <dd className="mt-2 text-sm text-strong">{localizedProject.category}</dd>
            </div>
          </dl>
        </header>

        <ProjectGallery
          key={project.slug}
          project={localizedProject}
          placeholder={t.projectDetail.screenshotPlaceholder}
          imageAlt={`${localizedProject.title} ${t.projectDetail.projectPreviewAlt}`}
        />

        <div className="grid gap-14 py-14 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-24">
          <div className="space-y-14">
            <section aria-labelledby="overview-heading">
              <h2 id="overview-heading" className="text-2xl font-semibold tracking-tight text-strong">{t.projectDetail.overview}</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted">{localizedProject.description}</p>
            </section>

            <section aria-labelledby="features-heading">
              <h2 id="features-heading" className="text-2xl font-semibold tracking-tight text-strong">{t.projectDetail.features}</h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {localizedProject.features.map((feature) => <li key={feature} className="border-l-2 border-accent pl-4 text-sm leading-6 text-muted">{feature}</li>)}
              </ul>
            </section>

            <section aria-labelledby="challenges-heading">
              <h2 id="challenges-heading" className="text-2xl font-semibold tracking-tight text-strong">{t.projectDetail.challenges}</h2>
              <ul className="mt-5 space-y-4 text-sm leading-7 text-muted">
                {localizedProject.challenges.map((challenge) => <li key={challenge}>{challenge}</li>)}
              </ul>
            </section>

            <section aria-labelledby="learnings-heading">
              <h2 id="learnings-heading" className="text-2xl font-semibold tracking-tight text-strong">{t.projectDetail.learnings}</h2>
              <ul className="mt-5 space-y-4 text-sm leading-7 text-muted">
                {localizedProject.learnings.map((learning) => <li key={learning}>{learning}</li>)}
              </ul>
            </section>
          </div>

          <aside className="lg:border-l lg:border-line lg:pl-8">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-faint">{t.projectDetail.technologies}</h2>
            {localizedProject.technologies.length > 0 ? (
              <ul className="mt-5 flex flex-wrap gap-2 lg:flex-col lg:items-start">
                {localizedProject.technologies.map((technology) => <li key={technology} className="border border-line px-2.5 py-1 font-mono text-xs text-muted">{technology}</li>)}
              </ul>
            ) : (
              <p className="mt-5 text-sm leading-6 text-faint">{localizedProject.technologyNote ?? t.projectDetail.technologyDetailsPlaceholder}</p>
            )}
            {(localizedProject.githubUrl || localizedProject.demoUrl) && (
              <div className="mt-10 flex flex-col items-start gap-4 text-sm font-semibold">
                {localizedProject.githubUrl && <a className="inline-flex items-center gap-2 text-accent transition hover:text-accent-strong" href={localizedProject.githubUrl} target="_blank" rel="noreferrer">{t.projectDetail.github} <ArrowIcon /><span className="sr-only"> {t.contact.opensNewTab}</span></a>}
                {localizedProject.demoUrl && <a className="inline-flex items-center gap-2 text-muted transition hover:text-strong" href={localizedProject.demoUrl} target="_blank" rel="noreferrer">{t.projectDetail.liveDemo} <ArrowIcon /><span className="sr-only"> {t.contact.opensNewTab}</span></a>}
              </div>
            )}
          </aside>
        </div>

        <nav className="grid gap-4 border-t border-line pt-8 sm:grid-cols-2" aria-label={t.projectDetail.projectNavigation}>
          {previousProject ? (
            <Link className="border border-line p-5 transition hover:border-accent" to={`/projects/${previousProject.slug}`}>
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-faint">{t.projectDetail.previousProject}</span>
              <span className="mt-3 block font-semibold text-strong">{localizeProject(previousProject, language, translations.fr.projects).title}</span>
            </Link>
          ) : <span />}
          {nextProject && (
            <Link className="border border-line p-5 text-left transition hover:border-accent sm:text-right" to={`/projects/${nextProject.slug}`}>
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-faint">{t.projectDetail.nextProject}</span>
              <span className="mt-3 block font-semibold text-strong">{localizeProject(nextProject, language, translations.fr.projects).title}</span>
            </Link>
          )}
        </nav>
      </article>
    </main>
  )
}

export default ProjectDetailPage
