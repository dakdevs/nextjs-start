import { AdminLoadFailure } from '~/app/(admin)/admin/_modules/admin-load-failure'
import { loadAdminScreen } from '~/app/(admin)/admin/_modules/admin-screen-load'
import { AdminUsersWorkspace } from '~/app/(admin)/admin/users/_modules/admin-users-workspace'
import { createServerRpcClient } from '~/orpc/server-client'

export default async function AdminUsersPage() {
  const result = await loadAdminScreen(async () => {
    const client = await createServerRpcClient()
    return client.admin.listUsersForAdminUserSupport({})
  })

  return result.status === 'ready' ? (
    <AdminUsersWorkspace initial={result.data} />
  ) : (
    <AdminLoadFailure errorId={result.errorId} />
  )
}
