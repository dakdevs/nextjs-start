import { SignUpForm } from '~/app/(auth)/sign-up/_modules/sign-up-form'
import { AuthShell } from '~/modules/auth-shell'

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Start with a password. You can add a passkey after sign-in."
    >
      <SignUpForm />
    </AuthShell>
  )
}
