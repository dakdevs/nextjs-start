'use client'

import { useState } from 'react'
import { z } from 'zod'

import { authClient } from '~/auth/client'
import { LinkButton } from '~/components/link-button'
import { Alert, AlertDescription } from '~/components/shadcn/alert'
import { ReportedSubmissionError } from '~/modules/forms/reported-submission-error'
import { useAppForm } from '~/modules/forms/use-app-form'

const passwordSchema = z.string().min(8, 'Use at least 8 characters.')

export function ResetPasswordForm({ token }: { readonly token: string }) {
  const [message, setMessage] = useState<string | null>(null)

  const [isComplete, setIsComplete] = useState(false)

  const form = useAppForm({
    defaultValues: { password: '' },
    onSubmit: async ({ value }) => {
      setMessage(null)

      try {
        const result = await authClient.resetPassword({
          newPassword: value.password,
          token,
        })

        if (result.error !== null) {
          setMessage('Something went wrong. Please request another link.')

          throw new ReportedSubmissionError()
        }

        window.history.replaceState(window.history.state, '', '/reset-password')

        setIsComplete(true)
      } catch (error) {
        if (error instanceof ReportedSubmissionError) {
          throw error
        }

        setMessage('Something went wrong. Please request another link.')

        throw new ReportedSubmissionError()
      }
    },
  })

  if (isComplete) {
    return (
      <div className="space-y-6">
        <Alert className="border-0 bg-accent">
          <AlertDescription>Your password has been reset.</AlertDescription>
        </Alert>
        <LinkButton
          href="/sign-in"
          className="w-full"
          size="lg"
        >
          Sign in
        </LinkButton>
      </div>
    )
  }

  return (
    <form.AppForm>
      <form.Form className="space-y-6">
        <form.AppField
          name="password"
          validators={{
            onChange: passwordSchema,
            onBlur: passwordSchema,
            onSubmit: passwordSchema,
          }}
        >
          {(field) => {
            return (
              <field.TextField
                label="New password"
                id="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            )
          }}
        </form.AppField>
        <form.Feedback message={message} />
        <form.SubmitButton
          className="w-full"
          size="lg"
          pendingLabel="Saving password…"
        >
          Save new password
        </form.SubmitButton>
      </form.Form>
    </form.AppForm>
  )
}
