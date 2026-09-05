import { Effect } from 'effect'

import { auth } from '~/auth/auth'
import { env } from '~/config/env'
import {
  createServiceAccountForAdminServiceAccountsInDatabase,
  findAdminPasswordResetTarget,
  getAdminHomeSummaryForAdminHomeFromDatabase,
  getDataCatalogForAdminDataCatalogFromDatabase,
  listAdminActivityForAdminActivityScreenFromDatabase,
  listServiceAccountsForAdminServiceAccountsFromDatabase,
  listUsersForAdminUserSupportFromDatabase,
  listAccountProfilesForAdminDataCatalogFromDatabase,
  listFailedQueueEventsForAdminDataCatalogFromDatabase,
  listWorkflowReceiptsForAdminDataCatalogFromDatabase,
  recordAdminPasswordResetRequest,
  revokeServiceAccountForAdminServiceAccountsInDatabase,
  rotateServiceAccountForAdminServiceAccountsInDatabase,
} from '~/domains/admin/server/admin-repository'
import { AdminPasswordResetError } from '~/domains/admin/server/errors'

type AdminPaginatedSearchInput = Parameters<
  typeof listUsersForAdminUserSupportFromDatabase
>[0]

export const getAdminHomeSummaryForAdminHome =
  getAdminHomeSummaryForAdminHomeFromDatabase

export const listUsersForAdminUserSupport = (input: AdminPaginatedSearchInput) =>
  listUsersForAdminUserSupportFromDatabase(input)

/** Delivers through Better Auth only; reset tokens and links never enter this domain. */
export const requestPasswordResetForAdminUserSupport = (input: {
  readonly actorUserId: string
  readonly correlationId: string
  readonly userId: string
}) =>
  Effect.gen(function* () {
    const user = yield* findAdminPasswordResetTarget(input.userId)
    // Record the operator's request before crossing the external delivery
    // boundary. A failed audit write must never result in an unaudited email.
    const audit = yield* recordAdminPasswordResetRequest({
      actorUserId: input.actorUserId,
      correlationId: input.correlationId,
      subjectUserId: input.userId,
    })
    yield* Effect.tryPromise({
      try: () =>
        auth.api.requestPasswordReset({
          body: {
            email: user.email,
            redirectTo: `${env.BETTER_AUTH_URL}/reset-password`,
          },
        }),
      catch: (cause) => new AdminPasswordResetError({ cause }),
    })
    return { audit, requested: true as const }
  })

export const listServiceAccountsForAdminServiceAccounts =
  listServiceAccountsForAdminServiceAccountsFromDatabase

export const createServiceAccountForAdminServiceAccounts =
  createServiceAccountForAdminServiceAccountsInDatabase

export const rotateServiceAccountForAdminServiceAccounts =
  rotateServiceAccountForAdminServiceAccountsInDatabase

export const revokeServiceAccountForAdminServiceAccounts =
  revokeServiceAccountForAdminServiceAccountsInDatabase

export const getDataCatalogForAdminDataCatalog =
  getDataCatalogForAdminDataCatalogFromDatabase
export const listAccountProfilesForAdminDataCatalog =
  listAccountProfilesForAdminDataCatalogFromDatabase
export const listFailedQueueEventsForAdminDataCatalog =
  listFailedQueueEventsForAdminDataCatalogFromDatabase
export const listWorkflowReceiptsForAdminDataCatalog =
  listWorkflowReceiptsForAdminDataCatalogFromDatabase

export const listAdminActivityForAdminActivityScreen = (
  input: AdminPaginatedSearchInput,
) => listAdminActivityForAdminActivityScreenFromDatabase(input)
