import { eq } from 'drizzle-orm'
import { Effect } from 'effect'
import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '~/db/client'
import { AccountProfileUpdateWorkflow } from '~/queues/account-profile-updated-consumer'
import { accountProfileUpdatedQueueHandler } from '~/queues/account-profile-updated-handler'
import { FailedQueueEventStore } from '~/queues/failed-event-store'
import { ProcessedQueueEventStore } from '~/queues/idempotency'
import { postgresFailedQueueEventStore } from '~/queues/postgres-failed-event-store'
import { postgresProcessedQueueEventStore } from '~/queues/postgres-processed-event-store'
import { failedQueueEvents } from '~/queues/schema'

describe('account profile queue quarantine against PostgreSQL', () => {
  beforeEach(async () => {
    await db.delete(failedQueueEvents)
  })

  it('stores a terminal invalid message without storing its payload', async () => {
    await Effect.runPromise(
      accountProfileUpdatedQueueHandler
        .handle(
          { secret: 'must never be retained', schemaVersion: 99 },
          {
            messageId: 'invalid_message_123',
            deliveryCount: 3,
            createdAt: new Date('2026-09-04T12:00:00.000Z'),
            expiresAt: new Date('2026-09-05T12:00:00.000Z'),
            topicName: 'account-profile-updated',
            consumerGroup: 'profile-update-audit',
            region: 'iad1',
          },
        )
        .pipe(
          Effect.provideService(
            ProcessedQueueEventStore,
            postgresProcessedQueueEventStore,
          ),
          Effect.provideService(
            AccountProfileUpdateWorkflow,
            AccountProfileUpdateWorkflow.of({
              start: () => Effect.succeed({ runId: 'unused' }),
            }),
          ),
          Effect.provideService(FailedQueueEventStore, postgresFailedQueueEventStore),
        ),
    )

    const [stored] = await db
      .select()
      .from(failedQueueEvents)
      .where(eq(failedQueueEvents.messageId, 'invalid_message_123'))

    expect(stored).toMatchObject({
      consumerName: 'profile-update-audit',
      correlationId: null,
      deliveryCount: 3,
      eventId: null,
      failureCode: 'InvalidAccountProfileUpdatedMessageError',
      messageId: 'invalid_message_123',
    })
    expect(stored).not.toHaveProperty('payload')
  })
})
