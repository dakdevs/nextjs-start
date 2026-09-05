import { runChecked } from './test/with-postgres'

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
] as const

for (const command of checks) {
  await runChecked([...command], process.env)
}
