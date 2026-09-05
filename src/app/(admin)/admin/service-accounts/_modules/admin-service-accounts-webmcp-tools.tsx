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

type CreateServiceAccountInput = z.output<
  typeof createServiceAccountForAdminServiceAccountsInputSchema
>
type ServiceAccountIdInput = z.output<
  typeof serviceAccountIdForAdminServiceAccountsInputSchema
>

type AdminServiceAccountsWebMcpToolsProps = {
  readonly onCreatePrepared: (input: CreateServiceAccountInput) => void
  readonly onRevokePrepared: (input: ServiceAccountIdInput) => void
  readonly onRotatePrepared: (input: ServiceAccountIdInput) => void
}

/** Lists safe account metadata; credential changes always stop at human confirmation. */
export function AdminServiceAccountsWebMcpTools({
  onCreatePrepared,
  onRevokePrepared,
  onRotatePrepared,
}: AdminServiceAccountsWebMcpToolsProps) {
  const listServiceAccounts = useCallback(
    () => rpcClient.admin.listServiceAccountsForAdminServiceAccounts({}),
    [],
  )
  const prepareCreate = useCallback(
    (input: CreateServiceAccountInput) => {
      onCreatePrepared(input)
      return {
        status:
          'The service-account form is ready for a person to review and confirm in the admin UI.',
      }
    },
    [onCreatePrepared],
  )
  const prepareRotate = useCallback(
    (input: ServiceAccountIdInput) => {
      onRotatePrepared(input)
      return {
        status:
          'The service-account rotation is ready for a person to review and confirm in the admin UI.',
      }
    },
    [onRotatePrepared],
  )
  const prepareRevoke = useCallback(
    (input: ServiceAccountIdInput) => {
      onRevokePrepared(input)
      return {
        status:
          'The service-account revocation is ready for a person to review and confirm in the admin UI.',
      }
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
