import 'server-only'

import { implement } from '@orpc/server'

import { handleGetAccountProfileForAccountScreen } from '~/domains/account/server/get-account-profile-for-account-screen.procedure'
import { handleUpdateAccountProfileForAccountScreen } from '~/domains/account/server/update-account-profile-for-account-screen.procedure'
import {
  handleCreateServiceAccountForAdminServiceAccounts,
  handleGetAdminHomeSummaryForAdminHome,
  handleGetDataCatalogForAdminDataCatalog,
  handleListAccountProfilesForAdminDataCatalog,
  handleListFailedQueueEventsForAdminDataCatalog,
  handleListWorkflowReceiptsForAdminDataCatalog,
  handleListAdminActivityForAdminActivityScreen,
  handleListServiceAccountsForAdminServiceAccounts,
  handleListUsersForAdminUserSupport,
  handleRequestPasswordResetForAdminUserSupport,
  handleRevokeServiceAccountForAdminServiceAccounts,
  handleRotateServiceAccountForAdminServiceAccounts,
} from '~/domains/admin/server/admin.procedures'
import { contracts } from '~/orpc/contracts'
import { makeRpcContext } from '~/orpc/context'
import { adminMiddleware, authenticatedMiddleware } from '~/orpc/procedures'

type RpcContext = ReturnType<typeof makeRpcContext>

const implementation = implement(contracts).$context<RpcContext>()

export const router = implementation.router({
  account: {
    getAccountProfileForAccountScreen:
      implementation.account.getAccountProfileForAccountScreen
        .use(authenticatedMiddleware)
        .handler(({ context }) => handleGetAccountProfileForAccountScreen(context)),
    updateAccountProfileForAccountScreen:
      implementation.account.updateAccountProfileForAccountScreen
        .use(authenticatedMiddleware)
        .handler(({ context, input }) =>
          handleUpdateAccountProfileForAccountScreen({ context, input }),
        ),
  },
  admin: {
    getAdminHomeSummaryForAdminHome:
      implementation.admin.getAdminHomeSummaryForAdminHome
        .use(adminMiddleware)
        .handler(() => handleGetAdminHomeSummaryForAdminHome()),
    listUsersForAdminUserSupport: implementation.admin.listUsersForAdminUserSupport
      .use(adminMiddleware)
      .handler(({ input }) => handleListUsersForAdminUserSupport(input)),
    requestPasswordResetForAdminUserSupport:
      implementation.admin.requestPasswordResetForAdminUserSupport
        .use(adminMiddleware)
        .handler(({ context, input }) =>
          handleRequestPasswordResetForAdminUserSupport({ context, input }),
        ),
    listServiceAccountsForAdminServiceAccounts:
      implementation.admin.listServiceAccountsForAdminServiceAccounts
        .use(adminMiddleware)
        .handler(() => handleListServiceAccountsForAdminServiceAccounts()),
    createServiceAccountForAdminServiceAccounts:
      implementation.admin.createServiceAccountForAdminServiceAccounts
        .use(adminMiddleware)
        .handler(({ context, input }) =>
          handleCreateServiceAccountForAdminServiceAccounts({ context, input }),
        ),
    rotateServiceAccountForAdminServiceAccounts:
      implementation.admin.rotateServiceAccountForAdminServiceAccounts
        .use(adminMiddleware)
        .handler(({ context, input }) =>
          handleRotateServiceAccountForAdminServiceAccounts({ context, input }),
        ),
    revokeServiceAccountForAdminServiceAccounts:
      implementation.admin.revokeServiceAccountForAdminServiceAccounts
        .use(adminMiddleware)
        .handler(({ context, input }) =>
          handleRevokeServiceAccountForAdminServiceAccounts({ context, input }),
        ),
    getDataCatalogForAdminDataCatalog:
      implementation.admin.getDataCatalogForAdminDataCatalog
        .use(adminMiddleware)
        .handler(() => handleGetDataCatalogForAdminDataCatalog()),
    listAccountProfilesForAdminDataCatalog:
      implementation.admin.listAccountProfilesForAdminDataCatalog
        .use(adminMiddleware)
        .handler(() => handleListAccountProfilesForAdminDataCatalog()),
    listFailedQueueEventsForAdminDataCatalog:
      implementation.admin.listFailedQueueEventsForAdminDataCatalog
        .use(adminMiddleware)
        .handler(() => handleListFailedQueueEventsForAdminDataCatalog()),
    listWorkflowReceiptsForAdminDataCatalog:
      implementation.admin.listWorkflowReceiptsForAdminDataCatalog
        .use(adminMiddleware)
        .handler(() => handleListWorkflowReceiptsForAdminDataCatalog()),
    listAdminActivityForAdminActivityScreen:
      implementation.admin.listAdminActivityForAdminActivityScreen
        .use(adminMiddleware)
        .handler(({ input }) => handleListAdminActivityForAdminActivityScreen(input)),
  },
})
