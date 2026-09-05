import { AdminHome } from '~/app/(admin)/admin/_modules/admin-home'
import { AdminLoadFailure } from '~/app/(admin)/admin/_modules/admin-load-failure'
import { loadAdminScreen } from '~/app/(admin)/admin/_modules/admin-screen-load'
import { createServerRpcClient } from '~/orpc/server-client'

export default async function AdminHomePage() {
  const result = await loadAdminScreen(async () => {
    const client = await createServerRpcClient()
    return client.admin.getAdminHomeSummaryForAdminHome({})
  })

  return result.status === 'ready' ? (
    <AdminHome summary={result.data} />
  ) : (
    <AdminLoadFailure errorId={result.errorId} />
  )
}
