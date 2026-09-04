import 'server-only'

import { implement } from '@orpc/server'

import { handleGetAccountProfileForAccountScreen } from '~/domains/account/server/get-account-profile-for-account-screen.procedure'
import { handleUpdateAccountProfileForAccountScreen } from '~/domains/account/server/update-account-profile-for-account-screen.procedure'
import { contracts } from '~/orpc/contracts'
import { makeRpcContext } from '~/orpc/context'
import { authenticatedMiddleware } from '~/orpc/procedures'

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
})
