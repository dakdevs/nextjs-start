import { ORPCError } from '@orpc/server'

import { runAppEffect } from '~/effect/runtime'
import { logUnexpectedError } from '~/observability/logger'

export class UnexpectedRpcError extends ORPCError<
  'INTERNAL_SERVER_ERROR',
  { errorId: string }
> {}

/** Gives HTTP and direct server callers the same safe, searchable failure boundary. */
export const unexpectedRpcErrorInterceptor =
  (requestId: string) =>
  async <Result>(options: { next: () => Promise<Result> }) => {
    try {
      return await options.next()
    } catch (cause) {
      if (cause instanceof ORPCError) throw cause

      const errorId = crypto.randomUUID()
      await runAppEffect(
        logUnexpectedError({ cause, errorId, operation: 'rpc', requestId }),
      )
      throw new UnexpectedRpcError('INTERNAL_SERVER_ERROR', { data: { errorId } })
    }
  }
