import { Context, Data, Effect, Option } from 'effect'
import { z } from 'zod'

import { accountProfileUpdatedEventSchema } from '~/queues/account-profile-updated'
import { publishAccountProfileUpdated } from '~/queues/queue-publisher'

type AccountProfileUpdatedEvent = z.infer<typeof accountProfileUpdatedEventSchema>

export const OutboxError = Data.TaggedError('OutboxError')<{
  readonly cause: unknown
}>

type OutboxFailure = InstanceType<typeof OutboxError>

export class TransactionalOutbox extends Context.Service<
  TransactionalOutbox,
  {
    /** Run through an adapter bound to the feature's existing transaction. */
    readonly stageAccountProfileUpdated: (
      event: AccountProfileUpdatedEvent,
    ) => Effect.Effect<void, OutboxFailure>
    readonly claimNext: Effect.Effect<
      Option.Option<AccountProfileUpdatedEvent>,
      OutboxFailure
    >
    readonly markPublished: (eventId: string) => Effect.Effect<void, OutboxFailure>
  }
>()('nextjs-start/queues/outbox/service/TransactionalOutbox') {}

export const stageAccountProfileUpdatedInOutbox = (event: AccountProfileUpdatedEvent) =>
  Effect.gen(function* () {
    const outbox = yield* TransactionalOutbox
    yield* outbox.stageAccountProfileUpdated(event)
  })

/** Publish then mark: a failed send leaves the claimed message retryable. */
export const publishNextOutboxMessage = Effect.gen(function* () {
  const outbox = yield* TransactionalOutbox
  const claimed = yield* outbox.claimNext
  if (Option.isNone(claimed)) return { status: 'empty' as const }

  const event = claimed.value
  yield* publishAccountProfileUpdated(event)
  yield* outbox.markPublished(event.eventId)
  return { status: 'published' as const, eventId: event.eventId }
})
