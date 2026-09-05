'use client'

import { useMemo } from 'react'
import type { InferRouterContractOutputs } from '@orpc/contract'

import { adminContracts } from '~/domains/admin/contracts'
import { rpcClient } from '~/orpc/client'
import { webMcpCapabilities } from '~/webmcp/capability-registry'
import { useWebMcpCapability } from '~/webmcp/use-webmcp-capability'

type DataCatalog = InferRouterContractOutputs<
  typeof adminContracts.getDataCatalogForAdminDataCatalog
>
type AccountProfiles = InferRouterContractOutputs<
  typeof adminContracts.listAccountProfilesForAdminDataCatalog
>
type FailedQueueEvents = InferRouterContractOutputs<
  typeof adminContracts.listFailedQueueEventsForAdminDataCatalog
>
type WorkflowReceipts = InferRouterContractOutputs<
  typeof adminContracts.listWorkflowReceiptsForAdminDataCatalog
>

type AdminDataReader = {
  readonly getDataCatalog: () => Promise<DataCatalog>
  readonly listAccountProfiles: () => Promise<AccountProfiles>
  readonly listFailedQueueEvents: () => Promise<FailedQueueEvents>
  readonly listWorkflowReceipts: () => Promise<WorkflowReceipts>
}

const browserAdminDataReader = {
  getDataCatalog: () => rpcClient.admin.getDataCatalogForAdminDataCatalog({}),
  listAccountProfiles: () => rpcClient.admin.listAccountProfilesForAdminDataCatalog({}),
  listFailedQueueEvents: () =>
    rpcClient.admin.listFailedQueueEventsForAdminDataCatalog({}),
  listWorkflowReceipts: () =>
    rpcClient.admin.listWorkflowReceiptsForAdminDataCatalog({}),
} satisfies AdminDataReader

/** Keeps each capability bound to the exact operation visible in its section. */
export function createAdminDataWebMcpExecutors(reader: AdminDataReader) {
  return {
    getDataCatalog: reader.getDataCatalog,
    listAccountProfiles: reader.listAccountProfiles,
    listFailedQueueEvents: reader.listFailedQueueEvents,
    listWorkflowReceipts: reader.listWorkflowReceipts,
  }
}

/** Browser-only read capability for the safe admin data catalog. */
export function AdminDataWebMcpTools() {
  const executors = useMemo(
    () => createAdminDataWebMcpExecutors(browserAdminDataReader),
    [],
  )

  useWebMcpCapability({
    capability: webMcpCapabilities.getAdminDataCatalog,
    execute: executors.getDataCatalog,
  })
  useWebMcpCapability({
    capability: webMcpCapabilities.listAdminAccountProfiles,
    execute: executors.listAccountProfiles,
  })
  useWebMcpCapability({
    capability: webMcpCapabilities.listAdminFailedQueueEvents,
    execute: executors.listFailedQueueEvents,
  })
  useWebMcpCapability({
    capability: webMcpCapabilities.listAdminWorkflowReceipts,
    execute: executors.listWorkflowReceipts,
  })
  return null
}
