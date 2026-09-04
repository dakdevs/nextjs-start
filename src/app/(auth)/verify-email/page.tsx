import { VerifyEmailPanel } from '~/app/(auth)/verify-email/_modules/verify-email-panel'
import { AuthShell } from '~/modules/auth-shell'

export default async function VerifyEmailPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly email?: string | string[] }>
}) {
  const { email: emailParameter } = await searchParams
  const email = Array.isArray(emailParameter) ? emailParameter[0] : emailParameter

  return (
    <AuthShell
      title="Check your inbox"
      description="Verify your email to finish setting up your account."
    >
      <VerifyEmailPanel email={email} />
    </AuthShell>
  )
}
