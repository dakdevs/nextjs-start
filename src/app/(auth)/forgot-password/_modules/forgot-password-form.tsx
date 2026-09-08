'use client'

import Link from 'next/link'
import { useState } from 'react'
import { z } from 'zod'

import { authClient } from '~/auth/client'
import { LinkButton } from '~/components/link-button'
import { Alert, AlertDescription } from '~/components/shadcn/alert'
import { ReportedSubmissionError } from '~/modules/forms/reported-submission-error'
import { useAppForm } from '~/modules/forms/use-app-form'
import { useClientReady } from './use-client-ready'

const emailSchema = z.string().trim().pipe(z.email('Enter a valid email address.'))

export function ForgotPasswordForm() {
  const isClientReady = useClientReady()

  const [completed, setCompleted] = useState(false)

  const [message, setMessage] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { email: '' },
    onSubmit: async ({ value }) => {
      setMessage(null)

      try {
        const result = await authClient.requestPasswordReset({
          email: value.email,
          redirectTo: '/reset-password',
        })

        if (result.error !== null) {
          setMessage('Something went wrong. Please try again.')

          throw new ReportedSubmissionError()
        }

        setCompleted(true)
      } catch (error) {
        if (error instanceof ReportedSubmissionError) {
          throw error
        }

        setMessage('Something went wrong. Please try again.')

        throw new ReportedSubmissionError()
      }
    },
  })

  if (completed) {
    return (
      <div className="space-y-6">
        <Alert className="border-0 bg-accent">
          <AlertDescription>Check your inbox for a reset link.</AlertDescription>
        </Alert>
        <LinkButton
          href="/sign-in"
          className="w-full"
          variant="secondary"
        >
          Back to sign in
        </LinkButton>
      </div>
    )
  }

  return (
    <form.AppForm>
      <form.Form
        className="space-y-6"
        data-client-ready={isClientReady}
      >
        <form.AppField
          name="email"
          validators={{
            onChange: emailSchema,
            onBlur: emailSchema,
            onSubmit: emailSchema,
          }}
        >
          {(field) => {
            return (
              <field.TextField
                label="Email"
                id="email"
                type="email"
                autoComplete="email"
                required
              />
            )
          }}
        </form.AppField>
        <form.Feedback message={message} />
        <form.SubmitButton
          className="w-full"
          size="lg"
          disabled={!isClientReady}
          pendingLabel="Sending link…"
        >
          Send reset link
        </form.SubmitButton>
        <p className="text-center text-ui text-muted-foreground">
          <Link
            href="/sign-in"
            className="underline underline-offset-4"
          >
            Back to sign in
          </Link>
        </p>
      </form.Form>
    </form.AppForm>
  )
}
