'use client'

import { useCallback } from 'react'
import { useReducedMotion } from 'motion/react'
import type { InferRouterContractOutputs } from '@orpc/contract'

import { getAccountProfileForAccountScreenContract } from '~/domains/account/contracts/get-account-profile-for-account-screen'
import { rpcClient } from '~/orpc/client'
import { webMcpCapabilities } from '~/webmcp/capability-registry'
import { useWebMcpCapability } from '~/webmcp/use-webmcp-capability'

type AccountProfile = InferRouterContractOutputs<
  typeof getAccountProfileForAccountScreenContract
>
type AccountWebMcpToolsProps = {
  profile: AccountProfile
  passkeysEnabled: boolean
  onPasskeyRequested: () => void
  onProfileUpdated: (profile: AccountProfile) => void
}

export function AccountWebMcpTools({
  onPasskeyRequested,
  onProfileUpdated,
  passkeysEnabled,
  profile,
}: AccountWebMcpToolsProps) {
  const shouldReduceMotion = useReducedMotion()
  const getProfile = useCallback(
    () => rpcClient.account.getAccountProfileForAccountScreen({}),
    [],
  )
  const updateProfile = useCallback(
    (input: { name: string; bio: string }) =>
      rpcClient.account.updateAccountProfileForAccountScreen(input).then((updated) => {
        onProfileUpdated({ ...profile, ...updated })
        return updated
      }),
    [onProfileUpdated, profile],
  )
  const beginPasskeyEnrollment = useCallback(() => {
    onPasskeyRequested()
    document.querySelector('#passkey-enrollment')?.scrollIntoView({
      behavior: shouldReduceMotion === true ? 'auto' : 'smooth',
      block: 'center',
    })
    return Promise.resolve({
      status:
        'Passkey enrollment is ready for the person to confirm in the account UI.',
    })
  }, [onPasskeyRequested, shouldReduceMotion])

  useWebMcpCapability({
    capability: webMcpCapabilities.getAccountProfile,
    execute: getProfile,
  })
  useWebMcpCapability({
    capability: webMcpCapabilities.updateAccountProfile,
    execute: updateProfile,
  })
  useWebMcpCapability({
    capability: webMcpCapabilities.beginPasskeyEnrollment,
    enabled: passkeysEnabled,
    execute: beginPasskeyEnrollment,
  })
  return null
}
