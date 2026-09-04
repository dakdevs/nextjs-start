import { sql } from 'drizzle-orm'
import { Effect } from 'effect'
import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '~/db/client'
import { users } from '~/db/schema'
import {
  getAccountProfileForAccountScreenFromDatabase,
  updateAccountProfileForAccountScreenInDatabase,
} from '~/domains/account/server/account-profile-repository'
import { updateAccountProfileForAccountScreen } from '~/domains/account/server/account-profile-service'
import { accountProfileUpdatedEventSchema } from '~/queues/account-profile-updated'
import { QueueTransport } from '~/queues/queue-publisher'

describe('account profile repository against PostgreSQL', () => {
  beforeEach(async () => {
    await db.delete(users)
  })

  it('returns only the account-screen projection', async () => {
    await db.insert(users).values({
      id: 'account_projection',
      email: 'projection@example.test',
      emailVerified: true,
      name: 'Projection Person',
      role: 'admin',
    })

    await expect(
      Effect.runPromise(
        getAccountProfileForAccountScreenFromDatabase('account_projection'),
      ),
    ).resolves.toEqual({
      bio: '',
      email: 'projection@example.test',
      emailVerified: true,
      hasPasskey: false,
      name: 'Projection Person',
    })
  })

  it('updates the account name and profile bio atomically', async () => {
    await db.insert(users).values({
      id: 'account_update',
      email: 'update@example.test',
      emailVerified: true,
      name: 'Before',
    })

    await Effect.runPromise(
      updateAccountProfileForAccountScreenInDatabase({
        accountId: 'account_update',
        bio: 'One clear profile.',
        name: 'After',
      }),
    )

    await expect(
      Effect.runPromise(
        getAccountProfileForAccountScreenFromDatabase('account_update'),
      ),
    ).resolves.toMatchObject({ bio: 'One clear profile.', name: 'After' })
  })

  it('returns a named domain failure when the account does not exist', async () => {
    await expect(
      Effect.runPromise(
        getAccountProfileForAccountScreenFromDatabase('missing_account'),
      ),
    ).rejects.toMatchObject({ _tag: 'AccountProfileNotFoundError' })
  })

  it('rejects an authorization role outside the single-account role set', async () => {
    await expect(
      db.execute(sql`
        insert into "user" ("id", "name", "email", "role")
        values ('invalid_role', 'Invalid Role', 'invalid-role@example.test', 'owner')
      `),
    ).rejects.toMatchObject({
      cause: { constraint_name: 'user_role_check' },
    })
  })

  it('publishes a purpose-built event after the profile transaction commits', async () => {
    await db.insert(users).values({
      id: 'account_event',
      email: 'event@example.test',
      emailVerified: true,
      name: 'Before event',
    })
    const delivered: Array<unknown> = []
    const transport = QueueTransport.of({
      send: (_topic, payload) => {
        delivered.push(payload)
        return Promise.resolve({ messageId: 'profile_event_message' })
      },
    })

    await Effect.runPromise(
      updateAccountProfileForAccountScreen({
        accountId: 'account_event',
        bio: 'Published after commit.',
        correlationId: '07d14c8b-31a9-41ac-8db6-a088254a97a2',
        eventId: 'eced7f25-ad0c-4a85-a6e1-d240e28c3426',
        name: 'After event',
      }).pipe(Effect.provideService(QueueTransport, transport)),
    )

    expect(delivered).toHaveLength(1)
    expect(accountProfileUpdatedEventSchema.parse(delivered[0])).toMatchObject({
      correlationId: '07d14c8b-31a9-41ac-8db6-a088254a97a2',
      eventId: 'eced7f25-ad0c-4a85-a6e1-d240e28c3426',
      subjectId: 'account_event',
      type: 'account.profile-updated',
    })
    await expect(
      Effect.runPromise(getAccountProfileForAccountScreenFromDatabase('account_event')),
    ).resolves.toMatchObject({ bio: 'Published after commit.', name: 'After event' })
  })
})
