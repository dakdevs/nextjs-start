'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { authClient } from '~/auth/client'
import { Button } from '~/components/shadcn/button'
import { webMcpCapabilities } from '~/webmcp/capability-registry'
import { useWebMcpCapability } from '~/webmcp/use-webmcp-capability'

export function SignOutButton() {
  const router = useRouter()
  const button = useRef<HTMLButtonElement>(null)
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const prepareSignOut = useCallback(() => {
    button.current?.focus()
    return {
      status: 'The sign-out control is focused for the person to confirm.',
    }
  }, [])

  useWebMcpCapability({
    capability: webMcpCapabilities.prepareSignOut,
    execute: prepareSignOut,
  })

  const signOut = async () => {
    setIsPending(true)
    setMessage(null)
    try {
      const result = await authClient.signOut()
      if (result.error) {
        setMessage('Something went wrong. Please try again.')
        return
      }
      router.replace('/sign-in')
    } catch {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {message === null ? null : (
        <span
          className="text-ui text-destructive"
          role="status"
        >
          {message}
        </span>
      )}
      <Button
        ref={button}
        type="button"
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() => {
          void signOut()
        }}
      >
        {isPending ? 'Signing out…' : 'Sign out'}
      </Button>
    </div>
  )
}
