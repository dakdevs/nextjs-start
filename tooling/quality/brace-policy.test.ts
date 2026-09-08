import { expect, test } from 'vitest'

import config from '../../oxlint.config'

function configuredSettings(names: string[]) {
  return [config, ...(config.overrides ?? [])]
    .flatMap((fragment) => {
      return names.map((name) => {
        return fragment.rules?.[name]
      })
    })
    .filter((setting) => {
      return setting !== undefined
    })
    .map((setting) => {
      return { setting }
    })
}

test('requires braces for arrow functions and control flow throughout the repository', () => {
  expect(config.rules?.['arrow-body-style']).toEqual(['error', 'always'])

  expect(config.rules?.curly).toEqual(['error', 'all'])
})

test.each(configuredSettings(['arrow-body-style', 'eslint/arrow-body-style']))(
  'every configured arrow rule requires a brace body',
  ({ setting }) => {
    expect(setting).toEqual(['error', 'always'])
  },
)

test.each(configuredSettings(['curly', 'eslint/curly']))(
  'every configured control-flow rule requires braces',
  ({ setting }) => {
    expect(setting).toEqual(['error', 'all'])
  },
)

test('the opposite Effect arrow-body advice stays disabled', () => {
  expect(config.rules?.['effecttsgo/unnecessary-arrow-block']).toBe('off')
})

test.each(configuredSettings(['effecttsgo/unnecessary-arrow-block']))(
  'no override re-enables the opposite arrow-body advice',
  ({ setting }) => {
    expect(setting).toBe('off')
  },
)
