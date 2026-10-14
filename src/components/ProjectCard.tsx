import type { Project } from '../data/portfolio'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/useI18n'

type ProjectCardProps = {
  project: Project
  index: number
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 16 16" fill="none">
      <path d="M3.5 12.5 12.5 3.5m0 0H5.75m6.75 0v6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ProjectCard({ project, index }: ProjectCardProps) {
  const { t } = useI18n()

  return (
    <article className="group flex min-h-80 flex-col justify-between border border-line bg-raised p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/60 motion-reduce:transition-none">
      <div>
        <div className="mb-10 flex items-start justify-between gap-4">
          <span className="font-mono text-xs text-faint">{String(index + 1).padStart(2, '0')}</span>
          <span className="size-2 rounded-full bg-accent transition group-hover:scale-125 motion-reduce:transition-none" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-strong">
          <Link className="transition hover:text-accent" to={`/projects/${project.slug}`}>
            {project.title}
          </Link>
        </h3>
        <p className="mt-3 text-sm leading-6 text-muted">{project.shortDescription}</p>
      </div>
      <div className="mt-8">
        <ul className="flex flex-wrap gap-2" aria-label={`${project.title} ${t.projects.technologies}`}>
          {project.technologies.map((technology) => (
            <li key={technology} className="border border-line px-2.5 py-1 font-mono text-[0.68rem] text-faint">
              {technology}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-5 text-sm font-semibold">
          <Link className="inline-flex items-center gap-2 text-accent transition hover:text-accent-strong" to={`/projects/${project.slug}`}>
            {t.projects.viewProject} <ArrowIcon />
          </Link>
          {project.githubUrl && (
            <a className="inline-flex items-center gap-2 text-muted transition hover:text-strong" href={project.githubUrl} target="_blank" rel="noreferrer">
              {t.projects.repository} <ArrowIcon /><span className="sr-only"> {t.contact.opensNewTab}</span>
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProjectCard
