import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

const canonicalOrigin = z
  .url()
  .refine(
    (value) => new URL(value).origin === value,
    'Use an origin without a path or trailing slash.',
  )

const postgresUrl = z.url().refine((value) => {
  const protocol = new URL(value).protocol
  return protocol === 'postgres:' || protocol === 'postgresql:'
}, 'Use a postgres:// or postgresql:// connection URL.')

const databaseTlsModes = new Set(['require', 'verify-ca', 'verify-full'])

const checkedInAuthSecretPlaceholders = new Set([
  'replace-with-at-least-32-random-characters',
  '<generate-with-openssl-rand-base64-48>',
])

const betterAuthSecret = z
  .string()
  .min(32)
  .refine(
    (value) => !checkedInAuthSecretPlaceholders.has(value),
    'BETTER_AUTH_SECRET must be a generated secret, not a checked-in placeholder.',
  )

function isDeployedEnvironment(
  nodeEnvironment: 'development' | 'test' | 'production',
  vercelEnvironment: 'development' | 'preview' | 'production' | undefined,
) {
  return (
    vercelEnvironment === 'production' ||
    vercelEnvironment === 'preview' ||
    (nodeEnvironment === 'production' && vercelEnvironment === undefined)
  )
}

function databaseRequiresTls(databaseUrl: string) {
  const parameters = new URL(databaseUrl).searchParams
  return (
    databaseTlsModes.has(parameters.get('sslmode') ?? '') ||
    parameters.get('ssl') === 'true'
  )
}

/** The sole process-environment boundary for application code. */
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    BETTER_AUTH_SECRET: betterAuthSecret,
    BETTER_AUTH_URL: canonicalOrigin,
    DATABASE_URL: postgresUrl,
    EMAIL_DELIVERY: z.enum(['development', 'resend']),
    EMAIL_FROM: z.string().min(1),
    RESEND_API_KEY: z.string().min(1).optional(),
    ALLOW_PREVIEW_PASSKEYS: z.enum(['true', 'false']).default('false'),
    VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
    VERCEL_REGION: z.string().min(1).optional(),
  },
  client: { NEXT_PUBLIC_APP_URL: canonicalOrigin },
  experimental__runtimeEnv: { NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL },
  emptyStringAsUndefined: true,
  createFinalSchema: (environmentSchemas, isServer) => {
    const schema = z.object(environmentSchemas)
    if (!isServer) return schema

    return schema.superRefine((value, context) => {
      if (value.BETTER_AUTH_URL !== value.NEXT_PUBLIC_APP_URL) {
        context.addIssue({
          code: 'custom',
          message: 'BETTER_AUTH_URL must equal NEXT_PUBLIC_APP_URL.',
          path: ['BETTER_AUTH_URL'],
        })
      }

      const isDeployment = isDeployedEnvironment(value.NODE_ENV, value.VERCEL_ENV)

      if (isDeployment && new URL(value.NEXT_PUBLIC_APP_URL).protocol !== 'https:') {
        context.addIssue({
          code: 'custom',
          message: 'Deployed application origins must use HTTPS.',
          path: ['NEXT_PUBLIC_APP_URL'],
        })
      }

      if (isDeployment && !databaseRequiresTls(value.DATABASE_URL)) {
        context.addIssue({
          code: 'custom',
          message: 'Deployed DATABASE_URL must explicitly require TLS.',
          path: ['DATABASE_URL'],
        })
      }

      if (isDeployment && value.EMAIL_DELIVERY !== 'resend') {
        context.addIssue({
          code: 'custom',
          message: 'Deployed environments must use EMAIL_DELIVERY=resend.',
          path: ['EMAIL_DELIVERY'],
        })
      }
      if (value.EMAIL_DELIVERY === 'resend' && value.RESEND_API_KEY === undefined) {
        context.addIssue({
          code: 'custom',
          message: 'RESEND_API_KEY is required when EMAIL_DELIVERY=resend.',
          path: ['RESEND_API_KEY'],
        })
      }
    })
  },
})
