import { relations, sql } from 'drizzle-orm'
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

import { accountRole, accountRoles } from '~/auth/roles'

export const users = pgTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull().default(false),
    image: text('image'),
    role: text('role', { enum: accountRoles }).notNull().default(accountRole.user),
    banned: boolean('banned').notNull().default(false),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [check('user_role_check', sql`${table.role} in ('user', 'admin')`)],
)

export const sessions = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    impersonatedBy: text('impersonated_by'),
  },
  (table) => [index('session_user_id_idx').on(table.userId)],
)

export const accounts = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    issuer: text('issuer').notNull(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('account_issuer_account_id_unique').on(table.issuer, table.accountId),
    index('account_user_id_idx').on(table.userId),
  ],
)

export const verifications = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
)

export const passkeys = pgTable(
  'passkey',
  {
    id: text('id').primaryKey(),
    name: text('name'),
    publicKey: text('public_key').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    credentialID: text('credential_id').notNull().unique(),
    counter: integer('counter').notNull(),
    deviceType: text('device_type').notNull(),
    backedUp: boolean('backed_up').notNull(),
    transports: text('transports'),
    aaguid: text('aaguid'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [index('passkey_user_id_idx').on(table.userId)],
)

/**
 * Better Auth's distributed request counter. Its unique key lets the adapter
 * atomically consume a limit across independently scaled Vercel functions.
 */
export const authRateLimits = pgTable(
  'rate_limit',
  {
    id: text('id').primaryKey(),
    key: text('key').notNull().unique(),
    count: integer('count').notNull(),
    lastRequest: bigint('last_request', { mode: 'number' }).notNull(),
  },
  (table) => [index('rate_limit_last_request_idx').on(table.lastRequest)],
)

export const accountProfiles = pgTable('account_profile', {
  accountId: text('account_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  bio: text('bio').notNull().default(''),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const userRelations = relations(users, ({ one, many }) => ({
  profile: one(accountProfiles, {
    fields: [users.id],
    references: [accountProfiles.accountId],
  }),
  sessions: many(sessions),
  passkeys: many(passkeys),
}))

export { transactionalOutboxMessages } from '~/queues/outbox/schema'
export { failedQueueEvents, processedQueueEvents } from '~/queues/schema'
export { profileUpdateAuditReceipts } from '~/workflows/schema'
