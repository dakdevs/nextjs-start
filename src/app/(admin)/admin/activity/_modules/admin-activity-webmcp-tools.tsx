'use client'

import { useCallback } from 'react'

import { rpcClient } from '~/orpc/client'
import { webMcpCapabilities } from '~/webmcp/capability-registry'
import { useWebMcpCapability } from '~/webmcp/use-webmcp-capability'

/** Browser-only read capability for the safe administrative activity feed. */
export function AdminActivityWebMcpTools() {
  const listActivity = useCallback(
    () => rpcClient.admin.listAdminActivityForAdminActivityScreen({}),
    [],
  )

  useWebMcpCapability({
    capability: webMcpCapabilities.listAdminActivity,
    execute: listActivity,
  })
  return null
}
