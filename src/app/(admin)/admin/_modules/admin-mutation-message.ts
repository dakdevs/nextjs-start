import { isInferableError } from '@orpc/client'
import type { InferClientError } from '@orpc/client'

import { rpcClient } from '~/orpc/client'

type AdminMutationError = InferClientError<
  typeof rpcClient.admin.requestPasswordResetForAdminUserSupport
>

export function adminMutationFailureMessage(error: AdminMutationError): string {
  if (!isInferableError(error)) return 'Something went wrong. Please try again.'
  if (error.code === 'INTERNAL_SERVER_ERROR')
    return `Something went wrong. Error ID: ${error.data.errorId}`
  if (error.code === 'NOT_FOUND')
    return 'That record no longer exists. Refresh and try again.'
  return 'Something went wrong. Please try again.'
}
