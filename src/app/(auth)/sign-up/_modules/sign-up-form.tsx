'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { authClient } from '~/auth/client'
import { getFormText } from '~/components/form-data'
import { Alert, AlertDescription } from '~/components/shadcn/alert'
import { Button } from '~/components/shadcn/button'
import { Field, FieldGroup, FieldLabel } from '~/components/shadcn/field'
import { Input } from '~/components/shadcn/input'

export function SignUpForm() {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const signUp = async (formData: FormData) => {
    setIsPending(true)
    setMessage(null)
    const email = getFormText(formData, 'email')
    try {
      const result = await authClient.signUp.email({
        name: getFormText(formData, 'name'),
        email,
        password: getFormText(formData, 'password'),
        callbackURL: '/sign-in',
      })
      if (result.error) {
        setMessage('Something went wrong. Please try again.')
        return
      }
      router.replace(`/verify-email?email=${encodeURIComponent(email)}`)
    } catch {
      setMessage('Something went wrong. Please try again.')
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
        void signUp(new FormData(event.currentTarget))
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Display name</FieldLabel>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            maxLength={100}
          />
        </Field>
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
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>
      </FieldGroup>
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
        {isPending ? 'Creating account…' : 'Create account'}
      </Button>
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
    </form>
  )
}
