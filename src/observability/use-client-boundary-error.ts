'use client'

import { useEffect, useMemo } from 'react'

/** Gives browser-only failures the same reportable identifier as server failures. */
export const useClientBoundaryError = (error: Error & { digest?: string }) => {
  const errorId = useMemo(() => error.digest ?? crypto.randomUUID(), [error])

  useEffect(() => {
    // Deliberately omit the message and stack: client errors can contain user data.
    console.error(
      JSON.stringify({
        causeName: error.name,
        errorId,
        event: 'error.client-boundary',
      }),
    )
  }, [error.name, errorId])

  return errorId
}
