import { runChecked, withTestPostgres } from './test/with-postgres'

const checks = [
  ['bun', 'run', 'env:check'],
  ['bun', 'run', 'format:check'],
  ['bun', 'run', 'lint'],
  ['bun', 'run', 'lint:config'],
  ['bun', 'run', 'typecheck'],
  ['bun', 'run', 'knip'],
  ['bun', 'run', 'docs:check'],
  ['bun', 'run', 'architecture:check'],
  ['bun', 'run', 'test'],
  ['bunx', 'vitest', 'run', '--config', 'vitest.workflow.config.ts'],
  ['bunx', 'vitest', 'run', '--config', 'vitest.integration.config.ts'],
]

await withTestPostgres(async (environment) => {
  for (const command of checks) {
    await runChecked(command, environment)
  }

  const productionEnvironment = {
    ...environment,
    NODE_ENV: 'production',
  } satisfies NodeJS.ProcessEnv

  await runChecked(['bun', 'run', 'build'], productionEnvironment)
  await runChecked(['bunx', 'playwright', 'test'], productionEnvironment)
})
