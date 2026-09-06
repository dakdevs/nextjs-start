import { defineConfig, devices } from '@playwright/test'

const isCi = process.env.CI !== undefined && process.env.CI !== ''
const shouldRecordVideo = process.env.PLAYWRIGHT_VIDEO === 'true'

export default defineConfig({
  testDir: './e2e',
  outputDir: shouldRecordVideo ? '.artifacts/playwright' : 'test-results',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  reporter: isCi ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3100',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: shouldRecordVideo ? 'on' : 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: 'bun run start -- -p 3100',
    reuseExistingServer: false,
    timeout: 120_000,
    url: 'http://localhost:3100/sign-in',
  },
})
