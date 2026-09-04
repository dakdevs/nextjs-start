import 'server-only'

import { createRouterClient } from '@orpc/server'

import { getCurrentSession } from '~/auth/session'
import { makeRpcContext } from '~/orpc/context'
import { router } from '~/orpc/router'
import { unexpectedRpcErrorInterceptor } from '~/orpc/unexpected-error-interceptor'

/** Direct server caller for React Server Components; it bypasses HTTP but not contracts. */
export const createServerRpcClient = async () => {
  const requestId = crypto.randomUUID()
  return createRouterClient(router, {
    context: makeRpcContext({
      requestId,
      session: await getCurrentSession(),
    }),
    interceptors: [unexpectedRpcErrorInterceptor(requestId)],
  })
}
