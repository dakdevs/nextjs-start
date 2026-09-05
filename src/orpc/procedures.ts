import { ORPCError, os } from '@orpc/server'

import { makeRpcContext } from '~/orpc/context'
import { accountRole } from '~/auth/roles'

type RpcContext = ReturnType<typeof makeRpcContext>

/** Attach this middleware to every operation that requires a signed-in user. */
export const authenticatedMiddleware = os
  .$context<RpcContext>()
  .middleware(({ context, next }) => {
    if (context.session === null) throw new ORPCError('UNAUTHORIZED')
    return next({ context })
  })

/** Requires a fresh, application-owned administrator role. */
export const adminMiddleware = os
  .$context<RpcContext>()
  .middleware(({ context, next }) => {
    if (context.session === null) throw new ORPCError('UNAUTHORIZED')
    if (context.session.user.role !== accountRole.admin)
      throw new ORPCError('FORBIDDEN')
    return next({ context })
  })
