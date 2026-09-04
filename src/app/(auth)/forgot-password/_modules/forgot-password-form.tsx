'use client'

import Link from 'next/link'
import { useState } from 'react'

import { authClient } from '~/auth/client'
import { getFormText } from '~/components/form-data'
import { Alert, AlertDescription } from '~/components/shadcn/alert'
import { Button } from '~/components/shadcn/button'
import { Field, FieldLabel } from '~/components/shadcn/field'
import { Input } from '~/components/shadcn/input'
import { useClientReady } from './use-client-ready'

export function ForgotPasswordForm() {
  const isClientReady = useClientReady()
  const [completed, setCompleted] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const requestReset = async (formData: FormData) => {
    setIsPending(true)
    setMessage(null)
    try {
      const result = await authClient.requestPasswordReset({
        email: getFormText(formData, 'email'),
        redirectTo: '/reset-password',
      })
      if (result.error) {
        setMessage('Something went wrong. Please try again.')
        return
      }
      setCompleted(true)
    } catch {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setIsPending(false)
    }
  }

  if (completed) {
    return (
      <div className="space-y-6">
        <Alert className="border-0 bg-accent">
          <AlertDescription>Check your inbox for a reset link.</AlertDescription>
        </Alert>
        <Button
          render={<Link href="/sign-in" />}
          className="w-full"
          variant="secondary"
        >
          Back to sign in
        </Button>
      </div>
    )
  }

  return (
    <form
      className="space-y-6"
      data-client-ready={isClientReady}
      method="post"
      onSubmit={(event) => {
        event.preventDefault()
        void requestReset(new FormData(event.currentTarget))
      }}
    >
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
      {message === null ? null : (
        <Alert className="border-0 bg-muted">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <Button
        className="w-full"
        type="submit"
        size="lg"
        disabled={!isClientReady || isPending}
      >
        {isPending ? 'Sending link…' : 'Send reset link'}
      </Button>
      <p className="text-center text-ui text-muted-foreground">
        <Link
          href="/sign-in"
          className="underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  )
}
