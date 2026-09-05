import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { AdminProviders } from '~/app/(admin)/admin/_modules/admin-providers'
import { AdminShell } from '~/app/(admin)/admin/_modules/admin-shell'
import { accountRole } from '~/auth/roles'
import { getCurrentSession } from '~/auth/session'

export default async function AdminLayout({
  children,
}: {
  readonly children: ReactNode
}) {
  const session = await getCurrentSession()
  if (session === null) redirect('/sign-in')
  if (session.user.role !== accountRole.admin) redirect('/account')

  return (
    <AdminProviders>
      <AdminShell user={{ email: session.user.email, name: session.user.name }}>
        {children}
      </AdminShell>
    </AdminProviders>
  )
}
