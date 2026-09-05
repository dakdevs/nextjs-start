'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { authClient } from '~/auth/client'
import { getFormText } from '~/components/form-data'
import { Alert, AlertDescription } from '~/components/shadcn/alert'
import { Button } from '~/components/shadcn/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '~/components/shadcn/field'
import { Input } from '~/components/shadcn/input'

function emailSignInFailureMessage(status: number) {
  return status === 429
    ? 'Too many sign-in attempts. Wait a moment and try again.'
    : 'Email or password is incorrect.'
}

export function SignInForm({ passkeysEnabled }: { readonly passkeysEnabled: boolean }) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const signIn = async (formData: FormData) => {
    setIsPending(true)
    setMessage(null)
    try {
      const result = await authClient.signIn.email({
        email: getFormText(formData, 'email'),
        password: getFormText(formData, 'password'),
        callbackURL: '/account',
      })
      if (result.error) {
        setMessage(emailSignInFailureMessage(result.error.status))
        return
      }
      router.replace('/account')
    } catch {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setIsPending(false)
    }
  }

  const signInWithPasskey = async () => {
    setIsPending(true)
    setMessage(null)
    try {
      const result = await authClient.signIn.passkey()
      if (result.error) {
        setMessage('The passkey sign-in did not complete.')
        return
      }
      router.replace('/account')
    } catch {
      setMessage('The passkey sign-in did not complete.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form
      className="space-y-6"
      method="post"
      onSubmit={(event) => {
        event.preventDefault()
        void signIn(new FormData(event.currentTarget))
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </Field>
        <Field>
          <div className="flex items-baseline justify-between gap-3">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              className="text-ui text-muted-foreground underline underline-offset-4 hover:text-foreground"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>
      </FieldGroup>
      {message === null ? null : (
        <Alert className="border-0 bg-transparent p-0 text-destructive">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <Button
        className="w-full"
        type="submit"
        size="lg"
        disabled={isPending}
      >
        {isPending ? 'Signing in…' : 'Sign in'}
      </Button>
      {passkeysEnabled ? (
        <div className="space-y-4 pt-1">
          <div>
            <p className="text-ui font-medium">Use a passkey instead</p>
            <FieldDescription>
              A passkey is an alternative sign-in method, not a second step.
            </FieldDescription>
          </div>
          <Button
            className="w-full"
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={() => {
              void signInWithPasskey()
            }}
          >
            Use passkey
          </Button>
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
    </form>
  )
}
