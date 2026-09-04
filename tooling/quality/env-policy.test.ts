import { spawn } from 'node:child_process'

import { describe, expect, test } from 'vitest'

const localEnvironment: NodeJS.ProcessEnv = {
  ...process.env,
  ALLOW_PREVIEW_PASSKEYS: 'false',
  BETTER_AUTH_SECRET: 'z9eK4mQ7vR2xL8pN5cT1yH6wD3fB0jS4uA7gC9kM2qP5rV8',
  BETTER_AUTH_URL: 'http://localhost:3000',
  DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/nextjs_start_test',
  EMAIL_DELIVERY: 'development',
  EMAIL_FROM: 'Next.js Start <test@example.test>',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NODE_ENV: 'development',
  RESEND_API_KEY: '',
  VERCEL_ENV: 'development',
}

const productionEnvironment: NodeJS.ProcessEnv = {
  ...localEnvironment,
  BETTER_AUTH_URL: 'https://example.com',
  DATABASE_URL:
    'postgres://application:secret@pool.example.com:5432/application?sslmode=require',
  EMAIL_DELIVERY: 'resend',
  NEXT_PUBLIC_APP_URL: 'https://example.com',
  NODE_ENV: 'production',
  RESEND_API_KEY: 're_test_key',
  VERCEL_ENV: 'production',
}

function acceptsEnvironment(environment: NodeJS.ProcessEnv) {
  return new Promise<boolean>((resolve, reject) => {
    const child = spawn('bun', ['-e', "await import('./src/config/env.ts')"], {
      cwd: process.cwd(),
      env: environment,
      stdio: 'ignore',
    })
    child.once('error', reject)
    child.once('exit', (exitCode) => {
      resolve(exitCode === 0)
    })
  })
}

describe('environment policy', () => {
  test('rejects checked-in Better Auth secret placeholders while accepting a generated secret', async () => {
    await expect(
      acceptsEnvironment({
        ...localEnvironment,
        BETTER_AUTH_SECRET: 'replace-with-at-least-32-random-characters',
      }),
    ).resolves.toBe(false)
    await expect(acceptsEnvironment(localEnvironment)).resolves.toBe(true)
  })

  test('accepts the local development mailbox only outside deployments', async () => {
    await expect(acceptsEnvironment(localEnvironment)).resolves.toBe(true)
    await expect(
      acceptsEnvironment({
        ...productionEnvironment,
        EMAIL_DELIVERY: 'development',
      }),
    ).resolves.toBe(false)
    await expect(
      acceptsEnvironment({
        ...productionEnvironment,
        EMAIL_DELIVERY: 'development',
        VERCEL_ENV: 'preview',
      }),
    ).resolves.toBe(false)
  })

  test('requires a Resend key whenever Resend is selected', async () => {
    await expect(
      acceptsEnvironment({
        ...productionEnvironment,
        RESEND_API_KEY: '',
      }),
    ).resolves.toBe(false)
    await expect(acceptsEnvironment(productionEnvironment)).resolves.toBe(true)
  })

  test('requires one canonical origin for the app and Better Auth', async () => {
    await expect(
      acceptsEnvironment({
        ...localEnvironment,
        BETTER_AUTH_URL: 'http://localhost:3001',
      }),
    ).resolves.toBe(false)
    await expect(
      acceptsEnvironment({
        ...localEnvironment,
        BETTER_AUTH_URL: 'http://localhost:3000/',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000/',
      }),
    ).resolves.toBe(false)
  })

  test('requires HTTPS and an explicitly TLS-protected Postgres URL when deployed', async () => {
    await expect(
      acceptsEnvironment({
        ...productionEnvironment,
        BETTER_AUTH_URL: 'http://example.com',
        NEXT_PUBLIC_APP_URL: 'http://example.com',
      }),
    ).resolves.toBe(false)
    await expect(
      acceptsEnvironment({
        ...productionEnvironment,
        DATABASE_URL: 'postgres://application:secret@pool.example.com/application',
      }),
    ).resolves.toBe(false)
    await expect(
      acceptsEnvironment({
        ...productionEnvironment,
        DATABASE_URL: 'https://pool.example.com/application?ssl=true',
      }),
    ).resolves.toBe(false)
  })
})
