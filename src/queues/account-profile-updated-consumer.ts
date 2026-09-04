import 'server-only'

import { Context, Data, Effect, Random } from 'effect'
import { WorkflowWorldError } from 'workflow/errors'
import { z } from 'zod'

import { accountProfileUpdatedEventSchema } from '~/queues/account-profile-updated'
import { ProcessedQueueEventStore } from '~/queues/idempotency'

type AccountProfileUpdatedEvent = z.infer<typeof accountProfileUpdatedEventSchema>

type WorkflowStarter = Readonly<{
  start: (event: AccountProfileUpdatedEvent) => Promise<{ readonly runId: string }>
}>

type WorkflowStartPolicy = Readonly<{
  baseDelayMilliseconds: number
  maxAttempts: number
  timeoutMilliseconds: number
}>

const workflowStartDefaultPolicy = {
  baseDelayMilliseconds: 250,
  maxAttempts: 3,
  timeoutMilliseconds: 5_000,
} satisfies WorkflowStartPolicy

const consumerName = 'profile-update-audit'

export const QueueConsumerError = Data.TaggedError('QueueConsumerError')<{
  readonly cause: unknown
  readonly retryAfterMilliseconds: number | null
  readonly retryable: boolean
}>

type QueueConsumerFailure = InstanceType<typeof QueueConsumerError>

export const QueueMessageInProgressError = Data.TaggedError(
  'QueueMessageInProgressError',
)<{
  readonly consumerName: string
  readonly eventId: string
}>

export class AccountProfileUpdateWorkflow extends Context.Service<
  AccountProfileUpdateWorkflow,
  {
    readonly start: (
      event: AccountProfileUpdatedEvent,
    ) => Effect.Effect<{ readonly runId: string }, QueueConsumerFailure>
  }
>()(
  'nextjs-start/queues/account-profile-updated-consumer/AccountProfileUpdateWorkflow',
) {
  static fromStarter(
    starter: WorkflowStarter,
    policy: WorkflowStartPolicy = workflowStartDefaultPolicy,
  ) {
    return AccountProfileUpdateWorkflow.of({
      start: (event) => startWorkflowWithResilience(starter, event, policy),
    })
  }
}

const workflowStartError = (cause: unknown) => {
  if (WorkflowWorldError.is(cause)) {
    const status = cause.status ?? 0
    return new QueueConsumerError({
      cause,
      retryAfterMilliseconds:
        cause.retryAfter === undefined ? null : cause.retryAfter * 1_000,
      retryable:
        status === 408 ||
        status === 425 ||
        status === 429 ||
        status >= 500 ||
        cause.code === 'TIMEOUT' ||
        cause.code === 'TRANSPORT',
    })
  }

  return new QueueConsumerError({
    cause,
    retryAfterMilliseconds: null,
    retryable: cause instanceof TypeError,
  })
}

const startWorkflowOnce = (
  starter: WorkflowStarter,
  event: AccountProfileUpdatedEvent,
  timeoutMilliseconds: number,
) =>
  Effect.tryPromise({
    // Workflow start does not expose AbortSignal support. This deadline bounds
    // the consumer wait; the idempotent audit sink makes late acceptance safe.
    try: () => starter.start(event),
    catch: workflowStartError,
  }).pipe(
    Effect.timeout(`${timeoutMilliseconds} millis`),
    Effect.mapError((error) =>
      error._tag === 'TimeoutError'
        ? workflowStartError(new TypeError('timeout'))
        : error,
    ),
  )

const startWorkflowWithResilience = (
  starter: WorkflowStarter,
  event: AccountProfileUpdatedEvent,
  policy: WorkflowStartPolicy,
  attempt = 1,
): Effect.Effect<{ readonly runId: string }, QueueConsumerFailure> =>
  startWorkflowOnce(starter, event, policy.timeoutMilliseconds).pipe(
    Effect.catchTag('QueueConsumerError', (error) => {
      if (!error.retryable || attempt >= policy.maxAttempts) return Effect.fail(error)

      return Random.next.pipe(
        Effect.map((random) =>
          Math.round(
            error.retryAfterMilliseconds ??
              policy.baseDelayMilliseconds * 2 ** (attempt - 1) * (0.5 + random),
          ),
        ),
        Effect.flatMap((delay) => Effect.sleep(`${delay} millis`)),
        Effect.andThen(
          startWorkflowWithResilience(starter, event, policy, attempt + 1),
        ),
      )
    }),
  )

/** The transport parses first; this consumer accepts only a trusted event. */
export const processAccountProfileUpdatedMessage = (
  event: AccountProfileUpdatedEvent,
) =>
  Effect.gen(function* () {
    const store = yield* ProcessedQueueEventStore
    const key = { consumerName, eventId: event.eventId }
    const claim = yield* store.claim(key).pipe(
      Effect.mapError(
        (cause) =>
          new QueueConsumerError({
            cause,
            retryAfterMilliseconds: null,
            retryable: true,
          }),
      ),
    )

    if (claim.status === 'completed') return { status: 'completed' as const }
    if (claim.status === 'in-progress') {
      return yield* new QueueMessageInProgressError({
        consumerName,
        eventId: event.eventId,
      })
    }

    const lease = { ...key, claimId: claim.claimId }

    const workflow = yield* AccountProfileUpdateWorkflow
    const run = yield* workflow.start(event).pipe(
      Effect.tapError(() => store.release(lease)),
      Effect.mapError((cause) =>
        cause instanceof QueueConsumerError
          ? cause
          : new QueueConsumerError({
              cause,
              retryAfterMilliseconds: null,
              retryable: true,
            }),
      ),
    )

    yield* store.complete(lease).pipe(
      Effect.mapError(
        (cause) =>
          new QueueConsumerError({
            cause,
            retryAfterMilliseconds: null,
            retryable: true,
          }),
      ),
    )

    return { status: 'started' as const, runId: run.runId }
  })
