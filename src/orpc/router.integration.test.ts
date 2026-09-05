import { createRouterClient } from '@orpc/server'
import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

import type { getCurrentSession } from '~/auth/session'
import { db } from '~/db/client'
import { accountProfiles, users } from '~/db/schema'
import { makeRpcContext } from '~/orpc/context'
import { router } from '~/orpc/router'

type AuthenticatedSession = Exclude<Awaited<ReturnType<typeof getCurrentSession>>, null>

const sessionFor = (user: AuthenticatedSession['user']): AuthenticatedSession => ({
  session: {
    createdAt: new Date('2026-09-04T00:00:00.000Z'),
    expiresAt: new Date('2026-10-04T00:00:00.000Z'),
    id: `session_${user.id}`,
    ipAddress: null,
    token: `token_${user.id}`,
    updatedAt: new Date('2026-09-04T00:00:00.000Z'),
    userAgent: null,
    userId: user.id,
  },
  user,
})

const clientFor = (session: AuthenticatedSession | null) =>
  createRouterClient(router, {
    context: makeRpcContext({
      requestId: crypto.randomUUID(),
      session,
    }),
  })

describe('account oRPC contracts against PostgreSQL', () => {
  it('rejects a protected account read without a signed-in session', async () => {
    await expect(
      clientFor(null).account.getAccountProfileForAccountScreen({}),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })

  it('rejects an authenticated non-administrator before an admin read reaches storage', async () => {
    await expect(
      clientFor(
        sessionFor({
          createdAt: new Date('2026-09-04T00:00:00.000Z'),
          email: 'member@example.test',
          emailVerified: true,
          id: 'member_account',
          image: null,
          name: 'Member Person',
          role: 'user',
          updatedAt: new Date('2026-09-04T00:00:00.000Z'),
        }),
      ).admin.getAdminHomeSummaryForAdminHome({}),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('rejects an authenticated non-administrator before an admin mutation reaches storage', async () => {
    const member = sessionFor({
      createdAt: new Date('2026-09-04T00:00:00.000Z'),
      email: 'member-mutation@example.test',
      emailVerified: true,
      id: 'member_mutation_account',
      image: null,
      name: 'Member Mutation Person',
      role: 'user',
      updatedAt: new Date('2026-09-04T00:00:00.000Z'),
    })

    await expect(
      clientFor(member).admin.requestPasswordResetForAdminUserSupport({
        userId: member.user.id,
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('returns the exact account-screen projection for the current user only', async () => {
    const currentUser = {
      createdAt: new Date('2026-09-04T00:00:00.000Z'),
      email: 'current@example.test',
      emailVerified: true,
      id: 'current_account',
      image: null,
      name: 'Current Person',
      role: 'user' as const,
      updatedAt: new Date('2026-09-04T00:00:00.000Z'),
    } satisfies AuthenticatedSession['user']

    await db.insert(users).values([
      currentUser,
      {
        email: 'other@example.test',
        emailVerified: false,
        id: 'other_account',
        name: 'Other Person',
        role: 'admin',
      },
    ])
    await db.insert(accountProfiles).values([
      { accountId: 'current_account', bio: 'Current bio.' },
      { accountId: 'other_account', bio: 'Other bio.' },
    ])

    await expect(
      clientFor(sessionFor(currentUser)).account.getAccountProfileForAccountScreen({}),
    ).resolves.toEqual({
      bio: 'Current bio.',
      email: 'current@example.test',
      emailVerified: true,
      hasPasskey: false,
      name: 'Current Person',
    })
  })

  it('rejects malformed account updates at the contract boundary before persistence', async () => {
    await db.insert(users).values({
      email: 'boundary@example.test',
      emailVerified: true,
      id: 'boundary_account',
      name: 'Before boundary validation',
    })

    const [user] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, 'boundary_account'))

    await expect(
      clientFor(
        sessionFor({
          createdAt: new Date('2026-09-04T00:00:00.000Z'),
          email: 'boundary@example.test',
          emailVerified: true,
          id: 'boundary_account',
          image: null,
          name: 'Before boundary validation',
          role: 'user',
          updatedAt: new Date('2026-09-04T00:00:00.000Z'),
        }),
      ).account.updateAccountProfileForAccountScreen({
        bio: 'Should not persist.',
        name: '',
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })

    await expect(
      db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, 'boundary_account')),
    ).resolves.toEqual([user])
  })
})
