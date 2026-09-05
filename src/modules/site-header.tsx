import Link from 'next/link'

import { accountRole, accountRoles } from '~/auth/roles'
import { LinkButton } from '~/components/link-button'
import { ThemeToggle } from '~/components/theme-toggle'
import { SignOutButton } from '~/modules/sign-out-button'

type AccountRole = (typeof accountRoles)[number]
type SiteHeaderProps = {
  session: { user: { email: string; role: AccountRole } } | null
}

export function SiteHeader({ session }: SiteHeaderProps) {
  return (
    <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
      <Link
        href="/"
        className="text-ui font-semibold tracking-[-0.025em] text-foreground"
      >
        nextjs-start
      </Link>
      <nav
        aria-label="Primary navigation"
        className="flex items-center gap-1"
      >
        {session ? (
          <>
            {session.user.role === accountRole.admin ? (
              <LinkButton
                href="/admin"
                variant="ghost"
                size="sm"
              >
                Admin
              </LinkButton>
            ) : null}
            <LinkButton
              href="/account"
              variant="ghost"
              size="sm"
            >
              Account
            </LinkButton>
          </>
        ) : (
          <LinkButton
            href="/sign-in"
            variant="ghost"
            size="sm"
          >
            Sign in
          </LinkButton>
        )}
        {session ? <SignOutButton /> : null}
        <ThemeToggle />
      </nav>
    </header>
  )
}
