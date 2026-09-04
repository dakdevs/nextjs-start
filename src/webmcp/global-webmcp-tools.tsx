'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { webMcpCapabilities } from '~/webmcp/capability-registry'
import { useWebMcpCapability } from '~/webmcp/use-webmcp-capability'

/** Global tools intentionally cover navigation only; feature tools remain route-scoped. */
export function GlobalWebMcpTools() {
  const router = useRouter()
  const openAccount = useCallback(() => {
    router.push('/account')
    return Promise.resolve({ opened: '/account' })
  }, [router])

  useWebMcpCapability({
    capability: webMcpCapabilities.navigateAccount,
    execute: openAccount,
  })
  return null
}
