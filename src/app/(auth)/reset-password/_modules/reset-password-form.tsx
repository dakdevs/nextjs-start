'use client'

import Link from 'next/link'
import { useState } from 'react'

import { authClient } from '~/auth/client'
import { getFormText } from '~/components/form-data'
import { Alert, AlertDescription } from '~/components/shadcn/alert'
import { Button } from '~/components/shadcn/button'
import { Field, FieldLabel } from '~/components/shadcn/field'
import { Input } from '~/components/shadcn/input'

export function ResetPasswordForm({ token }: { readonly token: string }) {
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const resetPassword = async (formData: FormData) => {
    setIsPending(true)
    setMessage(null)
    try {
      const result = await authClient.resetPassword({
        newPassword: getFormText(formData, 'password'),
        token,
      })
      if (result.error) {
        setMessage('Something went wrong. Please request another link.')
        return
      }
      window.history.replaceState(window.history.state, '', '/reset-password')
      setIsComplete(true)
    } catch {
      setMessage('Something went wrong. Please request another link.')
    } finally {
      setIsPending(false)
    }
  }

  if (isComplete) {
    return (
      <div className="space-y-6">
        <Alert className="border-0 bg-accent">
          <AlertDescription>Your password has been reset.</AlertDescription>
        </Alert>
        <Button
          render={<Link href="/sign-in" />}
          className="w-full"
          size="lg"
        >
          Sign in
        </Button>
      </div>
    )
  }

  return (
    <form
      className="space-y-6"
      method="post"
      onSubmit={(event) => {
        event.preventDefault()
        void resetPassword(new FormData(event.currentTarget))
      }}
    >
      <Field>
        <FieldLabel htmlFor="password">New password</FieldLabel>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
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
        disabled={isPending}
      >
        {isPending ? 'Saving password…' : 'Save new password'}
      </Button>
    </form>
  )
}
