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

export const handleGetAdminHomeSummaryForAdminHome = () =>
  runAppEffect(getAdminHomeSummaryForAdminHome)

export const handleListUsersForAdminUserSupport = (input: AdminPaginatedSearchInput) =>
  runAppEffect(listUsersForAdminUserSupport(input))

export const handleRequestPasswordResetForAdminUserSupport = ({
  context,
  input,
}: {
  readonly context: RpcContext
  readonly input: { readonly userId: string }
}) =>
  runAppEffect(
    requestPasswordResetForAdminUserSupport({
      actorUserId: requireAuthenticatedSession(context).user.id,
      correlationId: context.requestId,
      userId: input.userId,
    }).pipe(
      // A support workflow can say the selected person no longer exists.
      // Infrastructure failures remain at the common unexpected-error boundary.
      Effect.catchTag('AdminUserNotFoundError', () =>
        Effect.sync(() => {
          throw new ORPCError('NOT_FOUND')
        }),
      ),
    ),
  )

export const handleListServiceAccountsForAdminServiceAccounts = () =>
  runAppEffect(listServiceAccountsForAdminServiceAccounts)

export const handleCreateServiceAccountForAdminServiceAccounts = ({
  context,
  input,
}: {
  readonly context: RpcContext
  readonly input: {
    readonly name: string
    readonly scopes: readonly 'system:health:read'[]
  }
}) =>
  runAppEffect(
    createServiceAccountForAdminServiceAccounts({
      actorUserId: requireAuthenticatedSession(context).user.id,
      correlationId: context.requestId,
      ...input,
    }),
  )

export const handleRotateServiceAccountForAdminServiceAccounts = ({
  context,
  input,
}: {
  readonly context: RpcContext
  readonly input: { readonly serviceAccountId: string }
}) =>
  runAppEffect(
    rotateServiceAccountForAdminServiceAccounts({
      actorUserId: requireAuthenticatedSession(context).user.id,
      correlationId: context.requestId,
      serviceAccountId: input.serviceAccountId,
    }),
  ).catch((cause: unknown) => {
    if (cause instanceof ServiceAccountNotFoundError) throw new ORPCError('NOT_FOUND')
    throw cause
  })

export const handleRevokeServiceAccountForAdminServiceAccounts = ({
  context,
  input,
}: {
  readonly context: RpcContext
  readonly input: { readonly serviceAccountId: string }
}) =>
  runAppEffect(
    revokeServiceAccountForAdminServiceAccounts({
      actorUserId: requireAuthenticatedSession(context).user.id,
      correlationId: context.requestId,
      serviceAccountId: input.serviceAccountId,
    }),
  ).catch((cause: unknown) => {
    if (cause instanceof ServiceAccountNotFoundError) throw new ORPCError('NOT_FOUND')
    throw cause
  })

export const handleGetDataCatalogForAdminDataCatalog = () =>
  runAppEffect(getDataCatalogForAdminDataCatalog)
export const handleListAccountProfilesForAdminDataCatalog = () =>
  runAppEffect(listAccountProfilesForAdminDataCatalog)
export const handleListFailedQueueEventsForAdminDataCatalog = () =>
  runAppEffect(listFailedQueueEventsForAdminDataCatalog)
export const handleListWorkflowReceiptsForAdminDataCatalog = () =>
  runAppEffect(listWorkflowReceiptsForAdminDataCatalog)

export const handleListAdminActivityForAdminActivityScreen = (
  input: AdminPaginatedSearchInput,
) => runAppEffect(listAdminActivityForAdminActivityScreen(input))
