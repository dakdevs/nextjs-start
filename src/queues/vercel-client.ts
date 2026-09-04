import 'server-only'

import { QueueClient } from '@vercel/queue'

import { env } from '~/config/env'

/** One explicitly located client keeps local builds quiet and regional routing stable. */
export const vercelQueueClient = new QueueClient({
  region: env.VERCEL_REGION ?? 'iad1',
})
