export type Language = 'en' | 'fr'

export type Project = {
  title: string
  slug: string
  shortDescription: string
  description: string
  technologies: string[]
  category: string
  year: string
  role: string
  features: string[]
  challenges: string[]
  learnings: string[]
  technologyNote?: string
  githubUrl?: string
  demoUrl?: string
  image?: string
  images?: string[]
}

export type ProjectTranslation = Pick<
  Project,
  | 'title'
  | 'shortDescription'
  | 'description'
  | 'category'
  | 'year'
  | 'role'
  | 'features'
  | 'challenges'
  | 'learnings'
  | 'technologyNote'
>

export type SkillGroup = {
  name: string
  skills: string[]
}

export type SkillGroupTranslation = SkillGroup

export type PortfolioSettings = {
  displayName: string
  siteUrl: string
  cvUrl: string
  cvAvailable: boolean
  email: string
  githubUrl: string
  linkedinUrl: string
}

export type PortfolioContent = {
  settings: PortfolioSettings
  projects: Project[]
  skillGroups: SkillGroup[]
  translations: {
    fr: {
      projects: Record<string, ProjectTranslation>
      skillGroups: Record<string, SkillGroupTranslation>
    }
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return ['title', 'slug', 'shortDescription', 'description', 'category', 'year', 'role']
    .every((key) => typeof item[key] === 'string')
    && ['technologies', 'features', 'challenges', 'learnings'].every((key) => isStringArray(item[key]))
    && ['technologyNote', 'githubUrl', 'demoUrl', 'image'].every((key) => item[key] === undefined || typeof item[key] === 'string')
    && (item.images === undefined || isStringArray(item.images))
}

function isProjectTranslation(value: unknown): value is ProjectTranslation {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return ['title', 'shortDescription', 'description', 'category', 'year', 'role']
    .every((key) => typeof item[key] === 'string')
    && ['features', 'challenges', 'learnings'].every((key) => isStringArray(item[key]))
    && (item.technologyNote === undefined || typeof item.technologyNote === 'string')
}

function isSkillGroup(value: unknown): value is SkillGroup {
  return Boolean(value && typeof value === 'object'
    && typeof (value as Record<string, unknown>).name === 'string'
    && isStringArray((value as Record<string, unknown>).skills))
}

export function parsePortfolioContent(value: unknown): PortfolioContent {
  if (!value || typeof value !== 'object') {
    throw new Error('Portfolio data must be a JSON object.')
  }

  const content = value as Record<string, unknown>
  const settings = content.settings as Record<string, unknown> | undefined
  const translations = content.translations as Record<string, unknown> | undefined
  const french = translations?.fr as Record<string, unknown> | undefined
  const frenchProjects = french?.projects as Record<string, unknown> | undefined
  const frenchSkills = french?.skillGroups as Record<string, unknown> | undefined

  if (!settings || !['displayName', 'siteUrl', 'cvUrl', 'email', 'githubUrl', 'linkedinUrl']
    .every((key) => typeof settings[key] === 'string') || typeof settings.cvAvailable !== 'boolean') {
    throw new Error('Portfolio settings are incomplete or invalid.')
  }

  if (!Array.isArray(content.projects) || !content.projects.every(isProject)) {
    throw new Error('Each English project must include its required fields.')
  }
  if (!Array.isArray(content.skillGroups) || !content.skillGroups.every(isSkillGroup)) {
    throw new Error('English skill groups are invalid.')
  }
  if (!frenchProjects || !content.projects.every((project) => isProjectTranslation(frenchProjects[(project as Project).slug]))) {
    throw new Error('Add French content for every project, using its slug as the key.')
  }
  if (!frenchSkills || !content.skillGroups.every((group) => isSkillGroup(frenchSkills[(group as SkillGroup).name]))) {
    throw new Error('Add French content for every skill group, using its English name as the key.')
  }

  return content as unknown as PortfolioContent
}

export function localizeProject(
  project: Project,
  language: Language,
  frenchTranslations: Record<string, ProjectTranslation>,
): Project {
  return language === 'fr' ? { ...project, ...frenchTranslations[project.slug] } : project
}

export function localizeSkillGroup(
  group: SkillGroup,
  language: Language,
  frenchTranslations: Record<string, SkillGroupTranslation>,
): SkillGroupTranslation {
  return language === 'fr' ? frenchTranslations[group.name] : group
}
