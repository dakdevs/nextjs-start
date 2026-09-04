import { defineConfig } from '@dakdevs/oxlint-plugin/config'

const config = defineConfig({
  ignorePatterns: [
    '.next/**',
    '.workflow-vitest/**',
    'coverage/**',
    'drizzle/**',
    'env.d.ts',
    'node_modules/**',
    'playwright-report/**',
    'test-results/**',
  ],
})

function promoteWarnings(rules: typeof config.rules) {
  if (rules === undefined) return

  for (const [name, setting] of Object.entries(rules)) {
    if (Array.isArray(setting)) {
      if (setting[0] === 'warn' || setting[0] === 1) setting[0] = 'error'
      continue
    }

    if (setting === 'warn' || setting === 1) rules[name] = 'error'
  }
}

const effectRulesOff = Object.fromEntries(
  Object.keys(config.rules ?? {})
    .filter((name) => name.startsWith('effecttsgo/'))
    .map((name) => [name, 'off'] as const),
)

config.overrides = [
  ...(config.overrides ?? []),
  {
    files: [
      '*.config.ts',
      'e2e/**',
      'src/app/**',
      'src/auth/**',
      'src/components/**',
      'src/config/**',
      'src/db/**',
      'src/modules/**',
      'src/orpc/**',
      'src/webmcp/**',
      'src/workflows/**',
      'tooling/**',
      '**/*.test.{ts,tsx}',
    ],
    rules: effectRulesOff,
  },
  {
    // Platform adapters perform host I/O underneath Effect service boundaries.
    files: [
      'src/email/development-mailbox.ts',
      'src/observability/use-client-boundary-error.ts',
    ],
    rules: effectRulesOff,
  },
  {
    files: ['src/components/shadcn/**'],
    rules: {
      'import/no-namespace': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'react/no-array-index-key': 'off',
      'typescript/strict-boolean-expressions': 'off',
      eqeqeq: 'off',
    },
  },
  {
    // Workflow and step entry points must be async for the workflow compiler,
    // even when their first structural implementation has no awaited I/O.
    files: ['src/workflows/**'],
    rules: {
      'typescript/require-await': 'off',
      'require-await': 'off',
    },
  },
]

promoteWarnings(config.rules)
for (const override of config.overrides ?? []) promoteWarnings(override.rules)

export default config
