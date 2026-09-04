'use client'

import { createORPCClient } from '@orpc/client'
import type { RouterContractClient } from '@orpc/contract'
import { RPCLink } from '@orpc/client/fetch'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'

import { contracts } from '~/orpc/contracts'

type AppRpcClient = RouterContractClient<typeof contracts>

const link = new RPCLink({ method: 'POST', url: '/rpc' })

/** Remote same-origin client for Client Components. */
export const rpcClient = createORPCClient<AppRpcClient>(link)

/** Typed query/mutation option builders for TanStack Query. */
export const rpc = createTanstackQueryUtils(rpcClient)
