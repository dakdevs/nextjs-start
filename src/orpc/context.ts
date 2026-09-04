import type { getCurrentSession } from '~/auth/session'

export const makeRpcContext = (input: {
  requestId: string
  session: Awaited<ReturnType<typeof getCurrentSession>>
}) => input

export const requireAuthenticatedSession = (
  context: ReturnType<typeof makeRpcContext>,
) => {
  if (context.session === null) throw new Error('Unauthenticated RPC context')
  return context.session
}
