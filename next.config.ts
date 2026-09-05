import { varlockNextConfigPlugin } from '@varlock/nextjs-integration/plugin'
import type { NextConfig } from 'next'
import { withWorkflow } from 'workflow/next'

const scriptPolicy =
  process.env.NODE_ENV === 'development'
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'"

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
  poweredByHeader: false,
  typedRoutes: true,
  serverExternalPackages: ['@varlock/nextjs-integration', 'postgres'],
  headers: () =>
    Promise.resolve([
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "connect-src 'self'",
              "font-src 'self' data:",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "img-src 'self' blob: data:",
              "object-src 'none'",
              scriptPolicy,
              "style-src 'self' 'unsafe-inline'",
            ].join('; '),
          },
          { key: 'Permissions-Policy', value: 'tools=(self)' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ]),
}

const withVarlock = varlockNextConfigPlugin()

export default withVarlock(withWorkflow(nextConfig))
