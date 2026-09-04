import 'server-only'

import {
  InternalServerError,
  TooManyRequestsError,
  type SendResult,
} from '@vercel/queue'
import { Context, Data, Effect, Random } from 'effect'
import { z } from 'zod'

import {
  accountProfileUpdatedEventSchema,
  accountProfileUpdatedTopic,
} from '~/queues/account-profile-updated'

type AccountProfileUpdatedEvent = z.infer<typeof accountProfileUpdatedEventSchema>

type QueueTransportService = Readonly<{
  send: (
    topic: string,
    payload: AccountProfileUpdatedEvent,
    options: { readonly idempotencyKey: string },
  ) => Promise<SendResult>
}>

const QueuePublishError = Data.TaggedError('QueuePublishError')<{
  readonly attempt: number
  readonly cause: unknown
  readonly causeName: string
  readonly operation: 'account-profile-updated'
  readonly providerStatus: number | null
  readonly retryAfterMilliseconds: number | null
  readonly retryable: boolean
}>

export class QueueTransport extends Context.Service<
  QueueTransport,
  QueueTransportService
>()('nextjs-start/queues/queue-publisher/QueueTransport') {}

const sendAccountProfileUpdatedOnce = (
  transport: QueueTransportService,
  event: AccountProfileUpdatedEvent,
  attempt: number,
) =>
  Effect.tryPromise({
    // The Vercel Queue SDK does not accept an AbortSignal. The Effect deadline
    // bounds this caller only; event-id deduplication makes late acceptance safe.
    try: () =>
      transport.send(accountProfileUpdatedTopic, event, {
        idempotencyKey: event.eventId,
      }),
    catch: (cause) =>
      new QueuePublishError({
        attempt,
        cause,
        causeName: cause instanceof Error ? cause.name : 'UnknownFailure',
        operation: 'account-profile-updated',
        providerStatus:
          cause instanceof TooManyRequestsError
            ? 429
            : cause instanceof InternalServerError
              ? 500
              : null,
        retryAfterMilliseconds:
          cause instanceof TooManyRequestsError && cause.retryAfter !== undefined
            ? cause.retryAfter * 1_000
            : null,
        retryable:
          cause instanceof TooManyRequestsError ||
          cause instanceof InternalServerError ||
          cause instanceof TypeError,
      }),
  }).pipe(
    Effect.timeout('5 seconds'),
    Effect.mapError((error) =>
      error._tag === 'TimeoutError'
        ? new QueuePublishError({
            attempt,
            cause: error,
            causeName: error._tag,
            operation: 'account-profile-updated',
            providerStatus: null,
            retryAfterMilliseconds: null,
            retryable: true,
          })
        : error,
    ),
  )

const sendAccountProfileUpdatedWithResilience = (
  transport: QueueTransportService,
  event: AccountProfileUpdatedEvent,
  attempt = 1,
): Effect.Effect<SendResult, InstanceType<typeof QueuePublishError>> =>
  sendAccountProfileUpdatedOnce(transport, event, attempt).pipe(
    Effect.catchTag('QueuePublishError', (error) => {
      if (!error.retryable || attempt >= 3) return Effect.fail(error)

      return Random.next.pipe(
        Effect.map((random) =>
          Math.round(
            error.retryAfterMilliseconds ?? 250 * 2 ** (attempt - 1) * (0.5 + random),
          ),
        ),
        Effect.flatMap((delay) => Effect.sleep(`${delay} millis`)),
        Effect.andThen(
          sendAccountProfileUpdatedWithResilience(transport, event, attempt + 1),
        ),
      )
    }),
  )

export const publishAccountProfileUpdated = (event: AccountProfileUpdatedEvent) =>
  Effect.gen(function* () {
    const transport = yield* QueueTransport
    return yield* sendAccountProfileUpdatedWithResilience(transport, event)
  })
