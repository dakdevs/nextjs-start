'use client'

import { useCallback } from 'react'
import type { z } from 'zod'

import { requestPasswordResetForAdminUserSupportInputSchema } from '~/domains/admin/contracts'
import { rpcClient } from '~/orpc/client'
import { webMcpCapabilities } from '~/webmcp/capability-registry'
import { useWebMcpCapability } from '~/webmcp/use-webmcp-capability'

type PasswordResetInput = z.output<
  typeof requestPasswordResetForAdminUserSupportInputSchema
>

type AdminUsersWebMcpToolsProps = {
  readonly onPasswordResetPrepared: (input: PasswordResetInput) => void
}

/** Reads user-support data, while reset requests stop at the human confirmation UI. */
export function AdminUsersWebMcpTools({
  onPasswordResetPrepared,
}: AdminUsersWebMcpToolsProps) {
  const listUsers = useCallback(
    () => rpcClient.admin.listUsersForAdminUserSupport({}),
    [],
  )
  const preparePasswordReset = useCallback(
    (input: PasswordResetInput) => {
      onPasswordResetPrepared(input)
      return {
        status:
          'The password-reset request is ready for a person to review and confirm in the admin UI.',
      }
    },
    [onPasswordResetPrepared],
  )

  useWebMcpCapability({
    capability: webMcpCapabilities.listAdminUsers,
    execute: listUsers,
  })
  useWebMcpCapability({
    capability: webMcpCapabilities.prepareAdminPasswordReset,
    execute: preparePasswordReset,
  })
  return null
}
