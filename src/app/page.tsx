import Link from 'next/link'

import { getCurrentSession } from '~/auth/session'
import { Button } from '~/components/shadcn/button'
import { SiteHeader } from '~/modules/site-header'

export default async function HomePage() {
  const session = await getCurrentSession()

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader session={session} />
      <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl items-center px-5 py-16 sm:px-8">
        <section className="max-w-2xl">
          <p className="text-ui font-medium tracking-wide text-muted-foreground">
            A deliberate starting point
          </p>
          <h1 className="mt-5 text-balance text-display font-semibold text-foreground">
            Build the product, not the foundation again.
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-body text-muted-foreground">
            A clean Next.js foundation for thoughtful applications: purpose-built
            contracts, durable backend boundaries, and an interface that stays out of
            the way.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button
              render={<Link href={session ? '/account' : '/sign-up'} />}
              size="lg"
            >
              {session ? 'Open account' : 'Create account'}
            </Button>
            {session ? null : (
              <Button
                render={<Link href="/sign-in" />}
                variant="secondary"
                size="lg"
              >
                Sign in
              </Button>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
