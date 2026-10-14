import { useId, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { localizeProject, parsePortfolioContent, type PortfolioContent, type Project, type ProjectTranslation, type SkillGroup } from '../data/portfolio'
import { usePortfolio } from '../data/usePortfolio'
import { apiRequest } from '../data/api'
import { useI18n } from '../i18n/useI18n'

function TextField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  const id = useId()
  return (
    <label className="block space-y-2 text-sm text-muted" htmlFor={id}>
      <span className="block font-medium text-strong">{label}</span>
      <input id={id} className="min-h-11 w-full border border-line bg-canvas px-3 text-strong focus-visible:outline" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function TextAreaField({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  const id = useId()
  return (
    <label className="block space-y-2 text-sm text-muted" htmlFor={id}>
      <span className="block font-medium text-strong">{label}</span>
      <textarea id={id} className="w-full border border-line bg-canvas px-3 py-2 text-strong focus-visible:outline" rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function linesToText(items: string[]) {
  return items.join('\n')
}

function textToLines(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

function createProject(slug: string): Project {
  return {
    title: 'New project',
    slug,
    shortDescription: '',
    description: '',
    technologies: [],
    technologyNote: '',
    category: '',
    year: '',
    role: '',
    features: [],
    challenges: [],
    learnings: [],
    githubUrl: '',
    demoUrl: '',
    image: '',
    images: [],
  }
}

function createFrenchProject(): ProjectTranslation {
  return {
    title: 'Nouveau projet',
    shortDescription: '',
    description: '',
    category: '',
    year: '',
    role: '',
    technologyNote: '',
    features: [],
    challenges: [],
    learnings: [],
  }
}

function validateBeforePublish(content: PortfolioContent, language: 'en' | 'fr', requiredMessage: string, duplicateMessage: string) {
  const seenSlugs = new Set<string>()
  for (const project of content.projects) {
    const french = content.translations.fr.projects[project.slug]
    if (!project.slug.trim() || !project.title.trim() || !french?.title.trim()) {
      throw new Error(requiredMessage)
    }
    if (seenSlugs.has(project.slug.trim())) {
      throw new Error(duplicateMessage)
    }
    seenSlugs.add(project.slug.trim())
  }
  parsePortfolioContent(content)
  void language
}

function AdminPage() {
  const { content: loadedContent, hasDraft, updateContent, saveDraft, publishContent, discardDraft } = usePortfolio()
  const { language, t } = useI18n()
  const copy = t.admin
  const [state, setState] = useState({ projectIndex: 0, message: '' })
  const [token, setToken] = useState<string | null>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const content = loadedContent!

  const project = content.projects[state.projectIndex]
  const projectTranslation = project ? content.translations.fr.projects[project.slug] : undefined

  function updateSettings<K extends keyof PortfolioContent['settings']>(key: K, value: PortfolioContent['settings'][K]) {
    updateContent({ ...content, settings: { ...content.settings, [key]: value } })
  }

  function updateProject<K extends keyof Project>(key: K, value: Project[K]) {
    if (!project) return
    const previousSlug = project.slug
    const nextSlug = key === 'slug' ? String(value) : previousSlug
    if (key === 'slug' && content.projects.some((item, index) => index !== state.projectIndex && item.slug === nextSlug)) {
      setState({ ...state, message: copy.duplicateSlug })
      return
    }
    const frenchProjects = { ...content.translations.fr.projects }
    if (previousSlug !== nextSlug) {
      frenchProjects[nextSlug] = frenchProjects[previousSlug] ?? createFrenchProject()
      delete frenchProjects[previousSlug]
    }
    const projects = content.projects.map((item, index) => index === state.projectIndex ? { ...item, [key]: value } : item)
    updateContent({ ...content, projects, translations: { fr: { ...content.translations.fr, projects: frenchProjects } } })
  }

  function updateFrenchProject<K extends keyof ProjectTranslation>(key: K, value: ProjectTranslation[K]) {
    if (!project || !projectTranslation) return
    updateContent({
      ...content,
      translations: {
        fr: {
          ...content.translations.fr,
          projects: { ...content.translations.fr.projects, [project.slug]: { ...projectTranslation, [key]: value } },
        },
      },
    })
  }

  function addProject() {
    let suffix = content.projects.length + 1
    let slug = `new-project-${suffix}`
    while (content.projects.some((item) => item.slug === slug)) {
      suffix += 1
      slug = `new-project-${suffix}`
    }
    updateContent({
      ...content,
      projects: [...content.projects, createProject(slug)],
      translations: {
        fr: {
          ...content.translations.fr,
          projects: { ...content.translations.fr.projects, [slug]: createFrenchProject() },
        },
      },
    })
    setState({ projectIndex: content.projects.length, message: '' })
  }

  function removeProject() {
    if (!project) return
    const frenchProjects = { ...content.translations.fr.projects }
    delete frenchProjects[project.slug]
    const projects = content.projects.filter((_, index) => index !== state.projectIndex)
    updateContent({ ...content, projects, translations: { fr: { ...content.translations.fr, projects: frenchProjects } } })
    setState({ projectIndex: Math.max(0, state.projectIndex - 1), message: '' })
  }

  function updateSkillGroup(index: number, nextGroup: SkillGroup, isFrench: boolean) {
    if (isFrench) {
      const englishName = content.skillGroups[index]?.name
      if (!englishName) return
      const skillGroups = { ...content.translations.fr.skillGroups, [englishName]: nextGroup }
      updateContent({ ...content, translations: { fr: { ...content.translations.fr, skillGroups } } })
      return
    }

    const previousName = content.skillGroups[index]?.name
    const skillGroups = content.skillGroups.map((group, groupIndex) => groupIndex === index ? nextGroup : group)
    const frenchGroups = { ...content.translations.fr.skillGroups }
    if (previousName && previousName !== nextGroup.name) {
      frenchGroups[nextGroup.name] = frenchGroups[previousName]
      delete frenchGroups[previousName]
    }
    updateContent({ ...content, skillGroups, translations: { fr: { ...content.translations.fr, skillGroups: frenchGroups } } })
  }

  function updateArrayField(field: 'features' | 'challenges' | 'learnings', value: string, isFrench: boolean) {
    if (isFrench) updateFrenchProject(field, textToLines(value))
    else updateProject(field, textToLines(value))
  }

  function saveCurrentDraft() {
    try {
      validateBeforePublish(content, language, copy.requiredFields, copy.duplicateSlug)
      saveDraft()
      setState({ ...state, message: copy.draftSaved })
    } catch (saveError) {
      setState({ ...state, message: saveError instanceof Error ? saveError.message : copy.requiredFields })
    }
  }

  function exportContent() {
    try {
      validateBeforePublish(content, language, copy.requiredFields, copy.duplicateSlug)
      saveDraft()
      const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'portfolio-content.json'
      link.click()
      URL.revokeObjectURL(url)
      setState({ ...state, message: copy.exported })
    } catch (exportError) {
      setState({ ...state, message: exportError instanceof Error ? exportError.message : copy.requiredFields })
    }
  }

  async function handleLogin(event: ChangeEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthError('')
    try {
      const result = await apiRequest<{ token: string }>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      setToken(result.token)
      setLoginPassword('')
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : ''
      setAuthError(/failed to fetch|request failed \(5\d\d\)/i.test(message) ? copy.backendUnavailable : copy.signInFailed)
    }
  }

  async function handlePublish() {
    if (!token) return
    setIsPublishing(true)
    try {
      validateBeforePublish(content, language, copy.requiredFields, copy.duplicateSlug)
      await publishContent(token)
      setState({ ...state, message: copy.publishSuccess })
    } catch {
      setState({ ...state, message: copy.publishFailed })
    } finally {
      setIsPublishing(false)
    }
  }

  async function uploadFile(file: File, kind: 'cv' | 'project') {
    if (!token) throw new Error('Sign in to upload files.')
    const form = new FormData()
    form.append('kind', kind)
    form.append('file', file)
    const uploaded = await apiRequest<{ url: string }>('/admin/uploads', {
      method: 'POST',
      token,
      body: form,
    })
    return uploaded.url
  }

  async function handleCvUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    if (file.type !== 'application/pdf' || file.size > 20 * 1024 * 1024) {
      setState({ ...state, message: copy.uploadSizeLimit })
      return
    }
    setIsUploading(true)
    try {
      const url = await uploadFile(file, 'cv')
      updateContent({ ...content, settings: { ...content.settings, cvUrl: url, cvAvailable: true } })
      setState({ ...state, message: copy.uploadSuccess })
    } catch {
      setState({ ...state, message: copy.uploadFailed })
    } finally {
      setIsUploading(false)
    }
  }

  async function handleProjectImagesUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? [])
    event.currentTarget.value = ''
    if (!project || files.length === 0) return
    if (files.some((file) => !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024)) {
      setState({ ...state, message: copy.uploadSizeLimit })
      return
    }
    setIsUploading(true)
    try {
      const urls = await Promise.all(files.map((file) => uploadFile(file, 'project')))
      const currentImages = project.images?.length ? project.images : project.image ? [project.image] : []
      updateProject('images', [...currentImages, ...urls])
      setState({ ...state, message: copy.uploadSuccess })
    } catch {
      setState({ ...state, message: copy.uploadFailed })
    } finally {
      setIsUploading(false)
    }
  }

  async function importContent(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    try {
      const parsed = parsePortfolioContent(JSON.parse(await file.text()))
      updateContent(parsed)
      saveDraft(parsed)
      setState({ projectIndex: 0, message: copy.imported })
    } catch (importError) {
      setState({ ...state, message: importError instanceof Error ? importError.message : copy.loadError })
    }
  }

  function handleDiscard() {
    discardDraft()
    setState({ projectIndex: 0, message: '' })
  }

  if (!token) {
    return (
      <main className="container-shell max-w-xl py-16">
        <header className="mb-8">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">{copy.title}</p>
          <h1 className="mt-3 text-3xl font-semibold text-strong">{copy.signInTitle}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{copy.signInDescription}</p>
        </header>
        <form className="space-y-5 border border-line bg-raised p-6" onSubmit={handleLogin}>
          <TextField label={copy.adminEmail} value={loginEmail} onChange={setLoginEmail} type="email" />
          <TextField label={copy.adminPassword} value={loginPassword} onChange={setLoginPassword} type="password" />
          {authError && <p className="text-sm text-accent" role="alert">{authError}</p>}
          <button className="button button-primary" type="submit">{copy.signIn}</button>
        </form>
      </main>
    )
  }

  return (
    <main className="container-shell py-12 sm:py-16">
      <header className="mb-10 max-w-3xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">{copy.title}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-strong sm:text-4xl">{copy.description}</h1>
        <p className="mt-5 border-l-2 border-accent pl-4 text-sm leading-6 text-muted">{copy.staticNotice}</p>
        {hasDraft && <p className="mt-3 text-sm text-accent" role="status">{copy.draftNotice}</p>}
      </header>

      <div className="mb-12 flex flex-wrap gap-3 border-b border-line pb-8">
        <button className="button button-primary" type="button" onClick={saveCurrentDraft}>{copy.saveDraft}</button>
        <button className="button button-primary" type="button" onClick={handlePublish} disabled={isPublishing || isUploading}>
          {isPublishing ? copy.publishing : copy.publishChanges}
        </button>
        <button className="button button-secondary" type="button" onClick={exportContent}>{copy.exportJson}</button>
        <label className="button button-secondary cursor-pointer">
          {copy.importJson}
          <input className="sr-only" type="file" accept="application/json,.json" onChange={importContent} />
        </label>
        {hasDraft && <button className="button button-secondary" type="button" onClick={handleDiscard}>{copy.discardDraft}</button>}
        <button className="button button-secondary" type="button" onClick={() => setToken(null)}>{copy.signOut}</button>
        <Link className="button button-secondary" to="/">{copy.preview}</Link>
      </div>
      {state.message && <p className="mb-8 text-sm text-accent" role="status" aria-live="polite">{state.message}</p>}
      {isUploading && <p className="mb-8 text-sm text-muted" role="status">{copy.uploading}</p>}

      <section className="mb-14" aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="mb-6 text-2xl font-semibold text-strong">{copy.profile}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <TextField label={copy.displayName} value={content.settings.displayName} onChange={(value) => updateSettings('displayName', value)} />
          <TextField label={copy.siteUrl} value={content.settings.siteUrl} onChange={(value) => updateSettings('siteUrl', value)} />
          <TextField label={copy.cvUrl} value={content.settings.cvUrl} onChange={(value) => updateSettings('cvUrl', value)} />
          <TextField label={copy.email} value={content.settings.email} onChange={(value) => updateSettings('email', value)} type="email" />
          <TextField label={copy.github} value={content.settings.githubUrl} onChange={(value) => updateSettings('githubUrl', value)} />
          <TextField label={copy.linkedin} value={content.settings.linkedinUrl} onChange={(value) => updateSettings('linkedinUrl', value)} />
          <label className="flex min-h-11 items-center gap-3 text-sm text-strong">
            <input className="size-4 accent-accent" type="checkbox" checked={content.settings.cvAvailable} onChange={(event) => updateSettings('cvAvailable', event.target.checked)} />
            {copy.cvAvailable}
          </label>
          <label className="block space-y-2 text-sm text-muted">
            <span className="block font-medium text-strong">{copy.uploadCv}</span>
            <input className="block min-h-11 w-full text-sm file:mr-3 file:min-h-11 file:border-0 file:bg-subtle file:px-3 file:text-strong" type="file" accept="application/pdf,.pdf" disabled={isUploading} onChange={handleCvUpload} />
            <span className="block text-xs leading-5 text-faint">{copy.uploadSizeLimit}</span>
          </label>
        </div>
      </section>

      <section className="mb-14" aria-labelledby="projects-heading">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 id="projects-heading" className="text-2xl font-semibold text-strong">{copy.projects}</h2>
          <button className="button button-secondary" type="button" onClick={addProject}>{copy.addProject}</button>
        </div>
        <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <nav className="space-y-2" aria-label={copy.projects}>
            {content.projects.map((item, index) => (
              <button
                key={`${item.slug}-${index}`}
                type="button"
                className={`block w-full border px-4 py-3 text-left text-sm transition ${state.projectIndex === index ? 'border-accent bg-subtle text-strong' : 'border-line text-muted hover:text-strong'}`}
                aria-current={state.projectIndex === index ? 'true' : undefined}
                onClick={() => setState({ ...state, projectIndex: index, message: '' })}
              >
                {localizeProject(item, language, content.translations.fr.projects).title || copy.titleField}
              </button>
            ))}
          </nav>

          {project && projectTranslation && (
            <div className="min-w-0">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-strong">{copy.projectFields}</h3>
                <button className="text-sm text-muted underline decoration-line underline-offset-4 transition hover:text-strong" type="button" onClick={removeProject}>{copy.removeProject}</button>
              </div>
              <div className="grid gap-8 xl:grid-cols-2">
                <fieldset className="min-w-0 space-y-4 border-t border-accent pt-5">
                  <legend className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent">{copy.english}</legend>
                  <TextField label={copy.titleField} value={project.title} onChange={(value) => updateProject('title', value)} />
                  <TextField label={copy.slug} value={project.slug} onChange={(value) => updateProject('slug', value)} />
                  <TextField label={copy.shortDescription} value={project.shortDescription} onChange={(value) => updateProject('shortDescription', value)} />
                  <TextAreaField label={copy.descriptionField} value={project.description} onChange={(value) => updateProject('description', value)} />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <TextField label={copy.category} value={project.category} onChange={(value) => updateProject('category', value)} />
                    <TextField label={copy.year} value={project.year} onChange={(value) => updateProject('year', value)} />
                    <TextField label={copy.role} value={project.role} onChange={(value) => updateProject('role', value)} />
                  </div>
                  <TextField label={copy.technologies} value={project.technologies.join(', ')} onChange={(value) => updateProject('technologies', value.split(',').map((item) => item.trim()).filter(Boolean))} />
                  <TextField label={copy.technologyNote} value={project.technologyNote ?? ''} onChange={(value) => updateProject('technologyNote', value)} />
                  <TextAreaField label={copy.features} value={linesToText(project.features)} onChange={(value) => updateArrayField('features', value, false)} rows={3} />
                  <TextAreaField label={copy.challenges} value={linesToText(project.challenges)} onChange={(value) => updateArrayField('challenges', value, false)} rows={3} />
                  <TextAreaField label={copy.learnings} value={linesToText(project.learnings)} onChange={(value) => updateArrayField('learnings', value, false)} rows={3} />
                </fieldset>

                <fieldset className="min-w-0 space-y-4 border-t border-accent pt-5">
                  <legend className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent">{copy.french}</legend>
                  <TextField label={copy.titleField} value={projectTranslation.title} onChange={(value) => updateFrenchProject('title', value)} />
                  <TextField label={copy.shortDescription} value={projectTranslation.shortDescription} onChange={(value) => updateFrenchProject('shortDescription', value)} />
                  <TextAreaField label={copy.descriptionField} value={projectTranslation.description} onChange={(value) => updateFrenchProject('description', value)} />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <TextField label={copy.category} value={projectTranslation.category} onChange={(value) => updateFrenchProject('category', value)} />
                    <TextField label={copy.year} value={projectTranslation.year} onChange={(value) => updateFrenchProject('year', value)} />
                    <TextField label={copy.role} value={projectTranslation.role} onChange={(value) => updateFrenchProject('role', value)} />
                  </div>
                  <TextField label={copy.technologyNote} value={projectTranslation.technologyNote ?? ''} onChange={(value) => updateFrenchProject('technologyNote', value)} />
                  <TextAreaField label={copy.features} value={linesToText(projectTranslation.features)} onChange={(value) => updateArrayField('features', value, true)} rows={3} />
                  <TextAreaField label={copy.challenges} value={linesToText(projectTranslation.challenges)} onChange={(value) => updateArrayField('challenges', value, true)} rows={3} />
                  <TextAreaField label={copy.learnings} value={linesToText(projectTranslation.learnings)} onChange={(value) => updateArrayField('learnings', value, true)} rows={3} />
                </fieldset>
              </div>

              <div className="mt-10 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
                <TextField label={copy.githubUrl} value={project.githubUrl ?? ''} onChange={(value) => updateProject('githubUrl', value)} />
                <TextField label={copy.demoUrl} value={project.demoUrl ?? ''} onChange={(value) => updateProject('demoUrl', value)} />
                <TextAreaField
                  label={copy.imageReference}
                  value={linesToText(project.images?.length ? project.images : project.image ? [project.image] : [])}
                  onChange={(value) => updateProject('images', textToLines(value))}
                  rows={3}
                />
                <label className="block space-y-2 text-sm text-muted">
                  <span className="block font-medium text-strong">{copy.uploadImages}</span>
                  <input className="block min-h-11 w-full text-sm file:mr-3 file:min-h-11 file:border-0 file:bg-subtle file:px-3 file:text-strong" type="file" accept="image/*" multiple disabled={isUploading} onChange={handleProjectImagesUpload} />
                  <span className="block text-xs leading-5 text-faint">{copy.imageHelp}</span>
                </label>
              </div>
              {(project.images?.length ? project.images : project.image ? [project.image] : []).length > 0 && (
                <div className="mt-8">
                  <h4 className="mb-4 text-sm font-semibold text-strong">{copy.imageGallery}</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(project.images?.length ? project.images : project.image ? [project.image] : []).map((image, imageIndex) => (
                      <figure key={`${image}-${imageIndex}`} className="relative border border-line bg-subtle/30 p-2">
                        <img className="aspect-video w-full object-contain" src={image} alt={`${project.title} ${t.projectDetail.projectImageAlt} ${imageIndex + 1}`} />
                        <figcaption className="mt-2 flex items-center justify-between gap-3 text-xs text-faint">
                          <span>{imageIndex + 1} / {(project.images?.length ? project.images : [project.image]).length}</span>
                          <button className="underline underline-offset-4 hover:text-strong" type="button" onClick={() => updateProject('images', (project.images?.length ? project.images : [image]).filter((_, index) => index !== imageIndex))}>{copy.removeUploadedImage}</button>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="skills-heading">
        <h2 id="skills-heading" className="mb-6 text-2xl font-semibold text-strong">{copy.skillGroups}</h2>
        <div className="grid gap-8 xl:grid-cols-2">
          {content.skillGroups.map((group, index) => {
            const frenchGroup = content.translations.fr.skillGroups[group.name]
            if (!frenchGroup) return null
            return (
              <div key={`${group.name}-${index}`} className="grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
                <div className="space-y-4">
                  <TextField label={`${copy.english}: ${copy.category}`} value={group.name} onChange={(name) => updateSkillGroup(index, { ...group, name }, false)} />
                  <TextAreaField label={`${copy.english}: ${copy.technologies}`} value={group.skills.join('\n')} onChange={(value) => updateSkillGroup(index, { ...group, skills: textToLines(value) }, false)} rows={5} />
                </div>
                <div className="space-y-4">
                  <TextField label={`${copy.french}: ${copy.category}`} value={frenchGroup.name} onChange={(name) => updateSkillGroup(index, { ...frenchGroup, name }, true)} />
                  <TextAreaField label={`${copy.french}: ${copy.technologies}`} value={frenchGroup.skills.join('\n')} onChange={(value) => updateSkillGroup(index, { ...frenchGroup, skills: textToLines(value) }, true)} rows={5} />
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default AdminPage
