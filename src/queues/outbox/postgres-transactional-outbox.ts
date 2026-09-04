import 'server-only'

import { asc, eq, isNull, sql } from 'drizzle-orm'
import { DateTime, Effect, Option } from 'effect'

import { db } from '~/db/client'
import { accountProfileUpdatedEventSchema } from '~/queues/account-profile-updated'
import {
  OutboxError,
  TransactionalOutbox,
  publishNextOutboxMessage,
} from '~/queues/outbox/service'
import { transactionalOutboxMessages } from '~/queues/outbox/schema'
import { QueueTransport } from '~/queues/queue-publisher'

type DatabaseTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

/** Bind this adapter to the same transaction that owns the feature mutation. */
export const makePostgresTransactionalOutbox = (transaction: DatabaseTransaction) =>
  TransactionalOutbox.of({
    stageAccountProfileUpdated: (event) =>
      Effect.tryPromise({
        try: () =>
          transaction.insert(transactionalOutboxMessages).values({
            eventId: event.eventId,
            id: event.eventId,
            occurredAt: DateTime.toDateUtc(DateTime.makeUnsafe(event.occurredAt)),
            payload: event,
            topic: 'account-profile-updated',
          }),
        catch: (cause) => new OutboxError({ cause }),
      }).pipe(Effect.asVoid),
    claimNext: Effect.tryPromise({
      try: () =>
        transaction
          .select({ payload: transactionalOutboxMessages.payload })
          .from(transactionalOutboxMessages)
          .where(isNull(transactionalOutboxMessages.publishedAt))
          .orderBy(asc(transactionalOutboxMessages.occurredAt))
          .limit(1)
          .for('update', { skipLocked: true }),
      catch: (cause) => new OutboxError({ cause }),
    }).pipe(
      Effect.flatMap(([message]) =>
        message === undefined
          ? Effect.succeed(Option.none())
          : Effect.try({
              try: () =>
                Option.some(accountProfileUpdatedEventSchema.parse(message.payload)),
              catch: (cause) => new OutboxError({ cause }),
            }),
      ),
    ),
    markPublished: (eventId) =>
      Effect.tryPromise({
        try: () =>
          transaction
            .update(transactionalOutboxMessages)
            .set({ isPublished: true, publishedAt: sql`now()` })
            .where(eq(transactionalOutboxMessages.eventId, eventId)),
        catch: (cause) => new OutboxError({ cause }),
      }).pipe(Effect.asVoid),
  })

/** Run from a scheduled worker only for domains that opted into the outbox. */
export const publishNextPostgresOutboxMessage = Effect.gen(function* () {
  const context = yield* Effect.context<QueueTransport>()

  return yield* Effect.tryPromise({
    try: () =>
      db.transaction((transaction) =>
        Effect.runPromiseWith(context)(
          publishNextOutboxMessage.pipe(
            Effect.provideService(
              TransactionalOutbox,
              makePostgresTransactionalOutbox(transaction),
            ),
          ),
        ),
      ),
    catch: (cause) => new OutboxError({ cause }),
  })
})
