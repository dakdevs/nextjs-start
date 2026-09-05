import { Effect } from 'effect'

import { authenticateServiceAccountForSystemHealth } from '~/domains/admin/server/admin-repository'
import { runAppEffect } from '~/effect/runtime'
import { logUnexpectedError } from '~/observability/logger'

const bearerToken = (request: Request) => {
  const authorization = request.headers.get('authorization')
  if (authorization === null || !authorization.startsWith('Bearer ')) return null
  const token = authorization.slice('Bearer '.length).trim()
  return token === '' ? null : token
}

/** Narrow machine endpoint. Credentials can only prove the health-read scope. */
export async function GET(request: Request) {
  const requestId = crypto.randomUUID()
  const token = bearerToken(request)
  if (token === null) return new Response('Unauthorized', { status: 401 })

  try {
    const authenticated = await runAppEffect(
      authenticateServiceAccountForSystemHealth(token).pipe(
        Effect.as(true),
        Effect.catchTag('ServiceAccountUnauthorizedError', () => Effect.succeed(false)),
      ),
    )
    if (!authenticated) return new Response('Unauthorized', { status: 401 })
    return Response.json({ status: 'ok' })
  } catch (cause) {
    const errorId = crypto.randomUUID()
    await runAppEffect(
      logUnexpectedError({
        cause,
        errorId,
        operation: 'service.health.authenticate',
        requestId,
      }),
    )
    return Response.json({ errorId, message: 'Something went wrong' }, { status: 500 })
  }
}
