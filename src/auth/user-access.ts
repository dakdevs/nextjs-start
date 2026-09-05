import 'server-only'

import { APIError } from 'better-auth/api'
import { and, eq, lte } from 'drizzle-orm'

import { isUserBanActive } from '~/auth/ban-policy'
import { db } from '~/db/client'
import { users } from '~/db/schema'

const findCurrentUserAccess = async (userId: string) => {
  const [user] = await db
    .select({
      banExpires: users.banExpires,
      banned: users.banned,
      id: users.id,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId))

  return user
}

export const getCurrentUserAccess = async (userId: string, now = new Date()) => {
  const user = await findCurrentUserAccess(userId)
  if (user === undefined) return null

  const banActive = isUserBanActive(user, now)
  if (user.banned && user.banExpires !== null && !banActive) {
    // The conditional update keeps a concurrent permanent or renewed ban intact.
    const cleared = await db
      .update(users)
      .set({ banned: false, banExpires: null, banReason: null, updatedAt: now })
      .where(
        and(eq(users.id, user.id), eq(users.banned, true), lte(users.banExpires, now)),
      )
      .returning({ id: users.id })

    if (cleared.length === 0) {
      // A concurrent write changed the ban after our first read. One fresh read
      // is authoritative and avoids retrying or clearing a renewed ban.
      const authoritativeUser = await findCurrentUserAccess(userId)
      if (authoritativeUser === undefined) return null
      return {
        ...authoritativeUser,
        banActive: isUserBanActive(authoritativeUser, now),
      }
    }

    return { ...user, banned: false, banExpires: null, banActive: false }
  }

  return { ...user, banActive }
}

export const assertUserCanCreateSession = async (userId: string) => {
  const user = await getCurrentUserAccess(userId)
  if (user?.banActive === true) {
    throw APIError.from('FORBIDDEN', {
      code: 'BANNED_USER',
      message: 'This account is unavailable. Contact support if you need help.',
    })
  }
}
