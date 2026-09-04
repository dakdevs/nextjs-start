import type { Metadata } from 'next'
import { Geist } from 'next/font/google'

import './globals.css'

import { Providers } from '~/components/providers'
import { env } from '~/config/env'
import { cn } from '~/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: { default: 'nextjs-start', template: '%s · nextjs-start' },
  description: 'An opinionated, agent-ready Next.js application starter.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  const enableWebMcpDevelopmentRuntime =
    env.VERCEL_ENV === undefined || env.VERCEL_ENV === 'development'

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn('font-sans', geist.variable)}
    >
      <body>
        <Providers enableWebMcpDevelopmentRuntime={enableWebMcpDevelopmentRuntime}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
