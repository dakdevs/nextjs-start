import { Context, Data, Effect } from 'effect'

export const EventStoreError = Data.TaggedError('EventStoreError')<{
  readonly cause: unknown
  readonly operation: 'claim' | 'complete' | 'release'
}>

type EventStoreFailure = InstanceType<typeof EventStoreError>

type QueueEventKey = Readonly<{
  consumerName: string
  eventId: string
}>

type QueueEventLease = QueueEventKey &
  Readonly<{
    claimId: string
  }>

type ProcessedQueueEventClaim =
  | Readonly<{ claimId: string; status: 'claimed' }>
  | Readonly<{ status: 'completed' }>
  | Readonly<{ status: 'in-progress' }>

export class ProcessedQueueEventStore extends Context.Service<
  ProcessedQueueEventStore,
  {
    readonly claim: (
      key: QueueEventKey,
    ) => Effect.Effect<ProcessedQueueEventClaim, EventStoreFailure>
    readonly complete: (
      lease: QueueEventLease,
    ) => Effect.Effect<void, EventStoreFailure>
    readonly release: (lease: QueueEventLease) => Effect.Effect<void, EventStoreFailure>
  }
>()('nextjs-start/queues/idempotency/ProcessedQueueEventStore') {}

export const makeInMemoryProcessedQueueEventStore = () => {
  let nextClaimId = 0
  const states = new Map<
    string,
    Readonly<{ claimId: string; status: 'completed' | 'processing' }>
  >()
  const compositeKey = (key: QueueEventKey) => `${key.consumerName}:${key.eventId}`

  return ProcessedQueueEventStore.of({
    claim: (key) =>
      Effect.sync(() => {
        const storedKey = compositeKey(key)
        const existing = states.get(storedKey)
        if (existing?.status === 'completed') return { status: 'completed' as const }
        if (existing?.status === 'processing') {
          return { status: 'in-progress' as const }
        }

        nextClaimId += 1
        const claimId = `in-memory-claim-${nextClaimId}`
        states.set(storedKey, { claimId, status: 'processing' })
        return { claimId, status: 'claimed' as const }
      }),
    complete: (lease) =>
      Effect.sync(() => {
        const storedKey = compositeKey(lease)
        const existing = states.get(storedKey)
        if (existing?.claimId !== lease.claimId) return
        states.set(storedKey, { claimId: lease.claimId, status: 'completed' })
      }),
    release: (lease) =>
      Effect.sync(() => {
        const storedKey = compositeKey(lease)
        if (states.get(storedKey)?.claimId === lease.claimId) states.delete(storedKey)
      }),
  })
}
