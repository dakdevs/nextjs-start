'use client'

import { useCallback } from 'react'

import { rpcClient } from '~/orpc/client'
import { webMcpCapabilities } from '~/webmcp/capability-registry'
import { useWebMcpCapability } from '~/webmcp/use-webmcp-capability'

/** Browser-only read capability for the purpose-built admin workflow home. */
export function AdminHomeWebMcpTools() {
  const getSummary = useCallback(
    () => rpcClient.admin.getAdminHomeSummaryForAdminHome({}),
    [],
  )

  useWebMcpCapability({
    capability: webMcpCapabilities.getAdminHomeSummary,
    execute: getSummary,
  })
  return null
}
