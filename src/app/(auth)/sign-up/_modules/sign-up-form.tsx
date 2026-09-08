'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'

import { authClient } from '~/auth/client'
import { ReportedSubmissionError } from '~/modules/forms/reported-submission-error'
import { useAppForm } from '~/modules/forms/use-app-form'

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Enter a display name.')
  .max(100, 'Use 100 characters or fewer.')
const emailSchema = z.string().trim().pipe(z.email('Enter a valid email address.'))
const passwordSchema = z.string().min(8, 'Use at least 8 characters.')

export function SignUpForm() {
  const router = useRouter()

  const [message, setMessage] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setMessage(null)

      try {
        const result = await authClient.signUp.email({
          name: value.name,
          email: value.email,
          password: value.password,
          callbackURL: '/sign-in',
        })

        if (result.error !== null) {
          setMessage('Something went wrong. Please try again.')

          throw new ReportedSubmissionError()
        }

        router.replace(`/verify-email?email=${encodeURIComponent(value.email)}`)
      } catch (error) {
        if (error instanceof ReportedSubmissionError) {
          throw error
        }

        setMessage('Something went wrong. Please try again.')

        throw new ReportedSubmissionError()
      }
    },
  })

  return (
    <form.AppForm>
      <form.Form className="space-y-6">
        <div className="grid gap-6">
          <form.AppField
            name="name"
            validators={{
              onChange: nameSchema,
              onBlur: nameSchema,
              onSubmit: nameSchema,
            }}
          >
            {(field) => {
              return (
                <field.TextField
                  label="Display name"
                  id="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                />
              )
            }}
          </form.AppField>
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
                  label="Password"
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              )
            }}
          </form.AppField>
        </div>
        <form.Feedback message={message} />
        <form.SubmitButton
          className="w-full"
          size="lg"
          pendingLabel="Creating account…"
        >
          Create account
        </form.SubmitButton>
        <p className="text-center text-ui text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/sign-in"
            className="text-foreground underline underline-offset-4"
          >
            Sign in
          </Link>
          .
        </p>
      </form.Form>
    </form.AppForm>
  )
}
