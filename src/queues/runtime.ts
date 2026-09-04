import { Effect, Layer, Logger, ManagedRuntime } from 'effect'

import { QueueTransport } from '~/queues/queue-publisher'
import { VercelQueueTransportLive } from '~/queues/vercel-queue-transport'

const queueRuntime = ManagedRuntime.make(
  Layer.mergeAll(VercelQueueTransportLive, Logger.layer([Logger.consoleJson])),
)

/** Runs queue-producing Effects without loading queue code into unrelated edges. */
export const runQueueEffect = <Value, Failure>(
  effect: Effect.Effect<Value, Failure, QueueTransport>,
) => queueRuntime.runPromise(effect)
