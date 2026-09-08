'use client'

import { useCallback } from 'react'
import type { z } from 'zod'

import {
  createServiceAccountForAdminServiceAccountsInputSchema,
  serviceAccountIdForAdminServiceAccountsInputSchema,
} from '~/domains/admin/contracts'
import { rpcClient } from '~/orpc/client'
import { webMcpCapabilities } from '~/webmcp/capability-registry'
import { useWebMcpCapability } from '~/webmcp/use-webmcp-capability'
import type { useServiceAccountWorkflow } from './use-service-account-workflow'

type ServiceAccountWorkflow = ReturnType<typeof useServiceAccountWorkflow>
type PreparationResult = ReturnType<
  ServiceAccountWorkflow['prepareCreate' | 'prepareRevoke' | 'prepareRotate']
>

type CreateServiceAccountInput = z.output<
  typeof createServiceAccountForAdminServiceAccountsInputSchema
>
type ServiceAccountIdInput = z.output<
  typeof serviceAccountIdForAdminServiceAccountsInputSchema
>

type AdminServiceAccountsWebMcpToolsProps = {
  readonly onCreatePrepared: (input: CreateServiceAccountInput) => PreparationResult
  readonly onRevokePrepared: (input: ServiceAccountIdInput) => PreparationResult
  readonly onRotatePrepared: (input: ServiceAccountIdInput) => PreparationResult
}

/** Lists safe account metadata; credential changes always stop at human confirmation. */
export function AdminServiceAccountsWebMcpTools({
  onCreatePrepared,
  onRevokePrepared,
  onRotatePrepared,
}: AdminServiceAccountsWebMcpToolsProps) {
  const listServiceAccounts = useCallback(() => {
    return rpcClient.admin.listServiceAccountsForAdminServiceAccounts({})
  }, [])

  const prepareCreate = useCallback(
    (input: CreateServiceAccountInput) => {
      return onCreatePrepared(input)
    },
    [onCreatePrepared],
  )

  const prepareRotate = useCallback(
    (input: ServiceAccountIdInput) => {
      return onRotatePrepared(input)
    },
    [onRotatePrepared],
  )

  const prepareRevoke = useCallback(
    (input: ServiceAccountIdInput) => {
      return onRevokePrepared(input)
    },
    [onRevokePrepared],
  )

  useWebMcpCapability({
    capability: webMcpCapabilities.listAdminServiceAccounts,
    execute: listServiceAccounts,
  })

  useWebMcpCapability({
    capability: webMcpCapabilities.prepareCreateServiceAccount,
    execute: prepareCreate,
  })

  useWebMcpCapability({
    capability: webMcpCapabilities.prepareRotateServiceAccount,
    execute: prepareRotate,
  })

  useWebMcpCapability({
    capability: webMcpCapabilities.prepareRevokeServiceAccount,
    execute: prepareRevoke,
  })

  return null
}
