import Link from 'next/link'
import type { ReactNode } from 'react'

import { ThemeToggle } from '~/components/theme-toggle'

type AuthShellProps = { children: ReactNode; title: string; description: string }

export function AuthShell({ children, description, title }: AuthShellProps) {
  return (
    <main className="grid min-h-dvh bg-background px-5 py-5 sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between self-start">
        <Link
          href="/"
          className="text-ui font-semibold tracking-[-0.025em] text-foreground"
        >
          nextjs-start
        </Link>
        <ThemeToggle />
      </div>
      <section className="mx-auto w-full max-w-md self-center py-12">
        <div className="px-1 py-6 sm:px-4 sm:py-8">
          <p className="text-ui font-medium text-muted-foreground">Account</p>
          <h1 className="mt-3 text-title font-semibold text-foreground">{title}</h1>
          <p className="mt-3 text-pretty leading-6 text-muted-foreground">
            {description}
          </p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  )
}
