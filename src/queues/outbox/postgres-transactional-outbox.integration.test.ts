import { eq } from 'drizzle-orm'
import { Effect } from 'effect'
import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '~/db/client'
import {
  makePostgresTransactionalOutbox,
  publishNextPostgresOutboxMessage,
} from '~/queues/outbox/postgres-transactional-outbox'
import {
  TransactionalOutbox,
  stageAccountProfileUpdatedInOutbox,
} from '~/queues/outbox/service'
import { transactionalOutboxMessages } from '~/queues/outbox/schema'
import { QueueTransport } from '~/queues/queue-publisher'

const event = {
  eventId: '0f936c71-6bbb-4268-bd7d-5b38fdfab734',
  type: 'account.profile-updated' as const,
  schemaVersion: 1 as const,
  occurredAt: '2026-09-04T12:00:00.000Z',
  correlationId: '4e2ebf2f-9d4f-4e14-b157-527c2073703b',
  subjectId: 'user_123',
}

describe('PostgreSQL transactional outbox adapter', () => {
  beforeEach(async () => {
    await db.delete(transactionalOutboxMessages)
  })

  it('stages, publishes, and marks one event with the same idempotency key', async () => {
    await db.transaction((transaction) =>
      Effect.runPromise(
        stageAccountProfileUpdatedInOutbox(event).pipe(
          Effect.provideService(
            TransactionalOutbox,
            makePostgresTransactionalOutbox(transaction),
          ),
        ),
      ),
    )

    const deliveries: Array<string> = []
    const transport = QueueTransport.of({
      send: (_topic, _payload, options) => {
        deliveries.push(options.idempotencyKey)
        return Promise.resolve({ messageId: 'outbox_message' })
      },
    })
    await Effect.runPromise(
      publishNextPostgresOutboxMessage.pipe(
        Effect.provideService(QueueTransport, transport),
      ),
    )

    const [stored] = await db
      .select({ publishedAt: transactionalOutboxMessages.publishedAt })
      .from(transactionalOutboxMessages)
      .where(eq(transactionalOutboxMessages.eventId, event.eventId))

    expect(deliveries).toEqual([event.eventId])
    expect(stored?.publishedAt).toBeInstanceOf(Date)
  })
})
