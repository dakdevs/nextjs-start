import { AdminLoadFailure } from '~/app/(admin)/admin/_modules/admin-load-failure'
import { loadAdminScreen } from '~/app/(admin)/admin/_modules/admin-screen-load'
import { AdminServiceAccountsWorkspace } from '~/app/(admin)/admin/service-accounts/_modules/admin-service-accounts-workspace'
import { createServerRpcClient } from '~/orpc/server-client'

export default async function AdminServiceAccountsPage() {
  const result = await loadAdminScreen(async () => {
    const client = await createServerRpcClient()
    return client.admin.listServiceAccountsForAdminServiceAccounts({})
  })

  return result.status === 'ready' ? (
    <AdminServiceAccountsWorkspace initial={result.data} />
  ) : (
    <AdminLoadFailure errorId={result.errorId} />
  )
}
