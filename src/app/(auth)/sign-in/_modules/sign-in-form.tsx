'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'

import { authClient } from '~/auth/client'
import { Button } from '~/components/shadcn/button'
import { FieldDescription } from '~/components/shadcn/field'
import { ReportedSubmissionError } from '~/modules/forms/reported-submission-error'
import { useAppForm } from '~/modules/forms/use-app-form'

function emailSignInFailureMessage(status: number) {
  return status === 429
    ? 'Too many sign-in attempts. Wait a moment and try again.'
    : 'Email or password is incorrect.'
}

const emailSchema = z.string().trim().pipe(z.email('Enter a valid email address.'))
const passwordSchema = z.string().min(1, 'Enter your password.')

function PasskeySignInButton({
  onFailure,
  onStart,
  onSuccess,
}: {
  readonly onFailure: (message: string) => void
  readonly onStart: () => void
  readonly onSuccess: () => void
}) {
  const [isPending, setIsPending] = useState(false)

  const signInWithPasskey = async () => {
    setIsPending(true)

    onStart()

    try {
      const result = await authClient.signIn.passkey()

      if (result.error !== null) {
        onFailure('The passkey sign-in did not complete.')

        return
      }

      onSuccess()
    } catch {
      onFailure('The passkey sign-in did not complete.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      className="w-full"
      type="button"
      variant="ghost"
      disabled={isPending}
      onClick={() => {
        void signInWithPasskey()
      }}
    >
      {isPending ? 'Signing in…' : 'Use passkey'}
    </Button>
  )
}

export function SignInForm({ passkeysEnabled }: { readonly passkeysEnabled: boolean }) {
  const router = useRouter()

  const [message, setMessage] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      setMessage(null)

      try {
        const result = await authClient.signIn.email({
          email: value.email,
          password: value.password,
          callbackURL: '/account',
        })

        if (result.error !== null) {
          setMessage(emailSignInFailureMessage(result.error.status))

          throw new ReportedSubmissionError()
        }

        router.replace('/account')
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
                  labelAction={
                    <Link
                      className="text-ui text-muted-foreground underline underline-offset-4 hover:text-foreground"
                      href="/forgot-password"
                    >
                      Forgot password?
                    </Link>
                  }
                  id="password"
                  type="password"
                  autoComplete="current-password"
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
          pendingLabel="Signing in…"
        >
          Sign in
        </form.SubmitButton>
      </form.Form>
      {passkeysEnabled ? (
        <div className="space-y-4 pt-1">
          <div>
            <p className="text-ui font-medium">Use a passkey instead</p>
            <FieldDescription>
              A passkey is an alternative sign-in method, not a second step.
            </FieldDescription>
          </div>
          <PasskeySignInButton
            onFailure={(failureMessage) => {
              setMessage(failureMessage)
            }}
            onStart={() => {
              setMessage(null)
            }}
            onSuccess={() => {
              router.replace('/account')
            }}
          />
        </div>
      ) : null}
      <p className="text-center text-ui text-muted-foreground">
        New here?{' '}
        <Link
          href="/sign-up"
          className="text-foreground underline underline-offset-4"
        >
          Create an account
        </Link>
        .
      </p>
    </form.AppForm>
  )
}
