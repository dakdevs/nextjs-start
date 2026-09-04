import { runChecked, withTestPostgres } from './with-postgres'

const mode = process.argv[2]

await withTestPostgres(async (environment) => {
  if (mode === 'integration') {
    await runChecked(
      ['bunx', 'vitest', 'run', '--config', 'vitest.integration.config.ts'],
      environment,
    )
    return
  }

  if (mode === 'workflow') {
    await runChecked(
      ['bunx', 'vitest', 'run', '--config', 'vitest.workflow.config.ts'],
      environment,
    )
    return
  }

  if (mode === 'e2e') {
    const productionEnvironment = {
      ...environment,
      NODE_ENV: 'production',
    } satisfies NodeJS.ProcessEnv
    await runChecked(['bun', 'run', 'build'], productionEnvironment)
    await runChecked(['bunx', 'playwright', 'test'], productionEnvironment)
    return
  }

  throw new Error(`Unknown test mode: ${mode ?? '(missing)'}`)
})
