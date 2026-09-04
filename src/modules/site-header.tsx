import Link from 'next/link'

import { Button } from '~/components/shadcn/button'
import { ThemeToggle } from '~/components/theme-toggle'
import { SignOutButton } from '~/modules/sign-out-button'

type SiteHeaderProps = { session: { user: { email: string } } | null }

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
          <Button
            render={<Link href="/account" />}
            variant="ghost"
            size="sm"
          >
            Account
          </Button>
        ) : (
          <Button
            render={<Link href="/sign-in" />}
            variant="ghost"
            size="sm"
          >
            Sign in
          </Button>
        )}
        {session ? <SignOutButton /> : null}
        <ThemeToggle />
      </nav>
    </header>
  )
}
