import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { MongoClient } from 'mongodb'
import { portfolioSchema } from '../src/portfolioSchema.js'

const mongoUri = process.env.MONGODB_URI
if (!mongoUri) {
  throw new Error('Missing required environment variable: MONGODB_URI')
}

const client = new MongoClient(mongoUri)
const database = client.db(process.env.MONGODB_DB || 'malek_portfolio')
const portfolioCollection = database.collection<{ _id: string; content: unknown; updatedAt: Date }>('portfolio')

async function seedPortfolioDocument() {
  await client.connect()

  try {
    const existing = await portfolioCollection.findOne({ _id: 'main' }, { projection: { _id: 1 } })
    if (existing) {
      console.info('Portfolio document already exists; nothing was overwritten.')
      return
    }

    const seedPath = resolve(process.cwd(), '../public/portfolio-content.json')
    const seedContent = portfolioSchema.parse(JSON.parse(await readFile(seedPath, 'utf8')))

    await portfolioCollection.insertOne({ _id: 'main', content: seedContent, updatedAt: new Date() })
    console.info('Inserted initial portfolio document from public/portfolio-content.json.')
  } finally {
    await client.close()
  }
}

void seedPortfolioDocument().catch((error: unknown) => {
  console.error('Could not seed portfolio:', error)
  process.exitCode = 1
})
