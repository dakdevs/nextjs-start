import { fileURLToPath } from 'node:url'

import { workflow } from '@workflow/vitest'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [workflow()],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
      'server-only': fileURLToPath(
        new URL('./node_modules/server-only/empty.js', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.workflow.test.ts'],
    testTimeout: 60_000,
  },
})
