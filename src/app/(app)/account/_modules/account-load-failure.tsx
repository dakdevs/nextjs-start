import Link from 'next/link'

import { Button } from '~/components/shadcn/button'

export function AccountLoadFailure({ errorId }: { readonly errorId: string }) {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-3xl items-center px-5 sm:px-8">
      <section className="max-w-md rounded-2xl bg-card p-7">
        <p className="text-ui font-medium text-muted-foreground">Account</p>
        <h1 className="mt-3 text-title font-semibold">Something went wrong</h1>
        <p className="mt-3 leading-6 text-muted-foreground">
          Try again. If this keeps happening, share the error ID with support.
        </p>
        <p className="mt-3 font-mono text-ui text-muted-foreground">
          Error ID: {errorId}
        </p>
        <Button
          render={<Link href="/account" />}
          className="mt-6"
        >
          Try again
        </Button>
      </section>
    </main>
  )
}
