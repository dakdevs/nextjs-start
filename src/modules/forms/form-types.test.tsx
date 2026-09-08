import { expectTypeOf, it } from 'vitest'

import { useAppForm, withForm } from './use-app-form'

const defaultValues = { identity: { name: 'Ada' }, count: 2 }
const IdentitySection = withForm({
  defaultValues,
  render: function IdentitySection({ form }) {
    expectTypeOf(form.getFieldValue('identity.name')).toEqualTypeOf<string>()
    // @ts-expect-error A typed section cannot invent a field.

    form.getFieldValue('identity.missing')

    return (
      <form.AppField name="identity.name">
        {(field) => {
          return <field.TextField label="Name" />
        }}
      </form.AppField>
    )
  },
})

function TypeContract() {
  const form = useAppForm({
    defaultValues,
    onSubmit: ({ value }) => {
      expectTypeOf(value).toEqualTypeOf<typeof defaultValues>()
    },
  })

  form.setFieldValue('count', 3)
  // @ts-expect-error Field value types remain tied to their defaults.

  form.setFieldValue('count', 'three')

  const missing = (
    // @ts-expect-error AppField cannot accept an unknown path.
    <form.AppField name="missing">
      {() => {
        return null
      }}
    </form.AppField>
  )
  // @ts-expect-error Reset must preserve the complete typed value shape.

  form.reset({ identity: { name: 'Grace' } })

  const otherForm = useAppForm({ defaultValues: { unrelated: true } })
  // @ts-expect-error A section cannot receive an unrelated form shape.

  const mismatched = <IdentitySection form={otherForm} />

  return (
    <form.AppForm>
      <form.Form>
        <IdentitySection form={form} />
        {missing}
        {mismatched}
      </form.Form>
    </form.AppForm>
  )
}

it('retains the compiled composition contract', () => {
  expectTypeOf(TypeContract).toBeFunction()
})
