'use client'

import { KeyRoundIcon } from 'lucide-react'
import { useState } from 'react'

import { authClient } from '~/auth/client'
import { Alert, AlertDescription, AlertTitle } from '~/components/shadcn/alert'
import { Button } from '~/components/shadcn/button'

type PasskeyEnrollmentProps = {
  hasPasskey: boolean
  isOpen: boolean
  onAdded: () => void
  onDismiss: () => void
}

export function PasskeyEnrollment({
  hasPasskey,
  isOpen,
  onAdded,
  onDismiss,
}: PasskeyEnrollmentProps) {
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const addPasskey = async () => {
    setIsPending(true)
    setMessage(null)
    try {
      const result = await authClient.passkey.addPasskey({ name: 'Account passkey' })
      if (result.error) {
        setMessage(
          'The passkey was not added. You can try again whenever you are ready.',
        )
        return
      }
      onAdded()
      setMessage(
        'Passkey added. You can now choose it as an alternative sign-in method.',
      )
    } catch {
      setMessage('The passkey was not added. You can try again whenever you are ready.')
    } finally {
      setIsPending(false)
    }
  }

  const offer = (
    <section
      id="passkey-enrollment"
      className="rounded-2xl bg-accent p-6 sm:p-8"
      aria-labelledby="passkey-heading"
    >
      <Alert className="border-0 bg-transparent p-0">
        <KeyRoundIcon aria-hidden="true" />
        <AlertTitle id="passkey-heading">Add a passkey</AlertTitle>
        <AlertDescription>
          Use your device’s normal security prompt. This is optional and works instead
          of your password when you sign in.
        </AlertDescription>
      </Alert>
      {message === null ? null : (
        <p
          aria-live="polite"
          className="mt-4 text-sm text-muted-foreground"
        >
          {message}
        </p>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={() => {
            void addPasskey()
          }}
          disabled={isPending}
        >
          {isPending ? 'Waiting for device…' : 'Add passkey'}
        </Button>
        {hasPasskey ? null : (
          <Button
            type="button"
            variant="ghost"
            onClick={onDismiss}
          >
            Not now
          </Button>
        )}
      </div>
    </section>
  )

  if (isOpen) return offer
  if (hasPasskey) {
    return (
      <section className="rounded-2xl bg-muted p-6 sm:p-8">
        <p className="text-sm font-medium">Sign-in security</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          A passkey is available as an alternative sign-in method.
        </p>
      </section>
    )
  }
  return null
}
