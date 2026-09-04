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
    environment: 'node',
    // Integration files share one disposable database; serialize them so
    // fixture cleanup in one file cannot delete another file's rows.
    fileParallelism: false,
    include: ['src/**/*.integration.test.ts'],
    testTimeout: 30_000,
  },
})
