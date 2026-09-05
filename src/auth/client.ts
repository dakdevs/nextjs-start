'use client'

import { passkeyClient } from '@better-auth/passkey/client'
import { createAuthClient } from 'better-auth/react'

import { env } from '~/config/env'

/** The sole browser authentication client; feature modules import this instance. */
export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [passkeyClient()],
})
