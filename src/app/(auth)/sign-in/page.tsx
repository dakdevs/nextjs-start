import { SignInForm } from '~/app/(auth)/sign-in/_modules/sign-in-form'
import { passkeysEnabled } from '~/auth/passkey-policy'
import { AuthShell } from '~/modules/auth-shell'

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      description={
        passkeysEnabled
          ? 'Sign in with your password or a passkey.'
          : 'Sign in with your password.'
      }
    >
      <SignInForm passkeysEnabled={passkeysEnabled} />
    </AuthShell>
  )
}
