'use client'

import { useEffect } from 'react'

type WebMcpDevelopmentRuntimeProps = { enabled: boolean; onReady: () => void }

/** Installs the local WebMCP runtime only outside production. */
export function WebMcpDevelopmentRuntime({
  enabled,
  onReady,
}: WebMcpDevelopmentRuntimeProps) {
  useEffect(() => {
    if (enabled) {
      void import('@mcp-b/webmcp-polyfill').then(({ initializeWebMCPPolyfill }) => {
        initializeWebMCPPolyfill({ installTestingShim: true })
        onReady()
      })
    }
  }, [enabled, onReady])

  return null
}
