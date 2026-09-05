'use client'

import { useState } from 'react'

import { authClient } from '~/auth/client'
import { LinkButton } from '~/components/link-button'
import { Alert, AlertDescription } from '~/components/shadcn/alert'
import { Button } from '~/components/shadcn/button'

export function VerifyEmailPanel({ email }: { readonly email: string | undefined }) {
  const [status, setStatus] = useState<'idle' | 'sent'>('idle')
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const resend = async () => {
    if (email === undefined) return
    setIsPending(true)
    setMessage(null)
    try {
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: '/sign-in',
      })
      if (result.error) {
        setMessage('Something went wrong. Please try again.')
        return
      }
      setStatus('sent')
    } catch {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-6">
      <Alert className="border-0 bg-accent">
        <AlertDescription>
          Use the verification link in your email, then return to sign in.
        </AlertDescription>
      </Alert>
      {email === undefined ? null : (
        <p className="text-ui text-muted-foreground">
          We sent it to <span className="font-medium text-foreground">{email}</span>.
        </p>
      )}
      {message === null ? null : (
        <Alert className="border-0 bg-muted">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-3">
        {email === undefined ? null : (
          <Button
            className="w-full"
            variant="secondary"
            type="button"
            disabled={isPending || status === 'sent'}
            onClick={() => {
              void resend()
            }}
          >
            {status === 'sent'
              ? 'Verification email sent'
              : isPending
                ? 'Sending…'
                : 'Resend verification email'}
          </Button>
        )}
        <LinkButton
          href="/sign-in"
          className="w-full"
          size="lg"
        >
          Continue to sign in
        </LinkButton>
      </div>
    </div>
  )
}
