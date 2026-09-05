import { randomUUID } from 'node:crypto'

import { eq, sql } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

import { assertUserCanCreateSession, getCurrentUserAccess } from '~/auth/user-access'
import { resolveCurrentSession } from '~/auth/session'
import { db } from '~/db/client'
import { users } from '~/db/schema'

type AuthenticatedSession = Parameters<typeof resolveCurrentSession>[0]

const currentTime = new Date('2026-09-05T12:00:00.000Z')

const userFor = (
  label: string,
  ban: Pick<typeof users.$inferInsert, 'banned' | 'banExpires'>,
) => ({
  ...ban,
  email: `${label}-${randomUUID()}@example.test`,
  emailVerified: true,
  id: `${label}-${randomUUID()}`,
  name: label,
})

const sessionFor = (user: typeof users.$inferInsert): AuthenticatedSession => ({
  session: {
    createdAt: currentTime,
    expiresAt: new Date('2026-10-05T12:00:00.000Z'),
    id: `session_${user.id}`,
    ipAddress: null,
    token: `token_${user.id}`,
    updatedAt: currentTime,
    userAgent: null,
    userId: user.id,
  },
  user: {
    createdAt: currentTime,
    email: user.email,
    emailVerified: true,
    id: user.id,
    image: null,
    name: user.name,
    updatedAt: currentTime,
  },
})

describe('current user access', () => {
  it('allows a new session and current-session read after a temporary ban expires', async () => {
    const person = userFor('expired-ban', {
      banned: true,
      banExpires: new Date('2020-09-05T11:59:59.000Z'),
    })
    await db.insert(users).values(person)

    await expect(assertUserCanCreateSession(person.id)).resolves.toBeUndefined()
    await expect(resolveCurrentSession(sessionFor(person))).resolves.toMatchObject({
      user: { id: person.id, role: 'user' },
    })
    await expect(
      db
        .select({
          banExpires: users.banExpires,
          banReason: users.banReason,
          banned: users.banned,
        })
        .from(users)
        .where(eq(users.id, person.id)),
    ).resolves.toEqual([{ banned: false, banExpires: null, banReason: null }])
  })

  it('blocks both a new session and current-session read while a temporary ban is active', async () => {
    const person = userFor('active-ban', {
      banned: true,
      banExpires: new Date('2030-09-05T12:00:00.000Z'),
    })
    await db.insert(users).values(person)

    await expect(assertUserCanCreateSession(person.id)).rejects.toMatchObject({
      body: { code: 'BANNED_USER' },
      status: 'FORBIDDEN',
    })
    await expect(resolveCurrentSession(sessionFor(person))).resolves.toBeNull()
    await expect(getCurrentUserAccess(person.id, currentTime)).resolves.toMatchObject({
      banActive: true,
    })
  })

  it('blocks both a new session and current-session read for a permanent ban', async () => {
    const person = userFor('permanent-ban', { banned: true, banExpires: null })
    await db.insert(users).values(person)

    await expect(assertUserCanCreateSession(person.id)).rejects.toMatchObject({
      body: { code: 'BANNED_USER' },
      status: 'FORBIDDEN',
    })
    await expect(resolveCurrentSession(sessionFor(person))).resolves.toBeNull()
  })

  it('re-reads a renewed ban when expiry cleanup loses a concurrent update', async () => {
    const person = userFor('renewed-ban', {
      banned: true,
      banExpires: new Date('2020-09-05T11:59:59.000Z'),
    })
    await db.insert(users).values(person)

    try {
      await db.execute(
        sql.raw(`
          create function renew_expired_ban_once() returns trigger as $$
          begin
            if pg_trigger_depth() = 1 then
              update "user"
              set banned = true, ban_expires = timestamp '2030-09-05T12:00:00.000Z'
              where id = '${person.id}';
              return null;
            end if;
            return new;
          end;
          $$ language plpgsql;
          create trigger renew_expired_ban_before_cleanup
          before update of banned on "user"
          for each row execute function renew_expired_ban_once();
        `),
      )

      await expect(getCurrentUserAccess(person.id, currentTime)).resolves.toMatchObject(
        {
          banActive: true,
          banned: true,
          banExpires: new Date('2030-09-05T12:00:00.000Z'),
        },
      )
    } finally {
      await db.execute(
        sql.raw(
          'drop trigger if exists renew_expired_ban_before_cleanup on "user"; drop function if exists renew_expired_ban_once()',
        ),
      )
    }
  })
})
