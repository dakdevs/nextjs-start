import type { InferRouterContractOutputs } from '@orpc/contract'

import { adminContracts } from '~/domains/admin/contracts'
import { rpcClient } from '~/orpc/client'

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
  getDataCatalog: () => {
    return rpcClient.admin.getDataCatalogForAdminDataCatalog({})
  },
  listAccountProfiles: () => {
    return rpcClient.admin.listAccountProfilesForAdminDataCatalog({})
  },
  listFailedQueueEvents: () => {
    return rpcClient.admin.listFailedQueueEventsForAdminDataCatalog({})
  },
  listWorkflowReceipts: () => {
    return rpcClient.admin.listWorkflowReceiptsForAdminDataCatalog({})
  },
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

export const adminDataWebMcpExecutors =
  createAdminDataWebMcpExecutors(browserAdminDataReader)
