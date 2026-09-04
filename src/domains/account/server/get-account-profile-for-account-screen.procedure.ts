import { ORPCError } from '@orpc/server'

import { getAccountProfileForAccountScreen } from '~/domains/account/server/account-profile-service'
import { runAppEffect } from '~/effect/runtime'
import { makeRpcContext, requireAuthenticatedSession } from '~/orpc/context'

type RpcContext = ReturnType<typeof makeRpcContext>

/** The one-purpose account-screen read handler. */
export const handleGetAccountProfileForAccountScreen = (context: RpcContext) => {
  if (context.session === null) throw new ORPCError('UNAUTHORIZED')
  return runAppEffect(
    getAccountProfileForAccountScreen(requireAuthenticatedSession(context).user.id),
  )
}
