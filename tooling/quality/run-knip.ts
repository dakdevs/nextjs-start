const environment = {
  ...process.env,
  ALLOW_PREVIEW_PASSKEYS: 'false',
  BETTER_AUTH_SECRET: 'knip-only-secret-that-is-longer-than-thirty-two-characters',
  BETTER_AUTH_URL: 'http://localhost:3000',
  DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/knip',
  EMAIL_DELIVERY: 'development',
  EMAIL_FROM: 'Next.js Start <knip@example.test>',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NODE_ENV: 'test',
  RESEND_API_KEY: '',
} satisfies NodeJS.ProcessEnv

Reflect.deleteProperty(environment, 'VERCEL_ENV')

const child = Bun.spawn(['bunx', 'knip'], {
  env: environment,
  stderr: 'inherit',
  stdout: 'inherit',
})

const exitCode = await child.exited
if (exitCode !== 0) throw new Error(`Knip failed (${exitCode})`)
