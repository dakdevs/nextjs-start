import { TooManyRequestsError } from '@vercel/queue'
import { Effect } from 'effect'
import { describe, expect, it } from 'vitest'

import {
  AccountProfileUpdateWorkflow,
  QueueConsumerError,
  processAccountProfileUpdatedMessage,
} from '~/queues/account-profile-updated-consumer'
import { accountProfileUpdatedEventSchema } from '~/queues/account-profile-updated'
import {
  ProcessedQueueEventStore,
  makeInMemoryProcessedQueueEventStore,
} from '~/queues/idempotency'
import { QueueTransport, publishAccountProfileUpdated } from '~/queues/queue-publisher'

const event = {
  eventId: '0f936c71-6bbb-4268-bd7d-5b38fdfab734',
  type: 'account.profile-updated' as const,
  schemaVersion: 1 as const,
  occurredAt: '2026-09-04T12:00:00.000Z',
  correlationId: '4e2ebf2f-9d4f-4e14-b157-527c2073703b',
  subjectId: 'user_123',
}

const sendAfterTwoTransientFailures = (attempts: Array<string>) =>
  QueueTransport.of({
    send: (_topic, _payload, options) => {
      attempts.push(options.idempotencyKey)
      if (attempts.length < 3) {
        return Promise.reject(new TooManyRequestsError('busy', 0))
      }
      return Promise.resolve({ messageId: 'message_after_retry' })
    },
  })

const startAfterTwoTransientFailures = (attempts: Array<string>) => ({
  start: (input: typeof event) => {
    attempts.push(input.eventId)
    return attempts.length < 3
      ? Promise.reject(new TypeError('temporary transport failure'))
      : Promise.resolve({ runId: 'workflow_after_retry' })
  },
})

const alwaysRateLimited = (attempts: Array<string>) =>
  QueueTransport.of({
    send: (_topic, _payload, options) => {
      attempts.push(options.idempotencyKey)
      return Promise.reject(new TooManyRequestsError('busy', 0))
    },
  })

describe('account profile update queue', () => {
  it('uses the event ID as the queue idempotency key', async () => {
    const deliveries: Array<{ readonly key: string; readonly topic: string }> = []
    const transport = QueueTransport.of({
      send: (topic, _payload, options) => {
        deliveries.push({ key: options.idempotencyKey, topic })
        return Promise.resolve({ messageId: 'message_123' })
      },
    })

    await expect(
      Effect.runPromise(
        publishAccountProfileUpdated(event).pipe(
          Effect.provideService(QueueTransport, transport),
        ),
      ),
    ).resolves.toEqual({ messageId: 'message_123' })

    expect(deliveries).toEqual([
      { key: event.eventId, topic: 'account-profile-updated' },
    ])
  })

  it('acknowledges a redelivery only after the first delivery completed', async () => {
    const started: Array<string> = []
    const store = makeInMemoryProcessedQueueEventStore()
    const workflow = AccountProfileUpdateWorkflow.of({
      start: (input) =>
        Effect.sync(() => {
          started.push(input.eventId)
          return { runId: 'run_123' }
        }),
    })
    const program = processAccountProfileUpdatedMessage(event).pipe(
      Effect.provideService(ProcessedQueueEventStore, store),
      Effect.provideService(AccountProfileUpdateWorkflow, workflow),
    )

    await expect(Effect.runPromise(program)).resolves.toEqual({
      status: 'started',
      runId: 'run_123',
    })
    await expect(Effect.runPromise(program)).resolves.toEqual({
      status: 'completed',
    })
    expect(started).toEqual([event.eventId])
  })

  it('releases a claim when workflow startup fails', async () => {
    const store = makeInMemoryProcessedQueueEventStore()
    const failingWorkflow = AccountProfileUpdateWorkflow.of({
      start: () =>
        Effect.fail(
          new QueueConsumerError({
            cause: 'temporary outage',
            retryAfterMilliseconds: null,
            retryable: true,
          }),
        ),
    })
    const failedAttempt = processAccountProfileUpdatedMessage(event).pipe(
      Effect.provideService(ProcessedQueueEventStore, store),
      Effect.provideService(AccountProfileUpdateWorkflow, failingWorkflow),
    )

    await expect(Effect.runPromise(failedAttempt)).rejects.toMatchObject({
      _tag: 'QueueConsumerError',
    })

    const recoveredAttempt = processAccountProfileUpdatedMessage(event).pipe(
      Effect.provideService(ProcessedQueueEventStore, store),
      Effect.provideService(
        AccountProfileUpdateWorkflow,
        AccountProfileUpdateWorkflow.of({
          start: () => Effect.succeed({ runId: 'run_recovered' }),
        }),
      ),
    )
    await expect(Effect.runPromise(recoveredAttempt)).resolves.toEqual({
      status: 'started',
      runId: 'run_recovered',
    })
  })

  it('rejects a concurrent redelivery while the first delivery owns the claim', async () => {
    let finishStart: ((runId: string) => void) | undefined
    let markStartEntered: (() => void) | undefined
    const started = new Promise<string>((resolve) => {
      finishStart = resolve
    })
    const startEntered = new Promise<void>((resolve) => {
      markStartEntered = resolve
    })
    const store = makeInMemoryProcessedQueueEventStore()
    const workflow = AccountProfileUpdateWorkflow.of({
      start: () =>
        Effect.sync(() => markStartEntered?.()).pipe(
          Effect.andThen(Effect.promise(() => started)),
          Effect.map((runId) => ({ runId })),
        ),
    })
    const program = processAccountProfileUpdatedMessage(event).pipe(
      Effect.provideService(ProcessedQueueEventStore, store),
      Effect.provideService(AccountProfileUpdateWorkflow, workflow),
    )

    const firstDelivery = Effect.runPromise(program)
    await startEntered

    await expect(Effect.runPromise(program)).rejects.toMatchObject({
      _tag: 'QueueMessageInProgressError',
      eventId: event.eventId,
    })

    finishStart?.('run_concurrent')
    await expect(firstDelivery).resolves.toEqual({
      status: 'started',
      runId: 'run_concurrent',
    })
  })

  it('retries a transient queue publish three total times with the same key', async () => {
    const keys: Array<string> = []
    const transport = sendAfterTwoTransientFailures(keys)

    await expect(
      Effect.runPromise(
        publishAccountProfileUpdated(event).pipe(
          Effect.provideService(QueueTransport, transport),
        ),
      ),
    ).resolves.toEqual({ messageId: 'message_after_retry' })
    expect(keys).toEqual([event.eventId, event.eventId, event.eventId])
  })

  it('preserves safe provider diagnostics after queue retry exhaustion', async () => {
    const keys: Array<string> = []

    await expect(
      Effect.runPromise(
        publishAccountProfileUpdated(event).pipe(
          Effect.provideService(QueueTransport, alwaysRateLimited(keys)),
        ),
      ),
    ).rejects.toMatchObject({
      _tag: 'QueuePublishError',
      attempt: 3,
      causeName: 'TooManyRequestsError',
      providerStatus: 429,
      retryable: true,
    })
    expect(keys).toEqual([event.eventId, event.eventId, event.eventId])
  })

  it('retries transient workflow start failures with bounded attempts', async () => {
    const attemptedEventIds: Array<string> = []
    const workflow = AccountProfileUpdateWorkflow.fromStarter(
      startAfterTwoTransientFailures(attemptedEventIds),
      {
        baseDelayMilliseconds: 1,
        maxAttempts: 3,
        timeoutMilliseconds: 100,
      },
    )

    await expect(Effect.runPromise(workflow.start(event))).resolves.toEqual({
      runId: 'workflow_after_retry',
    })
    expect(attemptedEventIds).toEqual([event.eventId, event.eventId, event.eventId])
  })

  it('bounds the workflow starter wait when the SDK cannot be cancelled', async () => {
    const workflow = AccountProfileUpdateWorkflow.fromStarter(
      { start: () => Effect.runPromise(Effect.never) },
      {
        baseDelayMilliseconds: 1,
        maxAttempts: 1,
        timeoutMilliseconds: 10,
      },
    )

    await expect(Effect.runPromise(workflow.start(event))).rejects.toMatchObject({
      _tag: 'QueueConsumerError',
      retryable: true,
    })
  })

  it('rejects an unsupported event version at the transport boundary', () => {
    const result = accountProfileUpdatedEventSchema.safeParse({
      ...event,
      schemaVersion: 2,
    })

    expect(result.success).toBe(false)
  })
})
