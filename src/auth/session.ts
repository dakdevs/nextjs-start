import 'server-only'

import { headers } from 'next/headers'
import { cache } from 'react'
import { eq } from 'drizzle-orm'

import { auth } from '~/auth/auth'
import { db } from '~/db/client'
import { users } from '~/db/schema'

export const getCurrentSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null

  // Roles are authorization data: read them fresh instead of trusting a cookie-derived session.
  const [user] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
  if (!user) return null
  return { ...session, user: { ...session.user, role: user.role } }
})
