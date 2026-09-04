import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'

import { createAuth } from '~/auth/auth'
import { db } from '~/db/client'
import { authRateLimits } from '~/db/schema'

const rateLimitCases = [
  {
    body: { email: 'signin@example.test', password: 'incorrect-password' },
    path: '/sign-in/email',
  },
  {
    body: { email: 'recovery@example.test' },
    path: '/request-password-reset',
  },
  {
    body: { email: 'verification@example.test' },
    path: '/send-verification-email',
  },
] as const

const requestFor = (input: (typeof rateLimitCases)[number], ipAddress: string) =>
  new Request(`http://localhost:3100/api/auth${input.path}`, {
    body: JSON.stringify(input.body),
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost:3100',
      'x-forwarded-for': ipAddress,
    },
    method: 'POST',
  })

describe('Better Auth database rate limiting', () => {
  beforeEach(async () => {
    await db.delete(authRateLimits)
  })

  it.each(rateLimitCases)(
    'shares the $path threshold across separately created auth instances',
    async (input) => {
      const firstAuth = createAuth()
      const secondAuth = createAuth()
      const ipAddress = '203.0.113.24'

      for (const authInstance of [firstAuth, secondAuth, firstAuth]) {
        const response = await authInstance.handler(requestFor(input, ipAddress))
        expect(response.status).not.toBe(429)
      }

      const [storedLimit] = await db
        .select({
          count: authRateLimits.count,
          key: authRateLimits.key,
          lastRequest: authRateLimits.lastRequest,
        })
        .from(authRateLimits)
        .where(eq(authRateLimits.key, `${ipAddress}|${input.path}`))

      expect(storedLimit).toMatchObject({
        count: 3,
        key: `${ipAddress}|${input.path}`,
      })
      expect(storedLimit?.lastRequest).toBeTypeOf('number')
      expect(storedLimit?.lastRequest).toBeGreaterThan(0)

      const limitedResponse = await secondAuth.handler(requestFor(input, ipAddress))

      expect(limitedResponse.status).toBe(429)
      await expect(limitedResponse.json()).resolves.toMatchObject({
        message: 'Too many requests. Please try again later.',
      })
    },
  )
})
