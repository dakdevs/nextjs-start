import { Effect } from 'effect'

export const logUnexpectedError = (input: {
  cause: unknown
  errorId: string
  operation: string
  requestId: string
}) =>
  Effect.logError('Unexpected application error', input.cause).pipe(
    Effect.annotateLogs({
      causeName: input.cause instanceof Error ? input.cause.name : 'UnknownFailure',
      errorId: input.errorId,
      event: 'error.unexpected',
      operation: input.operation,
      requestId: input.requestId,
    }),
  )
