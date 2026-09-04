import { DateTime, Effect } from 'effect'

import {
  getAccountProfileForAccountScreenFromDatabase,
  updateAccountProfileForAccountScreenInDatabase,
} from '~/domains/account/server/account-profile-repository'
import { publishAccountProfileUpdated } from '~/queues/queue-publisher'

type AccountProfileUpdate = Parameters<
  typeof updateAccountProfileForAccountScreenInDatabase
>[0] & {
  readonly correlationId: string
  readonly eventId: string
}

export const getAccountProfileForAccountScreen = (accountId: string) =>
  getAccountProfileForAccountScreenFromDatabase(accountId)

export const updateAccountProfileForAccountScreen = (input: AccountProfileUpdate) =>
  Effect.gen(function* () {
    const updated = yield* updateAccountProfileForAccountScreenInDatabase(input)
    const occurredAt = yield* DateTime.nowAsDate
    yield* publishAccountProfileUpdated({
      eventId: input.eventId,
      type: 'account.profile-updated',
      schemaVersion: 1,
      occurredAt: occurredAt.toISOString(),
      correlationId: input.correlationId,
      subjectId: input.accountId,
    }).pipe(
      Effect.catchTag('QueuePublishError', (failure) =>
        Effect.logError('Non-critical profile update event was not published').pipe(
          Effect.annotateLogs({
            attempt: failure.attempt,
            causeName: failure.causeName,
            correlationId: input.correlationId,
            eventId: input.eventId,
            operation: 'account-profile-updated.publish',
            providerStatus: failure.providerStatus ?? 'unavailable',
            retryable: failure.retryable,
          }),
        ),
      ),
    )

    return updated
  })
