'use client'

import { Button } from '~/components/shadcn/button'
import { useClientBoundaryError } from '~/observability/use-client-boundary-error'

type RootErrorProps = { error: Error & { digest?: string }; reset: () => void }

export default function RootError({ error, reset }: RootErrorProps) {
  const errorId = useClientBoundaryError(error)
  return (
    <main className="grid min-h-dvh place-items-center bg-background p-5">
      <section className="max-w-md rounded-2xl bg-card p-7">
        <p className="text-sm font-medium text-muted-foreground">nextjs-start</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.035em]">
          Something went wrong
        </h1>
        <p className="mt-3 leading-6 text-muted-foreground">
          Try again. If this keeps happening, share the error ID with support.
        </p>
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          Error ID: {errorId}
        </p>
        <Button
          className="mt-6"
          onClick={reset}
        >
          Try again
        </Button>
      </section>
    </main>
  )
}
