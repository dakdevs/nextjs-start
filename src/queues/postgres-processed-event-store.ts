import 'server-only'

import { and, eq, sql } from 'drizzle-orm'
import { Effect } from 'effect'

import { db } from '~/db/client'
import { EventStoreError, ProcessedQueueEventStore } from '~/queues/idempotency'
import { processedQueueEvents } from '~/queues/schema'

/** Keep the application lease equal to the Queue callback visibility lease. */
export const processedQueueEventLeaseSeconds = 300

const matchesKey = (key: { consumerName: string; eventId: string }) =>
  and(
    eq(processedQueueEvents.consumerName, key.consumerName),
    eq(processedQueueEvents.eventId, key.eventId),
  )

/**
 * The composite key scopes deduplication to a consumer. A claim ID fences stale
 * workers after a crash lease is reclaimed.
 */
export const postgresProcessedQueueEventStore = ProcessedQueueEventStore.of({
  claim: (key) =>
    Effect.tryPromise({
      try: () =>
        db.transaction((transaction) =>
          transaction
            .insert(processedQueueEvents)
            .values({ ...key, status: 'processing' })
            .onConflictDoUpdate({
              target: [processedQueueEvents.consumerName, processedQueueEvents.eventId],
              set: {
                claimId: sql`gen_random_uuid()`,
                claimedAt: sql`now()`,
                status: 'processing',
              },
              setWhere: sql`${processedQueueEvents.status} = 'failed' or (${processedQueueEvents.status} = 'processing' and ${processedQueueEvents.claimedAt} < now() - make_interval(secs => ${processedQueueEventLeaseSeconds}))`,
            })
            .returning({ claimId: processedQueueEvents.claimId })
            .then((claimed) => {
              const [lease] = claimed
              if (lease !== undefined) {
                return { claimId: lease.claimId, status: 'claimed' as const }
              }

              return transaction
                .select({ status: processedQueueEvents.status })
                .from(processedQueueEvents)
                .where(matchesKey(key))
                .then(([existing]) =>
                  existing?.status === 'completed'
                    ? { status: 'completed' as const }
                    : { status: 'in-progress' as const },
                )
            }),
        ),
      catch: (cause) => new EventStoreError({ cause, operation: 'claim' }),
    }),
  complete: (lease) =>
    Effect.tryPromise({
      try: () =>
        db
          .update(processedQueueEvents)
          .set({ completedAt: sql`now()`, status: 'completed' })
          .where(
            and(
              matchesKey(lease),
              eq(processedQueueEvents.claimId, lease.claimId),
              eq(processedQueueEvents.status, 'processing'),
            ),
          ),
      catch: (cause) => new EventStoreError({ cause, operation: 'complete' }),
    }).pipe(Effect.asVoid),
  release: (lease) =>
    Effect.tryPromise({
      try: () =>
        db
          .update(processedQueueEvents)
          .set({ status: 'failed' })
          .where(
            and(
              matchesKey(lease),
              eq(processedQueueEvents.claimId, lease.claimId),
              eq(processedQueueEvents.status, 'processing'),
            ),
          ),
      catch: (cause) => new EventStoreError({ cause, operation: 'release' }),
    }).pipe(Effect.asVoid),
})
