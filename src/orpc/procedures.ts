import { ORPCError, os } from '@orpc/server'

import { makeRpcContext } from '~/orpc/context'

type RpcContext = ReturnType<typeof makeRpcContext>

/** Attach this middleware to every operation that requires a signed-in user. */
export const authenticatedMiddleware = os
  .$context<RpcContext>()
  .middleware(({ context, next }) => {
    if (context.session === null) throw new ORPCError('UNAUTHORIZED')
    return next({ context })
  })
