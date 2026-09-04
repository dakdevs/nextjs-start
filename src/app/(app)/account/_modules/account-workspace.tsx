'use client'

import { useState } from 'react'
import type { InferRouterContractOutputs } from '@orpc/contract'

import { AccountProfileEditor } from '~/app/(app)/account/_modules/account-profile-editor'
import { PasskeyEnrollment } from '~/app/(app)/account/_modules/passkey-enrollment'
import { AccountWebMcpTools } from '~/app/(app)/account/_modules/account-webmcp-tools'
import { getAccountProfileForAccountScreenContract } from '~/domains/account/contracts/get-account-profile-for-account-screen'

type AccountProfile = InferRouterContractOutputs<
  typeof getAccountProfileForAccountScreenContract
>

type AccountWorkspaceProps = {
  initialProfile: AccountProfile
  passkeysEnabled: boolean
}

export function AccountWorkspace({
  initialProfile,
  passkeysEnabled,
}: AccountWorkspaceProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [isPasskeyPaneOpen, setIsPasskeyPaneOpen] = useState(
    passkeysEnabled && !initialProfile.hasPasskey,
  )

  return (
    <section className="space-y-8">
      <AccountWebMcpTools
        profile={profile}
        passkeysEnabled={passkeysEnabled}
        onProfileUpdated={(nextProfile) => {
          setProfile(nextProfile)
        }}
        onPasskeyRequested={() => {
          setIsPasskeyPaneOpen(true)
        }}
      />
      <header className="max-w-xl">
        <p className="text-ui font-medium text-muted-foreground">Account</p>
        <h1 className="mt-3 text-title font-semibold text-foreground">Your profile</h1>
        <p className="mt-3 text-pretty leading-7 text-muted-foreground">
          Keep the details people see about you current and clear.
        </p>
      </header>
      <AccountProfileEditor
        profile={profile}
        onProfileUpdated={setProfile}
      />
      {passkeysEnabled ? (
        <PasskeyEnrollment
          isOpen={isPasskeyPaneOpen}
          hasPasskey={profile.hasPasskey}
          onDismiss={() => {
            setIsPasskeyPaneOpen(false)
          }}
          onAdded={() => {
            setProfile((current) => ({ ...current, hasPasskey: true }))
            setIsPasskeyPaneOpen(false)
          }}
        />
      ) : null}
    </section>
  )
}
