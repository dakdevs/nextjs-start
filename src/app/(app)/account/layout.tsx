import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { getCurrentSession } from '~/auth/session'
import { SiteHeader } from '~/modules/site-header'

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession()
  if (!session) redirect('/sign-in')

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader session={session} />
      {children}
    </div>
  )
}
