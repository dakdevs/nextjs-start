import 'server-only'

import { sql } from 'drizzle-orm'
import { Effect } from 'effect'

import { db } from '~/db/client'
import {
  FailedQueueEventStore,
  FailedQueueEventStoreError,
} from '~/queues/failed-event-store'
import { failedQueueEvents } from '~/queues/schema'

/** Durable, sanitized terminal-failure storage for queues without a native DLQ. */
export const postgresFailedQueueEventStore = FailedQueueEventStore.of({
  record: (failedEvent) =>
    Effect.tryPromise({
      try: () =>
        db
          .insert(failedQueueEvents)
          .values(failedEvent)
          .onConflictDoUpdate({
            target: [failedQueueEvents.consumerName, failedQueueEvents.messageId],
            set: {
              correlationId: failedEvent.correlationId,
              deliveryCount: failedEvent.deliveryCount,
              eventId: failedEvent.eventId,
              failedAt: sql`now()`,
              failureCode: failedEvent.failureCode,
            },
          }),
      catch: (cause) => new FailedQueueEventStoreError({ cause }),
    }).pipe(Effect.asVoid),
})
