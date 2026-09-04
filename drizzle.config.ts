import { defineConfig } from 'drizzle-kit'

import { env } from './src/config/env'

export default defineConfig({
  dialect: 'postgresql',
  out: './drizzle',
  schema: './src/db/schema.ts',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
})
