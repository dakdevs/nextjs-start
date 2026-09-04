import Link from 'next/link'

import { ResetPasswordForm } from '~/app/(auth)/reset-password/_modules/reset-password-form'
import { Alert, AlertDescription } from '~/components/shadcn/alert'
import { Button } from '~/components/shadcn/button'
import { AuthShell } from '~/modules/auth-shell'

export default async function ResetPasswordPage({
  searchParams,
}: {
  readonly searchParams: Promise<{
    readonly error?: string | string[]
    readonly token?: string | string[]
  }>
}) {
  const { error: errorParameter, token: tokenParameter } = await searchParams
  const error = Array.isArray(errorParameter) ? errorParameter[0] : errorParameter
  const token = Array.isArray(tokenParameter) ? tokenParameter[0] : tokenParameter

  return (
    <AuthShell
      title={
        token === undefined ? 'Request another reset link' : 'Choose a new password'
      }
      description={
        token === undefined
          ? 'This reset link is invalid or has expired.'
          : 'This reset link is time-limited for your protection.'
      }
    >
      {token === undefined || error === 'INVALID_TOKEN' ? (
        <div className="space-y-6">
          <Alert className="border-0 bg-muted">
            <AlertDescription>
              Password reset links can only be used once. Request a fresh link to
              continue.
            </AlertDescription>
          </Alert>
          <Button
            render={<Link href="/forgot-password" />}
            className="w-full"
            size="lg"
          >
            Request reset link
          </Button>
        </div>
      ) : (
        <ResetPasswordForm token={token} />
      )}
    </AuthShell>
  )
}
