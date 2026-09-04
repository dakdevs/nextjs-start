import { ORPCError } from '@orpc/server'
import type { z } from 'zod'

import { updateAccountProfileForAccountScreenInputSchema } from '~/domains/account/contracts/update-account-profile-for-account-screen'
import { updateAccountProfileForAccountScreen } from '~/domains/account/server/account-profile-service'
import { makeRpcContext, requireAuthenticatedSession } from '~/orpc/context'
import { runQueueEffect } from '~/queues/runtime'

type RpcContext = ReturnType<typeof makeRpcContext>
type UpdateAccountProfileForAccountScreenInput = z.infer<
  typeof updateAccountProfileForAccountScreenInputSchema
>

/** The one-purpose account-screen mutation handler. */
export const handleUpdateAccountProfileForAccountScreen = (request: {
  context: RpcContext
  input: UpdateAccountProfileForAccountScreenInput
}) => {
  if (request.context.session === null) throw new ORPCError('UNAUTHORIZED')
  return runQueueEffect(
    updateAccountProfileForAccountScreen({
      accountId: requireAuthenticatedSession(request.context).user.id,
      correlationId: request.context.requestId,
      eventId: request.context.requestId,
      ...request.input,
    }),
  )
}
