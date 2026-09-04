import { ForgotPasswordForm } from '~/app/(auth)/forgot-password/_modules/forgot-password-form'
import { AuthShell } from '~/modules/auth-shell'

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      description="We’ll send a time-limited reset link if this email is registered."
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
