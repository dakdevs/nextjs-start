import 'server-only'

import { headers } from 'next/headers'
import { cache } from 'react'

import { auth } from '~/auth/auth'
import { getCurrentUserAccess } from '~/auth/user-access'

type AuthenticatedSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>

export const resolveCurrentSession = async (session: AuthenticatedSession) => {
  // Roles and bans are authorization data: read them fresh instead of trusting
  // a cookie-derived session. This also clears a completed temporary ban.
  const user = await getCurrentUserAccess(session.user.id)
  if (!user || user.banActive) return null
  return { ...session, user: { ...session.user, role: user.role } }
}

export const getCurrentSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null
  return resolveCurrentSession(session)
})
