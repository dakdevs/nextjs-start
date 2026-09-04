import type { MessageMetadata } from '@vercel/queue'
import { Effect } from 'effect'
import { describe, expect, it } from 'vitest'

import {
  AccountProfileUpdateWorkflow,
  QueueConsumerError,
} from '~/queues/account-profile-updated-consumer'
import { accountProfileUpdatedQueueHandler } from '~/queues/account-profile-updated-handler'
import {
  FailedQueueEventStore,
  makeInMemoryFailedQueueEventStore,
} from '~/queues/failed-event-store'
import {
  ProcessedQueueEventStore,
  makeInMemoryProcessedQueueEventStore,
} from '~/queues/idempotency'

const event = {
  eventId: '0f936c71-6bbb-4268-bd7d-5b38fdfab734',
  type: 'account.profile-updated' as const,
  schemaVersion: 1 as const,
  occurredAt: '2026-09-04T12:00:00.000Z',
  correlationId: '4e2ebf2f-9d4f-4e14-b157-527c2073703b',
  subjectId: 'user_123',
}

const metadata = (deliveryCount: number): MessageMetadata => ({
  messageId: 'message_profile_update',
  deliveryCount,
  createdAt: new Date('2026-09-04T12:00:00.000Z'),
  expiresAt: new Date('2026-09-05T12:00:00.000Z'),
  topicName: 'account-profile-updated',
  consumerGroup: 'profile-update-audit',
  region: 'iad1',
})

const retryableFailure = AccountProfileUpdateWorkflow.of({
  start: () =>
    Effect.fail(
      new QueueConsumerError({
        cause: 'workflow unavailable',
        retryAfterMilliseconds: null,
        retryable: true,
      }),
    ),
})

describe('account profile updated delivery policy', () => {
  it('asks Vercel to redeliver a failure that has not reached terminal handling', () => {
    expect(
      accountProfileUpdatedQueueHandler.retry(new Error('retry'), metadata(7)),
    ).toEqual({
      afterSeconds: 60,
    })
  })

  it('throws a retryable failure before the bounded terminal attempt', async () => {
    const records: Parameters<typeof makeInMemoryFailedQueueEventStore>[0] = []
    const program = accountProfileUpdatedQueueHandler
      .handle(event, metadata(11))
      .pipe(
        Effect.provideService(
          ProcessedQueueEventStore,
          makeInMemoryProcessedQueueEventStore(),
        ),
        Effect.provideService(AccountProfileUpdateWorkflow, retryableFailure),
        Effect.provideService(
          FailedQueueEventStore,
          makeInMemoryFailedQueueEventStore(records),
        ),
      )

    await expect(Effect.runPromise(program)).rejects.toMatchObject({
      _tag: 'QueueConsumerError',
    })
    expect(records).toEqual([])
  })

  it('persists sanitized correlation data before terminal acknowledgement', async () => {
    const records: Parameters<typeof makeInMemoryFailedQueueEventStore>[0] = []
    const program = accountProfileUpdatedQueueHandler
      .handle(event, metadata(12))
      .pipe(
        Effect.provideService(
          ProcessedQueueEventStore,
          makeInMemoryProcessedQueueEventStore(),
        ),
        Effect.provideService(AccountProfileUpdateWorkflow, retryableFailure),
        Effect.provideService(
          FailedQueueEventStore,
          makeInMemoryFailedQueueEventStore(records),
        ),
      )

    await expect(Effect.runPromise(program)).resolves.toEqual({
      status: 'quarantined',
    })
    expect(records).toEqual([
      {
        consumerName: 'profile-update-audit',
        correlationId: event.correlationId,
        deliveryCount: 12,
        eventId: event.eventId,
        failureCode: 'QueueConsumerError',
        messageId: 'message_profile_update',
      },
    ])
  })

  it('quarantines an invalid payload without retaining its contents', async () => {
    const records: Parameters<typeof makeInMemoryFailedQueueEventStore>[0] = []
    const program = accountProfileUpdatedQueueHandler
      .handle(
        { email: 'must-not-be-stored@example.test', schemaVersion: 99 },
        metadata(3),
      )
      .pipe(
        Effect.provideService(
          ProcessedQueueEventStore,
          makeInMemoryProcessedQueueEventStore(),
        ),
        Effect.provideService(AccountProfileUpdateWorkflow, retryableFailure),
        Effect.provideService(
          FailedQueueEventStore,
          makeInMemoryFailedQueueEventStore(records),
        ),
      )

    await expect(Effect.runPromise(program)).resolves.toEqual({
      status: 'quarantined',
    })
    expect(records).toEqual([
      {
        consumerName: 'profile-update-audit',
        correlationId: null,
        deliveryCount: 3,
        eventId: null,
        failureCode: 'InvalidAccountProfileUpdatedMessageError',
        messageId: 'message_profile_update',
      },
    ])
  })
})
