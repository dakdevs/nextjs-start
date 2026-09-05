import 'server-only'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '~/config/env'
import {
  accountProfiles,
  adminAuditEvents,
  adminBootstrapClaims,
  accounts,
  failedQueueEvents,
  passkeys,
  profileUpdateAuditReceipts,
  processedQueueEvents,
  sessions,
  serviceAccounts,
  transactionalOutboxMessages,
  userRelations,
  users,
  verifications,
} from '~/db/schema'

const client = postgres(env.DATABASE_URL, {
  connect_timeout: 10,
  idle_timeout: 20,
  max: 3,
  max_lifetime: 60 * 10,
  prepare: false,
})

const schema = {
  accountProfiles,
  adminAuditEvents,
  adminBootstrapClaims,
  accounts,
  failedQueueEvents,
  passkeys,
  profileUpdateAuditReceipts,
  processedQueueEvents,
  sessions,
  serviceAccounts,
  transactionalOutboxMessages,
  userRelations,
  users,
  verifications,
}

export const db = drizzle(client, { schema })
