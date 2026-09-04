import { RPCHandler } from '@orpc/server/fetch'

import { getCurrentSession } from '~/auth/session'
import { env } from '~/config/env'
import { makeRpcContext } from '~/orpc/context'
import { router } from '~/orpc/router'
import { unexpectedRpcErrorInterceptor } from '~/orpc/unexpected-error-interceptor'

const createHandler = (requestId: string) =>
  new RPCHandler(router, {
    interceptors: [unexpectedRpcErrorInterceptor(requestId)],
  })

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (origin !== null && origin !== env.NEXT_PUBLIC_APP_URL)
    return new Response('Forbidden', { status: 403 })
  if (request.headers.get('content-type')?.includes('application/json') !== true) {
    return new Response('Unsupported Media Type', { status: 415 })
  }

  const requestId = crypto.randomUUID()
  const handler = createHandler(requestId)
  const result = await handler.handle(request, {
    prefix: '/rpc',
    context: makeRpcContext({ requestId, session: await getCurrentSession() }),
  })
  return result.response ?? new Response('Not found', { status: 404 })
}
