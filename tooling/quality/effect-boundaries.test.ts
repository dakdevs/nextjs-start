import { expect, test } from 'vitest'

import config, { effectBoundaryOverrides } from '../../oxlint.config'

const permittedBoundaryRules = new Set([
  'effecttsgo/async-function',
  'effecttsgo/missing-pipeable-signature',
  'effecttsgo/process-env',
  'effecttsgo/node-builtin-import',
  'effecttsgo/crypto-random-uuid',
  'effecttsgo/global-date',
  'effecttsgo/new-promise',
  'effecttsgo/extends-native-error',
  'effecttsgo/global-console',
  'effecttsgo/global-fetch',
  'require-await',
  'typescript/require-await',
])
const boundaryRules = effectBoundaryOverrides.flatMap((override) => {
  return Object.entries(override.rules).map(([rule, severity]) => {
    return { rule, severity }
  })
})
const boundaryFiles = effectBoundaryOverrides.flatMap((override) => {
  return override.files
})
const broadPatterns = boundaryFiles.filter((file) => {
  return /[?*[\]{}!]/u.test(file) && file !== 'src/app/rpc/**/route.ts'
})
const exemptProductionServices = boundaryFiles.filter((file) => {
  return (
    /^src\/(domains|queues|effect|email)\//u.test(file) &&
    !/\.(integration\.|workflow\.)?test\.tsx?$/u.test(file) &&
    file !== 'src/email/development-mailbox.ts'
  )
})

test.each(boundaryRules)(
  'only an approved host rule may be exempt: $rule',
  ({ rule, severity }) => {
    expect(permittedBoundaryRules.has(rule)).toBe(true)

    expect(severity).toBe('off')
  },
)

test('exceptions cannot expand to broad application globs or production Effect services', () => {
  expect(broadPatterns).toEqual([])

  expect(exemptProductionServices).toEqual([])
})

test('Effect correctness remains blocking alongside the host exceptions', () => {
  expect(config.rules?.['effecttsgo/floating-effect']).toBe('error')

  expect(config.rules?.['effecttsgo/any-unknown-in-error-context']).toBe('error')
})
