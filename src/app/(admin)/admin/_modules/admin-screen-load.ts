import 'server-only'

import { UnexpectedRpcError } from '~/orpc/unexpected-error-interceptor'

type AdminScreenLoad<T> =
  | { readonly status: 'ready'; readonly data: T }
  | { readonly status: 'failed'; readonly errorId: string }

export async function loadAdminScreen<T>(
  load: () => Promise<T>,
): Promise<AdminScreenLoad<T>> {
  try {
    return { status: 'ready', data: await load() }
  } catch (cause) {
    if (cause instanceof UnexpectedRpcError)
      return { status: 'failed', errorId: cause.data.errorId }
    throw cause
  }
}
