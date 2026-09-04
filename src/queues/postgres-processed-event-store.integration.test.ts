import { and, eq, sql } from 'drizzle-orm'
import { Effect } from 'effect'
import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '~/db/client'
import {
  postgresProcessedQueueEventStore,
  processedQueueEventLeaseSeconds,
} from '~/queues/postgres-processed-event-store'
import { processedQueueEvents } from '~/queues/schema'

const key = {
  consumerName: 'concurrency-test',
  eventId: '13bd562a-b842-4c4b-9a19-51a29f238451',
}

type ClaimResult = Effect.Success<
  ReturnType<typeof postgresProcessedQueueEventStore.claim>
>

const requireClaimedLease = (claim: ClaimResult | undefined) => {
  if (claim?.status !== 'claimed') throw new Error('Expected a claimed lease')
  return claim
}

describe('PostgreSQL processed queue event store', () => {
  beforeEach(async () => {
    await db.delete(processedQueueEvents)
  })

  it('grants one concurrent claim and reports every live competing lease', async () => {
    const claims = await Promise.all(
      Array.from({ length: 6 }, () =>
        Effect.runPromise(postgresProcessedQueueEventStore.claim(key)),
      ),
    )
    const claimed = claims.filter((claim) => claim.status === 'claimed')

    expect(claimed).toHaveLength(1)
    expect(claims.filter((claim) => claim.status === 'in-progress')).toHaveLength(5)

    const lease = requireClaimedLease(claimed[0])
    await Effect.runPromise(
      postgresProcessedQueueEventStore.complete({ ...key, claimId: lease.claimId }),
    )
    await expect(
      Effect.runPromise(postgresProcessedQueueEventStore.claim(key)),
    ).resolves.toEqual({ status: 'completed' })
  })

  it('reclaims a crashed lease after 300 seconds and fences the stale worker', async () => {
    const first = requireClaimedLease(
      await Effect.runPromise(postgresProcessedQueueEventStore.claim(key)),
    )

    await db
      .update(processedQueueEvents)
      .set({
        claimedAt: sql`now() - make_interval(secs => ${processedQueueEventLeaseSeconds + 1})`,
      })
      .where(
        and(
          eq(processedQueueEvents.consumerName, key.consumerName),
          eq(processedQueueEvents.eventId, key.eventId),
        ),
      )

    const replacement = requireClaimedLease(
      await Effect.runPromise(postgresProcessedQueueEventStore.claim(key)),
    )
    expect(replacement.claimId).not.toBe(first.claimId)

    await Effect.runPromise(
      postgresProcessedQueueEventStore.complete({ ...key, claimId: first.claimId }),
    )
    await expect(
      Effect.runPromise(postgresProcessedQueueEventStore.claim(key)),
    ).resolves.toEqual({ status: 'in-progress' })

    await Effect.runPromise(
      postgresProcessedQueueEventStore.complete({
        ...key,
        claimId: replacement.claimId,
      }),
    )
    await expect(
      Effect.runPromise(postgresProcessedQueueEventStore.claim(key)),
    ).resolves.toEqual({ status: 'completed' })
  })
})
