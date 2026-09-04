import { Effect, Option } from 'effect'
import { describe, expect, it } from 'vitest'

import {
  TransactionalOutbox,
  publishNextOutboxMessage,
  stageAccountProfileUpdatedInOutbox,
} from '~/queues/outbox/service'
import { QueueTransport } from '~/queues/queue-publisher'

const event = {
  eventId: '0f936c71-6bbb-4268-bd7d-5b38fdfab734',
  type: 'account.profile-updated' as const,
  schemaVersion: 1 as const,
  occurredAt: '2026-09-04T12:00:00.000Z',
  correlationId: '4e2ebf2f-9d4f-4e14-b157-527c2073703b',
  subjectId: 'user_123',
}

describe('optional transactional outbox seam', () => {
  it('stages the exact event through the transaction-bound adapter', async () => {
    const staged: Array<string> = []
    const outbox = TransactionalOutbox.of({
      stageAccountProfileUpdated: (input) =>
        Effect.sync(() => {
          staged.push(input.eventId)
        }),
      claimNext: Effect.succeed(Option.none()),
      markPublished: () => Effect.void,
    })

    await Effect.runPromise(
      stageAccountProfileUpdatedInOutbox(event).pipe(
        Effect.provideService(TransactionalOutbox, outbox),
      ),
    )

    expect(staged).toEqual([event.eventId])
  })

  it('marks a claimed event only after the queue accepts it', async () => {
    const marked: Array<string> = []
    const outbox = TransactionalOutbox.of({
      stageAccountProfileUpdated: () => Effect.void,
      claimNext: Effect.succeed(Option.some(event)),
      markPublished: (eventId) =>
        Effect.sync(() => {
          marked.push(eventId)
        }),
    })
    const transport = QueueTransport.of({
      send: () => Promise.resolve({ messageId: 'message_123' }),
    })

    await expect(
      Effect.runPromise(
        publishNextOutboxMessage.pipe(
          Effect.provideService(TransactionalOutbox, outbox),
          Effect.provideService(QueueTransport, transport),
        ),
      ),
    ).resolves.toEqual({ status: 'published', eventId: event.eventId })

    expect(marked).toEqual([event.eventId])
  })
})
