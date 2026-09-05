import 'server-only'

import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { passkey } from '@better-auth/passkey'
import { betterAuth } from 'better-auth'
import { Effect } from 'effect'
import { after } from 'next/server'

import { env } from '~/config/env'
import { db } from '~/db/client'
import {
  accounts,
  authRateLimits,
  passkeys,
  sessions,
  users,
  verifications,
} from '~/db/schema'
import { passkeysEnabled } from '~/auth/passkey-policy'
import { assertUserCanCreateSession } from '~/auth/user-access'
import { EmailService } from '~/email/email-service'
import { runEmailEffect } from '~/email/runtime'
import { runAppEffect } from '~/effect/runtime'
import { logUnexpectedError } from '~/observability/logger'

const sendEmail = (input: { subject: string; text: string; to: string }) =>
  runEmailEffect(
    Effect.flatMap(EmailService, (service) =>
      service.sendTransactional({
        ...input,
        idempotencyKey: crypto.randomUUID(),
      }),
    ),
  )

const scheduleAuthBackgroundTask = (task: Promise<unknown>) => {
  after(async () => {
    try {
      await task
    } catch (cause) {
      const errorId = crypto.randomUUID()
      await runAppEffect(
        logUnexpectedError({
          cause,
          errorId,
          operation: 'auth.email-delivery',
          requestId: crypto.randomUUID(),
        }),
      )
    }
  })
}

const scheduleAuthEmail = (input: Parameters<typeof sendEmail>[0]) => {
  scheduleAuthBackgroundTask(sendEmail(input))
  return Promise.resolve()
}

const authSchema = {
  account: accounts,
  passkey: passkeys,
  rateLimit: authRateLimits,
  session: sessions,
  user: users,
  verification: verifications,
}

export const createAuth = () =>
  betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    // Keep Better Auth's model names explicit while application tables remain
    // outside the adapter's authority.
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: authSchema,
      transaction: true,
    }),
    advanced: {
      // Better Auth gives verification/reset delivery to Next after(), preserving
      // a response that does not reveal whether a target email exists.
      backgroundTasks: { handler: scheduleAuthBackgroundTask },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: ({ user, url }) =>
        scheduleAuthEmail({
          subject: 'Reset your password',
          text: `Reset your password: ${url}`,
          to: user.email,
        }),
    },
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: ({ user, url }) =>
        scheduleAuthEmail({
          subject: 'Verify your email',
          text: `Verify your email: ${url}`,
          to: user.email,
        }),
    },
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            await assertUserCanCreateSession(session.userId)
          },
        },
      },
    },
    plugins: passkeysEnabled
      ? [
          passkey({
            rpID: new URL(env.BETTER_AUTH_URL).hostname,
            rpName: 'nextjs-start',
            origin: env.BETTER_AUTH_URL,
            registration: { requireSession: true },
          }),
        ]
      : [],
    rateLimit: {
      enabled: true,
      storage: 'database',
    },
  })

export const auth = createAuth()
