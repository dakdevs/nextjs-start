'use client'

import { adminDataWebMcpExecutors } from '~/app/(admin)/admin/data/_modules/admin-data-webmcp-executors'
import { webMcpCapabilities } from '~/webmcp/capability-registry'
import { useWebMcpCapability } from '~/webmcp/use-webmcp-capability'

/** Browser-only read capability for the safe admin data catalog. */
export function AdminDataWebMcpTools() {
  useWebMcpCapability({
    capability: webMcpCapabilities.getAdminDataCatalog,
    execute: adminDataWebMcpExecutors.getDataCatalog,
  })

  useWebMcpCapability({
    capability: webMcpCapabilities.listAdminAccountProfiles,
    execute: adminDataWebMcpExecutors.listAccountProfiles,
  })

  useWebMcpCapability({
    capability: webMcpCapabilities.listAdminFailedQueueEvents,
    execute: adminDataWebMcpExecutors.listFailedQueueEvents,
  })

  useWebMcpCapability({
    capability: webMcpCapabilities.listAdminWorkflowReceipts,
    execute: adminDataWebMcpExecutors.listWorkflowReceipts,
  })

  return null
}
