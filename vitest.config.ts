import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
      'server-only': fileURLToPath(
        new URL('./node_modules/server-only/empty.js', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'happy-dom',
    exclude: [
      'e2e/**',
      'node_modules/**',
      '**/*.integration.test.{ts,tsx}',
      '**/*.workflow.test.ts',
    ],
    include: ['src/**/*.test.{ts,tsx}', 'tooling/**/*.test.ts'],
    root: import.meta.dirname,
    setupFiles: ['./test/setup.ts'],
  },
})
