import { formOptions } from '@tanstack/react-form'
import { useState } from 'react'
import { z } from 'zod'

import { Button } from '~/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/shadcn/dialog'
import { FieldGroup } from '~/components/shadcn/field'
import { useAppForm, withForm } from '~/modules/forms/use-app-form'

const exampleDefaults = {
  name: 'Ada Lovelace',
  email: 'ada@example.test',
  cadence: 'weekly',
  notes: '',
}
const exampleSchema = z.object({
  name: z.string().min(1, 'Enter your name.'),
  email: z.email('Enter a valid email address.'),
  cadence: z.enum(['daily', 'weekly', 'monthly']),
  notes: z.string().max(200, 'Keep notes under 200 characters.'),
})
const exampleOptions = formOptions({
  defaultValues: exampleDefaults,
  validators: {
    onChange: exampleSchema,
    onBlur: exampleSchema,
    onSubmit: exampleSchema,
  },
})

const IdentityFields = withForm({
  ...exampleOptions,
  render: function IdentityFields({ form }) {
    return (
      <FieldGroup>
        <form.AppField name="name">
          {(field) => {
            return (
              <field.TextField
                label="Name"
                autoComplete="name"
                required
              />
            )
          }}
        </form.AppField>
        <form.AppField name="email">
          {(field) => {
            return (
              <field.TextField
                label="Email address"
                type="email"
                autoComplete="email"
                required
              />
            )
          }}
        </form.AppField>
      </FieldGroup>
    )
  },
})

export function ComposedFormExample({
  onSave,
}: {
  onSave: (value: typeof exampleDefaults) => Promise<void>
}) {
  const [message, setMessage] = useState<string | null>(null)

  const form = useAppForm({
    ...exampleOptions,
    onSubmit: async ({ value }) => {
      setMessage(null)

      await onSave(value)

      setMessage(`Saved for ${value.name}: ${value.cadence}.`)
    },
  })

  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Edit preferences</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notification preferences</DialogTitle>
          <DialogDescription>
            A test-only composed form with a select inside an overlay.
          </DialogDescription>
        </DialogHeader>
        <form.AppForm>
          <form.Form
            aria-label="Notification preferences"
            className="flex flex-col gap-5"
          >
            <IdentityFields form={form} />
            <form.AppField name="cadence">
              {(field) => {
                return (
                  <field.SelectField
                    label="Delivery cadence"
                    required
                    options={[
                      { label: 'Daily', value: 'daily' },
                      { label: 'Weekly', value: 'weekly' },
                      { label: 'Monthly', value: 'monthly' },
                    ]}
                  />
                )
              }}
            </form.AppField>
            <form.AppField name="notes">
              {(field) => {
                return (
                  <field.TextareaField
                    label="Notes"
                    description="Optional delivery notes."
                    rows={2}
                  />
                )
              }}
            </form.AppField>
            <form.Feedback message={message} />
            <div className="flex gap-3">
              <form.ResetButton />
              <form.SubmitButton pendingLabel="Saving preferences…">
                Save preferences
              </form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  )
}
