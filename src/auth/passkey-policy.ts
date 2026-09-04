import 'server-only'

import { env } from '~/config/env'

/** Preview hosts opt in because WebAuthn credentials bind to a stable RP origin. */
export const passkeysEnabled =
  env.VERCEL_ENV !== 'preview' || env.ALLOW_PREVIEW_PASSKEYS === 'true'
