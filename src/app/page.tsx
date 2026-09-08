import { getCurrentSession } from '~/auth/session'
import { LinkButton } from '~/components/link-button'
import { SiteHeader } from '~/modules/site-header'

import { homeContent } from './_modules/home-content'

export const metadata = {
  alternates: { types: { 'text/markdown': '/index.md' } },
}

export default async function HomePage() {
  const session = await getCurrentSession()

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader session={session} />
      <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl items-center px-5 py-16 sm:px-8">
        <section className="max-w-2xl">
          <p className="text-ui font-medium tracking-wide text-muted-foreground">
            {homeContent.eyebrow}
          </p>
          <h1 className="mt-5 text-balance text-display font-semibold text-foreground">
            {homeContent.title}
          </h1>
          <p className="mt-6 max-w-xl text-balance text-body text-muted-foreground">
            {homeContent.description}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <LinkButton
              href={session === null ? '/sign-up' : '/account'}
              size="lg"
            >
              {session === null ? 'Create account' : 'Open account'}
            </LinkButton>
            {session === null ? (
              <LinkButton
                href="/sign-in"
                variant="secondary"
                size="lg"
              >
                Sign in
              </LinkButton>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  )
}
