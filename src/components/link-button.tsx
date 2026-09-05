import Link from 'next/link'
import { cn } from 'cn'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { buttonVariants } from '~/components/shadcn/button'

/** Link semantics with the shared button appearance. */
export function LinkButton({
  className,
  size = 'default',
  variant = 'default',
  ...props
}: ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>) {
  return (
    <Link
      data-slot="link-button"
      className={cn(buttonVariants({ className, size, variant }))}
      {...props}
    />
  )
}
