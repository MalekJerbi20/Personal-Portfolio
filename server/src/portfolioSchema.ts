import { z } from 'zod'

const webUrl = z.string().refine((value) => {
  if (!value) return true
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}, 'Use a valid HTTP or HTTPS URL.')

const assetUrl = z.string().refine((value) => {
  if (!value) return true
  if (value.startsWith('/') && !value.startsWith('//')) return true
  if (value.startsWith('data:image/')) return true
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}, 'Use a valid image path or HTTP(S) URL.')

const projectTranslationSchema = z.object({
  title: z.string(),
  shortDescription: z.string(),
  description: z.string(),
  category: z.string(),
  year: z.string(),
  role: z.string(),
  features: z.array(z.string()),
  challenges: z.array(z.string()),
  learnings: z.array(z.string()),
  technologyNote: z.string().optional(),
})

const projectSchema = projectTranslationSchema.extend({
  slug: z.string(),
  technologies: z.array(z.string()),
  githubUrl: webUrl.optional(),
  demoUrl: webUrl.optional(),
  image: assetUrl.optional(),
  images: z.array(assetUrl).optional(),
})

const skillGroupSchema = z.object({
  name: z.string(),
  skills: z.array(z.string()),
})

export const portfolioSchema = z.object({
  settings: z.object({
    displayName: z.string(),
    siteUrl: webUrl,
    cvUrl: assetUrl,
    cvAvailable: z.boolean(),
    email: z.string().refine((value) => !value || z.string().email().safeParse(value).success, 'Enter a valid email address.'),
    githubUrl: webUrl,
    linkedinUrl: webUrl,
  }),
  projects: z.array(projectSchema),
  skillGroups: z.array(skillGroupSchema),
  translations: z.object({
    fr: z.object({
      projects: z.record(z.string(), projectTranslationSchema),
      skillGroups: z.record(z.string(), skillGroupSchema),
    }),
  }),
})

export type PortfolioContent = z.infer<typeof portfolioSchema>
