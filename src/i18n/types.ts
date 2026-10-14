import type { Project } from '../data/portfolio'

export type Language = 'en' | 'fr'

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

export type SkillGroupTranslation = {
  name: string
  skills: string[]
}

export type UiTranslations = {
  siteTitle: string
  metaDescription: string
  nav: {
    home: string
    about: string
    projects: string
    skills: string
    contact: string
    primary: string
    mobile: string
    openMenu: string
    closeMenu: string
  }
  language: {
    label: string
    english: string
    french: string
  }
  theme: {
    switchToLight: string
    switchToDark: string
    lightMode: string
    darkMode: string
  }
  hero: {
    eyebrow: string
    title: string
    description: string
    viewProjects: string
    availability: string
  }
  cv: {
    view: string
    download: string
    notAvailable: string
  }
  projects: {
    eyebrow: string
    title: string
    viewProject: string
    repository: string
    technologies: string
  }
  about: {
    eyebrow: string
    title: string
    paragraphs: string[]
  }
  skills: {
    eyebrow: string
    title: string
  }
  contact: {
    eyebrow: string
    title: string
    description: string
    emailPlaceholder: string
    githubPlaceholder: string
    linkedinPlaceholder: string
    email: string
    github: string
    linkedin: string
    contactMe: string
    opensNewTab: string
  }
  footer: {
    navigation: string
    contact: string
  }
  projectDetail: {
    backToProjects: string
    projectNotFound: string
    missingProjectTitle: string
    missingProjectDescription: string
    year: string
    role: string
    category: string
    screenshotPlaceholder: string
    projectPreviewAlt: string
    projectImageAlt: string
    overview: string
    features: string
    challenges: string
    learnings: string
    technologies: string
    technologyDetailsPlaceholder: string
    github: string
    liveDemo: string
    previousProject: string
    nextProject: string
    projectNavigation: string
  }
  notFound: {
    eyebrow: string
    title: string
    description: string
    returnHome: string
  }
  admin: {
    title: string
    description: string
    signInTitle: string
    signInDescription: string
    adminEmail: string
    adminPassword: string
    signIn: string
    signOut: string
    signInFailed: string
    backendUnavailable: string
    publishChanges: string
    publishing: string
    publishSuccess: string
    publishFailed: string
    uploadCv: string
    uploadImages: string
    imageGallery: string
    removeUploadedImage: string
    uploadSuccess: string
    uploadFailed: string
    uploadSizeLimit: string
    uploading: string
    staticNotice: string
    profile: string
    displayName: string
    siteUrl: string
    cvUrl: string
    cvAvailable: string
    email: string
    github: string
    linkedin: string
    projects: string
    addProject: string
    removeProject: string
    projectFields: string
    english: string
    french: string
    titleField: string
    slug: string
    shortDescription: string
    descriptionField: string
    category: string
    year: string
    role: string
    technologies: string
    technologyNote: string
    features: string
    challenges: string
    learnings: string
    githubUrl: string
    demoUrl: string
    imageReference: string
    imageHelp: string
    listHelp: string
    skillGroups: string
    saveDraft: string
    exportJson: string
    importJson: string
    discardDraft: string
    draftSaved: string
    imported: string
    exported: string
    draftNotice: string
    loading: string
    loadError: string
    retry: string
    requiredFields: string
    duplicateSlug: string
    invalidImage: string
    openEditor: string
    preview: string
  }
}

export type LocalizedProject = Project
