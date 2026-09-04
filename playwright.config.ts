import { defineConfig, devices } from '@playwright/test'

const isCi = process.env.CI !== undefined && process.env.CI !== ''

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  reporter: isCi ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3100',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'bun run start -- -p 3100',
    reuseExistingServer: false,
    timeout: 120_000,
    url: 'http://localhost:3100/sign-in',
  },
})
