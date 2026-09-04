import 'server-only'

import type { MessageMetadata, RetryHandler } from '@vercel/queue'
import { Data, Effect } from 'effect'
import { WorkflowWorldError } from 'workflow/errors'

import { accountProfileUpdatedEventSchema } from '~/queues/account-profile-updated'
import {
  processAccountProfileUpdatedMessage,
  QueueConsumerError,
  QueueMessageInProgressError,
} from '~/queues/account-profile-updated-consumer'
import { FailedQueueEventStore } from '~/queues/failed-event-store'

const consumerName = 'profile-update-audit'
const permanentFailureMaximumDeliveries = 3
const retryableFailureMaximumDeliveries = 12

const retryDirective: RetryHandler = (_error, metadata) => ({
  afterSeconds: Math.min(60, 2 ** metadata.deliveryCount),
})

const InvalidAccountProfileUpdatedMessageError = Data.TaggedError(
  'InvalidAccountProfileUpdatedMessageError',
)<{
  readonly cause: unknown
}>

type QueueDeliveryFailure =
  | InstanceType<typeof InvalidAccountProfileUpdatedMessageError>
  | InstanceType<typeof QueueConsumerError>
  | InstanceType<typeof QueueMessageInProgressError>

type QueueDeliveryMessage = Parameters<
  typeof accountProfileUpdatedEventSchema.safeParse
>[0]

type QueueFailureDiagnostic = Readonly<{
  causeName: string
  providerCode: string
  providerStatus: number | string
  retryable: boolean
}>

const causeName = (cause: unknown) =>
  cause instanceof Error ? cause.name : 'UnknownFailure'

const failureDiagnostic = (failure: QueueDeliveryFailure): QueueFailureDiagnostic => {
  if (failure instanceof QueueConsumerError) {
    const providerFailure = WorkflowWorldError.is(failure.cause) ? failure.cause : null
    return {
      causeName: causeName(failure.cause),
      providerCode: providerFailure?.code ?? 'unavailable',
      providerStatus: providerFailure?.status ?? 'unavailable',
      retryable: failure.retryable,
    }
  }

  return {
    causeName: failure._tag,
    providerCode: 'unavailable',
    providerStatus: 'unavailable',
    retryable: failure instanceof QueueMessageInProgressError,
  }
}

const failureCode = (failure: QueueDeliveryFailure) => {
  if (failure instanceof QueueMessageInProgressError) return failure._tag
  if (failure instanceof QueueConsumerError) return failure._tag
  if (failure instanceof InvalidAccountProfileUpdatedMessageError) return failure._tag
  return 'UnknownQueueConsumerError'
}

const maximumDeliveries = (failure: QueueDeliveryFailure) =>
  failure instanceof QueueMessageInProgressError ||
  (failure instanceof QueueConsumerError && failure.retryable)
    ? retryableFailureMaximumDeliveries
    : permanentFailureMaximumDeliveries

const handleDelivery = (message: QueueDeliveryMessage, metadata: MessageMetadata) => {
  const parsed = accountProfileUpdatedEventSchema.safeParse(message)
  const event = parsed.success ? parsed.data : null
  const processing = Effect.gen(function* () {
    if (!parsed.success) {
      return yield* new InvalidAccountProfileUpdatedMessageError({
        cause: parsed.error,
      })
    }

    return yield* processAccountProfileUpdatedMessage(parsed.data)
  })

  return processing.pipe(
    Effect.catchIf(
      (failure) => metadata.deliveryCount >= maximumDeliveries(failure),
      (failure) =>
        Effect.gen(function* () {
          const store = yield* FailedQueueEventStore
          const code = failureCode(failure)
          const diagnostic = failureDiagnostic(failure)
          yield* store
            .record({
              consumerName,
              correlationId: event?.correlationId ?? null,
              deliveryCount: metadata.deliveryCount,
              eventId: event?.eventId ?? null,
              failureCode: code,
              messageId: metadata.messageId,
            })
            .pipe(
              Effect.mapError(
                (cause) =>
                  new QueueConsumerError({
                    cause,
                    retryAfterMilliseconds: null,
                    retryable: true,
                  }),
              ),
            )
          yield* Effect.logError('Queue event moved to durable quarantine').pipe(
            Effect.annotateLogs({
              consumerName,
              correlationId: event?.correlationId ?? 'unavailable',
              causeName: diagnostic.causeName,
              deliveryCount: metadata.deliveryCount,
              eventId: event?.eventId ?? 'unavailable',
              failureCode: code,
              messageId: metadata.messageId,
              providerCode: diagnostic.providerCode,
              providerStatus: diagnostic.providerStatus,
              retryable: diagnostic.retryable,
            }),
          )

          return { status: 'quarantined' as const }
        }),
    ),
  )
}

export const accountProfileUpdatedQueueHandler = {
  handle: handleDelivery,
  retry: retryDirective,
}
