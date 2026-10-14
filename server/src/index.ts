import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import bcrypt from 'bcryptjs'
import { v2 as cloudinary } from 'cloudinary'
import cors from 'cors'
import express, { type ErrorRequestHandler } from 'express'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import { jwtVerify, SignJWT } from 'jose'
import multer from 'multer'
import { MongoClient } from 'mongodb'
import { z } from 'zod'
import { portfolioSchema, type PortfolioContent } from './portfolioSchema.js'

const requiredEnvironment = ['MONGODB_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD_HASH', 'JWT_SECRET'] as const
for (const name of requiredEnvironment) {
  if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`)
}

const jwtSecretValue = process.env.JWT_SECRET!
if (jwtSecretValue.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters.')

const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? ''
const cloudApiKey = process.env.CLOUDINARY_API_KEY ?? ''
const cloudApiSecret = process.env.CLOUDINARY_API_SECRET ?? ''
const cloudinaryReady = Boolean(cloudName && cloudApiKey && cloudApiSecret)
if (cloudinaryReady) {
  cloudinary.config({ cloud_name: cloudName, api_key: cloudApiKey, api_secret: cloudApiSecret })
}

const client = new MongoClient(process.env.MONGODB_URI!)
const database = client.db(process.env.MONGODB_DB || 'malek_portfolio')
const portfolioCollection = database.collection<{ _id: string; content: PortfolioContent; updatedAt: Date }>('portfolio')
const allowedOrigins = (process.env.FRONTEND_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
const tokenSecret = new TextEncoder().encode(jwtSecretValue)

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(helmet())
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }
    callback(new Error('This origin is not allowed.'))
  },
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '2mb' }))

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' },
})
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many uploads. Try again later.' },
})
const multipartUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 1, fields: 1, fieldSize: 100 },
  fileFilter(_request, file, callback) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/avif']
    callback(null, allowedTypes.includes(file.mimetype))
  },
})

const loginSchema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(200) })
const uploadSchema = z.object({ kind: z.enum(['cv', 'project']) })

async function requireAdmin(request: express.Request, response: express.Response, next: express.NextFunction) {
  const authorization = request.header('authorization')
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!token) {
    response.status(401).json({ error: 'Admin authentication required.' })
    return
  }

  try {
    const { payload } = await jwtVerify(token, tokenSecret)
    if (payload.sub !== 'admin' || payload.role !== 'admin') {
      response.status(401).json({ error: 'Admin authentication required.' })
      return
    }
    next()
  } catch {
    response.status(401).json({ error: 'Admin session expired. Sign in again.' })
  }
}

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }))

app.get('/api/portfolio', async (_request, response, next) => {
  try {
    const document = await portfolioCollection.findOne({ _id: 'main' })
    if (!document) {
      response.status(503).json({ error: 'Portfolio content is not initialized.' })
      return
    }
    response.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120')
    response.json(document.content)
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/login', loginLimiter, async (request, response, next) => {
  try {
    const credentials = loginSchema.safeParse(request.body)
    if (!credentials.success) {
      response.status(400).json({ error: 'Enter a valid email and password.' })
      return
    }

    const correctEmail = credentials.data.email.toLowerCase() === process.env.ADMIN_EMAIL!.toLowerCase()
    const correctPassword = await bcrypt.compare(credentials.data.password, process.env.ADMIN_PASSWORD_HASH!)
    if (!correctEmail || !correctPassword) {
      response.status(401).json({ error: 'Email or password is incorrect.' })
      return
    }

    const token = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('admin')
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(tokenSecret)

    response.setHeader('Cache-Control', 'no-store')
    response.json({ token, expiresIn: 1800 })
  } catch (error) {
    next(error)
  }
})

app.get('/api/admin/me', requireAdmin, (_request, response) => {
  response.setHeader('Cache-Control', 'no-store')
  response.json({ authenticated: true })
})

app.put('/api/admin/portfolio', requireAdmin, async (request, response, next) => {
  try {
    const content = portfolioSchema.safeParse(request.body)
    if (!content.success) {
      response.status(400).json({ error: 'Portfolio data is invalid.', details: content.error.flatten() })
      return
    }

    const projectSlugs = content.data.projects.map((project) => project.slug.trim())
    if (projectSlugs.some((slug) => !slug) || new Set(projectSlugs).size !== projectSlugs.length) {
      response.status(400).json({ error: 'Project URL slugs must be non-empty and unique.' })
      return
    }
    if (!content.data.projects.every((project) => content.data.translations.fr.projects[project.slug]?.title.trim())) {
      response.status(400).json({ error: 'Every project needs a French title.' })
      return
    }

    await portfolioCollection.updateOne(
      { _id: 'main' },
      { $set: { content: content.data, updatedAt: new Date() } },
      { upsert: true },
    )
    response.setHeader('Cache-Control', 'no-store')
    response.json({ saved: true, content: content.data })
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/uploads', requireAdmin, uploadLimiter, multipartUpload.single('file'), async (request, response, next) => {
  const parsed = uploadSchema.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ error: 'Choose a supported upload type.' })
    return
  }
  const file = request.file
  if (!file) {
    response.status(400).json({ error: 'Choose a valid file to upload.' })
    return
  }
  if (parsed.data.kind === 'cv' && file.mimetype !== 'application/pdf') {
    response.status(400).json({ error: 'CV uploads must be PDF files.' })
    return
  }
  if (parsed.data.kind === 'project' && (!file.mimetype.startsWith('image/') || file.size > 10 * 1024 * 1024)) {
    response.status(400).json({ error: 'Project images must be supported image files under 10 MB.' })
    return
  }
  if (!cloudinaryReady) {
    response.status(503).json({ error: 'File uploads are not configured on the API.' })
    return
  }

  const folder = parsed.data.kind === 'cv' ? 'portfolio/cv' : 'portfolio/projects'
  const allowedFormats = parsed.data.kind === 'cv' ? 'pdf' : 'jpg,jpeg,png,webp,avif'
  try {
    const uploaded = await new Promise<{ secure_url: string; public_id: string; format: string }>((resolveUpload, rejectUpload) => {
      cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto', allowed_formats: allowedFormats.split(',') },
        (error, result) => {
          if (error) return rejectUpload(error)
          if (!result) return rejectUpload(new Error('Cloudinary returned no upload result.'))
          resolveUpload({ secure_url: result.secure_url, public_id: result.public_id, format: result.format })
        },
      ).end(file.buffer)
    })
    response.setHeader('Cache-Control', 'no-store')
    response.json({ url: uploaded.secure_url, assetId: uploaded.public_id, format: uploaded.format })
  } catch (error) {
    next(error)
  }
})

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (response.headersSent) return
  if (error instanceof multer.MulterError) {
    response.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: 'The uploaded file exceeds the allowed limits.' })
    return
  }
  if (error instanceof Error && error.message === 'This origin is not allowed.') {
    response.status(403).json({ error: error.message })
    return
  }
  console.error('API request failed:', error)
  response.status(500).json({ error: 'An unexpected server error occurred.' })
}
app.use(errorHandler)

async function start() {
  await client.connect()
  await database.command({ ping: 1 })

  const existing = await portfolioCollection.findOne({ _id: 'main' }, { projection: { _id: 1 } })
  if (!existing) {
    const seedPath = resolve(process.cwd(), '../public/portfolio-content.json')
    const seedContent = portfolioSchema.parse(JSON.parse(await readFile(seedPath, 'utf8')))
    await portfolioCollection.insertOne({ _id: 'main', content: seedContent, updatedAt: new Date() })
    console.info('Seeded MongoDB with the existing portfolio JSON.')
  }

  const port = Number(process.env.PORT ?? 4000)
  app.listen(port, '0.0.0.0', () => console.info(`Portfolio API listening on port ${port}.`))
}

start().catch((error: unknown) => {
  console.error('Portfolio API could not start:', error)
  process.exit(1)
})
