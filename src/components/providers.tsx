'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ThemeProvider } from 'next-themes'
import { useState, type ReactNode } from 'react'

import { GlobalWebMcpTools } from '~/webmcp/global-webmcp-tools'
import { WebMcpDevelopmentRuntime } from '~/webmcp/webmcp-development-runtime'
import { WebMcpRuntimeProvider } from '~/webmcp/webmcp-runtime-state'

type ProvidersProps = {
  children: ReactNode
  enableWebMcpDevelopmentRuntime: boolean
}

export function Providers({
  children,
  enableWebMcpDevelopmentRuntime,
}: ProvidersProps) {
  const [queryClient] = useState(() => {
    return new QueryClient()
  })

  const [isWebMcpDevelopmentRuntimeReady, setIsWebMcpDevelopmentRuntimeReady] =
    useState(false)

  const isWebMcpReady =
    !enableWebMcpDevelopmentRuntime || isWebMcpDevelopmentRuntimeReady

  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
          <NuqsAdapter>
            <WebMcpRuntimeProvider isReady={isWebMcpReady}>
              <WebMcpDevelopmentRuntime
                enabled={enableWebMcpDevelopmentRuntime}
                onReady={() => {
                  setIsWebMcpDevelopmentRuntimeReady(true)
                }}
              />
              <GlobalWebMcpTools />
              {children}
            </WebMcpRuntimeProvider>
          </NuqsAdapter>
        </QueryClientProvider>
      </ThemeProvider>
    </MotionConfig>
  )
}
