import { ORPCError } from '@orpc/server'
import { Effect } from 'effect'

import {
  createServiceAccountForAdminServiceAccounts,
  getAdminHomeSummaryForAdminHome,
  getDataCatalogForAdminDataCatalog,
  listAdminActivityForAdminActivityScreen,
  listAccountProfilesForAdminDataCatalog,
  listFailedQueueEventsForAdminDataCatalog,
  listWorkflowReceiptsForAdminDataCatalog,
  listServiceAccountsForAdminServiceAccounts,
  listUsersForAdminUserSupport,
  requestPasswordResetForAdminUserSupport,
  revokeServiceAccountForAdminServiceAccounts,
  rotateServiceAccountForAdminServiceAccounts,
} from '~/domains/admin/server/admin-service'
import { ServiceAccountNotFoundError } from '~/domains/admin/server/service-account-errors'
import { runAppEffect } from '~/effect/runtime'
import { requireAuthenticatedSession, type makeRpcContext } from '~/orpc/context'

type RpcContext = ReturnType<typeof makeRpcContext>
type AdminPaginatedSearchInput = Parameters<typeof listUsersForAdminUserSupport>[0]

export const handleGetAdminHomeSummaryForAdminHome = () => {
  return runAppEffect(getAdminHomeSummaryForAdminHome)
}

export const handleListUsersForAdminUserSupport = (
  input: AdminPaginatedSearchInput,
) => {
  return runAppEffect(listUsersForAdminUserSupport(input))
}

export const handleRequestPasswordResetForAdminUserSupport = ({
  context,
  input,
}: {
  readonly context: RpcContext
  readonly input: { readonly userId: string }
}) => {
  return runAppEffect(
    requestPasswordResetForAdminUserSupport({
      actorUserId: requireAuthenticatedSession(context).user.id,
      correlationId: context.requestId,
      userId: input.userId,
    }).pipe(
      // A support workflow can say the selected person no longer exists.
      // Infrastructure failures remain at the common unexpected-error boundary.
      Effect.catchTag('AdminUserNotFoundError', () => {
        return Effect.sync(() => {
          throw new ORPCError('NOT_FOUND')
        })
      }),
    ),
  )
}

export const handleListServiceAccountsForAdminServiceAccounts = () => {
  return runAppEffect(listServiceAccountsForAdminServiceAccounts)
}

export const handleCreateServiceAccountForAdminServiceAccounts = ({
  context,
  input,
}: {
  readonly context: RpcContext
  readonly input: {
    readonly name: string
    readonly scopes: readonly 'system:health:read'[]
  }
}) => {
  return runAppEffect(
    createServiceAccountForAdminServiceAccounts({
      actorUserId: requireAuthenticatedSession(context).user.id,
      correlationId: context.requestId,
      ...input,
    }),
  )
}

export const handleRotateServiceAccountForAdminServiceAccounts = ({
  context,
  input,
}: {
  readonly context: RpcContext
  readonly input: { readonly serviceAccountId: string }
}) => {
  return runAppEffect(
    rotateServiceAccountForAdminServiceAccounts({
      actorUserId: requireAuthenticatedSession(context).user.id,
      correlationId: context.requestId,
      serviceAccountId: input.serviceAccountId,
    }),
  ).catch((cause: unknown) => {
    if (cause instanceof ServiceAccountNotFoundError) {
      throw new ORPCError('NOT_FOUND')
    }

    throw cause
  })
}

export const handleRevokeServiceAccountForAdminServiceAccounts = ({
  context,
  input,
}: {
  readonly context: RpcContext
  readonly input: { readonly serviceAccountId: string }
}) => {
  return runAppEffect(
    revokeServiceAccountForAdminServiceAccounts({
      actorUserId: requireAuthenticatedSession(context).user.id,
      correlationId: context.requestId,
      serviceAccountId: input.serviceAccountId,
    }),
  ).catch((cause: unknown) => {
    if (cause instanceof ServiceAccountNotFoundError) {
      throw new ORPCError('NOT_FOUND')
    }

    throw cause
  })
}

export const handleGetDataCatalogForAdminDataCatalog = () => {
  return runAppEffect(getDataCatalogForAdminDataCatalog)
}
export const handleListAccountProfilesForAdminDataCatalog = () => {
  return runAppEffect(listAccountProfilesForAdminDataCatalog)
}
export const handleListFailedQueueEventsForAdminDataCatalog = () => {
  return runAppEffect(listFailedQueueEventsForAdminDataCatalog)
}
export const handleListWorkflowReceiptsForAdminDataCatalog = () => {
  return runAppEffect(listWorkflowReceiptsForAdminDataCatalog)
}

export const handleListAdminActivityForAdminActivityScreen = (
  input: AdminPaginatedSearchInput,
) => {
  return runAppEffect(listAdminActivityForAdminActivityScreen(input))
}
