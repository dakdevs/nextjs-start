import { AdminLoadFailure } from '~/app/(admin)/admin/_modules/admin-load-failure'
import { loadAdminScreen } from '~/app/(admin)/admin/_modules/admin-screen-load'
import { AdminDataCatalog } from '~/app/(admin)/admin/data/_modules/admin-data-catalog'
import { createServerRpcClient } from '~/orpc/server-client'

export default async function AdminDataPage() {
  const result = await loadAdminScreen(async () => {
    const client = await createServerRpcClient()
    const [catalog, profiles, failedQueueEvents, workflowReceipts] = await Promise.all([
      client.admin.getDataCatalogForAdminDataCatalog({}),
      client.admin.listAccountProfilesForAdminDataCatalog({}),
      client.admin.listFailedQueueEventsForAdminDataCatalog({}),
      client.admin.listWorkflowReceiptsForAdminDataCatalog({}),
    ])
    return { catalog, ...failedQueueEvents, ...profiles, ...workflowReceipts }
  })

  return result.status === 'ready' ? (
    <AdminDataCatalog {...result.data} />
  ) : (
    <AdminLoadFailure errorId={result.errorId} />
  )
}
