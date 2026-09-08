import { describe, expect, it } from 'vitest'

import { findFormBoundaryFailures } from './form-boundaries'

const packageJson = { dependencies: { '@tanstack/react-form': '1.33.5' } }

function messages(source: string, file = 'src/app/example.tsx') {
  return findFormBoundaryFailures([{ file, source }], packageJson).map((failure) => {
    return failure.message
  })
}

describe('form architecture boundaries', () => {
  it.each([
    "import { useForm } from '@tanstack/react-form'",
    "import { useForm } from '@tanstack/react-form/dist/esm/useForm'",
    "import { useForm as makeForm } from '@tanstack/react-form'",
    "import { createFormHook } from '@tanstack/react-form'",
    "import { createFormHookContexts } from '@tanstack/react-form'",
    "export { createFormHook } from '@tanstack/react-form'",
    "export * from '@tanstack/react-form'",
    "import * as form from '@tanstack/react-form'",
    "import type * as form from '@tanstack/form-core'",
    "import { FormApi } from '@tanstack/form-core'",
    "import { FormApi } from '@tanstack/form-core/dist/esm/FormApi'",
    "const form = import('@tanstack/react-form')",
    "const form = require('@tanstack/form-core')",
  ])('rejects a form-layer bypass: %s', (source) => {
    expect(messages(source)).not.toHaveLength(0)
  })

  it('allows only the approved low-level infrastructure imports', () => {
    expect(
      messages(
        "import { createFormHookContexts } from '@tanstack/react-form'",
        'src/modules/forms/contexts.ts',
      ),
    ).toEqual([])

    expect(
      messages(
        "import { createFormHook } from '@tanstack/react-form'",
        'src/modules/forms/use-app-form.ts',
      ),
    ).toEqual([])
  })

  it.each([
    "import { formOptions, useStore } from '@tanstack/react-form'",
    "import type { FormOptions } from '@tanstack/form-core'",
  ])('allows a legitimate low-level helper: %s', (source) => {
    expect(messages(source)).toEqual([])
  })

  it.each([
    "import { useForm } from 'react-hook-form'",
    "import { useForm } from 'react-hook-form/dist/index'",
    "export { Form } from 'formik'",
    "const form = import('@hookform/resolvers')",
  ])('rejects a competing form-library import: %s', (source) => {
    expect(messages(source)).not.toHaveLength(0)
  })

  it.each([
    '<input name="query" />',
    '<textarea name="bio" />',
    '<select name="role" />',
    '<form method="post" />',
    "import { Input } from '~/components/shadcn/input'",
    "import { Input as SearchBox } from '~/components/shadcn/input'; <SearchBox />",
    "import { Input as SearchBox } from '../components/shadcn/input'; <SearchBox />",
    "import { Select as Picker } from '@chakra-ui/react'; <Picker />",
    "import * as Chakra from '@chakra-ui/react'; <Chakra.Input />",
  ])('rejects a direct application control: %s', (source) => {
    expect(messages(source)).not.toHaveLength(0)
  })

  it.each([
    '<FieldGroup />',
    "import { FieldGroup } from '~/components/shadcn/field'; <FieldGroup />",
    "import { Button } from '@chakra-ui/react'; <Button />",
  ])('allows layout and non-control primitives: %s', (source) => {
    expect(messages(source)).toEqual([])
  })

  it('allows registered controls inside the shared form layer', () => {
    expect(
      messages(
        "import { Input } from '~/components/shadcn/input'; <Input />",
        'src/modules/forms/text-field.tsx',
      ),
    ).toEqual([])
  })

  it('does not exempt unrelated modules placed beside the shared infrastructure', () => {
    expect(
      messages('<input name="escape-hatch" />', 'src/modules/forms/other.tsx'),
    ).not.toHaveLength(0)
  })

  it.each(['react-hook-form', 'formik', 'react-final-form', '@hookform/resolvers'])(
    'rejects competing dependency %s',
    (dependency) => {
      const failures = findFormBoundaryFailures([], {
        dependencies: { [dependency]: '1.0.0' },
      })

      expect(failures).toHaveLength(1)

      expect(failures[0]?.file).toBe('package.json')

      expect(failures[0]?.message).toContain(dependency)
    },
  )

  it('rejects a dependency alias targeting a competing form library', () => {
    const failures = findFormBoundaryFailures([], {
      dependencies: { appForms: 'npm:react-hook-form@7.54.2' },
    })

    expect(failures).toHaveLength(1)

    expect(failures[0]?.file).toBe('package.json')

    expect(failures[0]?.message).toContain('appForms')
  })

  it('rejects a scoped dependency alias targeting a competing form library', () => {
    const failures = findFormBoundaryFailures([], {
      dependencies: { resolver: 'npm:@hookform/resolvers@4.1.0' },
    })

    expect(failures).toHaveLength(1)

    expect(failures[0]?.file).toBe('package.json')

    expect(failures[0]?.message).toContain('resolver')
  })

  it('does not reject unrelated packages that happen to contain form', () => {
    const failures = findFormBoundaryFailures([], {
      dependencies: { '@acme/formatted-date': '1.0.0' },
    })

    expect(failures).toEqual([])
  })
})
