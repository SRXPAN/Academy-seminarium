import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { PrismaClient } from '@prisma/client'

// Load .env
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: resolve(__dirname, '../../.env') })

// Base client
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? [] : ['error', 'warn'],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton>
}

const basePrisma = globalForPrisma.prisma ?? prismaClientSingleton()

export const prisma = basePrisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma