import { randomUUID } from 'node:crypto'

import postgres from 'postgres'

async function runChecked(command: string[], environment: NodeJS.ProcessEnv) {
  const child = Bun.spawn(command, {
    env: environment,
    stderr: 'inherit',
    stdout: 'inherit',
  })
  const exitCode = await child.exited

  if (exitCode !== 0) {
    throw new Error(`Command failed (${exitCode}): ${command.join(' ')}`)
  }
}

async function capture(command: string[]) {
  const child = Bun.spawn(command, { stderr: 'pipe', stdout: 'pipe' })
  const output = await new Response(child.stdout).text()
  const errorOutput = await new Response(child.stderr).text()
  const exitCode = await child.exited

  if (exitCode !== 0)
    throw new Error(errorOutput || `Command failed: ${command.join(' ')}`)
  return output.trim()
}

async function waitForPostgres(databaseUrl: string) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const sql = postgres(databaseUrl, { connect_timeout: 1, max: 1 })
    try {
      await sql`select 1`
      await sql.end()
      return
    } catch {
      await sql.end({ timeout: 0 })
      await Bun.sleep(500)
    }
  }

  throw new Error('Disposable PostgreSQL did not become ready within 30 seconds')
}

export async function withTestPostgres(
  task: (environment: NodeJS.ProcessEnv) => Promise<void>,
) {
  const containerName = `nextjs-start-test-${randomUUID()}`

  await runChecked(
    [
      'docker',
      'run',
      '--detach',
      '--rm',
      '--name',
      containerName,
      '--env',
      'POSTGRES_DB=nextjs_start_test',
      '--env',
      'POSTGRES_PASSWORD=postgres',
      '--env',
      'POSTGRES_USER=postgres',
      '--publish',
      '127.0.0.1::5432',
      'postgres:17-alpine',
    ],
    process.env,
  )

  try {
    const portOutput = await capture(['docker', 'port', containerName, '5432/tcp'])
    const port = /:(\d+)$/u.exec(portOutput)?.[1]
    if (port === undefined || port === '')
      throw new Error(`Could not resolve PostgreSQL port from: ${portOutput}`)

    const databaseUrl = `postgres://postgres:postgres@127.0.0.1:${port}/nextjs_start_test`
    await waitForPostgres(databaseUrl)

    const environment: NodeJS.ProcessEnv = {
      ...process.env,
      ALLOW_PREVIEW_PASSKEYS: 'true',
      BETTER_AUTH_SECRET: 'test-only-secret-that-is-longer-than-thirty-two-characters',
      BETTER_AUTH_URL: 'http://localhost:3100',
      DATABASE_URL: databaseUrl,
      EMAIL_DELIVERY: 'development',
      EMAIL_FROM: 'Next.js Start <test@example.test>',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3100',
      NODE_ENV: 'test',
      TEST_DATABASE_URL: databaseUrl,
      VERCEL_ENV: 'development',
    }

    await runChecked(['bunx', 'drizzle-kit', 'migrate'], environment)
    await task(environment)
  } finally {
    await runChecked(['docker', 'stop', containerName], process.env)
  }
}

export { runChecked }
