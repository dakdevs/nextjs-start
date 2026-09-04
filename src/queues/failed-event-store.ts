import 'server-only'

import { Context, Data, Effect } from 'effect'

type FailedQueueEvent = Readonly<{
  consumerName: string
  correlationId: string | null
  deliveryCount: number
  eventId: string | null
  failureCode: string
  messageId: string
}>

const FailedQueueEventStoreError = Data.TaggedError('FailedQueueEventStoreError')<{
  readonly cause: unknown
}>

type FailedQueueEventStoreFailure = InstanceType<typeof FailedQueueEventStoreError>

export class FailedQueueEventStore extends Context.Service<
  FailedQueueEventStore,
  {
    readonly record: (
      failedEvent: FailedQueueEvent,
    ) => Effect.Effect<void, FailedQueueEventStoreFailure>
  }
>()('nextjs-start/queues/failed-event-store/FailedQueueEventStore') {}

export const makeInMemoryFailedQueueEventStore = (records: Array<FailedQueueEvent>) =>
  FailedQueueEventStore.of({
    record: (failedEvent) =>
      Effect.sync(() => {
        records.push(failedEvent)
      }),
  })

export { FailedQueueEventStoreError }
