import { AdminLoadFailure } from '~/app/(admin)/admin/_modules/admin-load-failure'
import { loadAdminScreen } from '~/app/(admin)/admin/_modules/admin-screen-load'
import { AdminActivityList } from '~/app/(admin)/admin/activity/_modules/admin-activity-list'
import { createServerRpcClient } from '~/orpc/server-client'

export default async function AdminActivityPage() {
  const result = await loadAdminScreen(async () => {
    const client = await createServerRpcClient()
    return client.admin.listAdminActivityForAdminActivityScreen({})
  })

  return result.status === 'ready' ? (
    <AdminActivityList activity={result.data} />
  ) : (
    <AdminLoadFailure errorId={result.errorId} />
  )
}
