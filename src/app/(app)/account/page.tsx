import { AccountLoadFailure } from '~/app/(app)/account/_modules/account-load-failure'
import { AccountWorkspace } from '~/app/(app)/account/_modules/account-workspace'
import { passkeysEnabled } from '~/auth/passkey-policy'
import { createServerRpcClient } from '~/orpc/server-client'
import { UnexpectedRpcError } from '~/orpc/unexpected-error-interceptor'

async function loadAccountProfile() {
  try {
    const client = await createServerRpcClient()
    const profile = await client.account.getAccountProfileForAccountScreen({})
    return { profile, status: 'ready' } as const
  } catch (cause) {
    if (cause instanceof UnexpectedRpcError)
      return { errorId: cause.data.errorId, status: 'failed' } as const
    throw cause
  }
}

export default async function AccountPage() {
  const result = await loadAccountProfile()
  if (result.status === 'failed') return <AccountLoadFailure errorId={result.errorId} />

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-18">
      <AccountWorkspace
        initialProfile={result.profile}
        passkeysEnabled={passkeysEnabled}
      />
    </main>
  )
}
