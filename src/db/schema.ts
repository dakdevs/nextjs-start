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
  uuid,
} from 'drizzle-orm/pg-core'
import { z } from 'zod'

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

/** A singleton, database-enforced record of the first eligible administrator. */
export const adminBootstrapClaims = pgTable(
  'admin_bootstrap_claim',
  {
    singleton: boolean('singleton').primaryKey().default(true),
    adminUserId: text('admin_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    claimedAt: timestamp('claimed_at').notNull().defaultNow(),
  },
  (table) => [
    check('admin_bootstrap_claim_singleton_check', sql`${table.singleton} = true`),
  ],
)

/** Append-only, safe operational history. Payloads never contain credentials. */
export const adminAuditEvents = pgTable(
  'admin_audit_event',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    action: text('action').notNull(),
    actorUserId: text('actor_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    subjectUserId: text('subject_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    outcome: text('outcome').notNull(),
    targetKind: text('target_kind').notNull(),
    targetId: text('target_id').notNull(),
    correlationId: uuid('correlation_id').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('admin_audit_event_created_at_idx').on(table.createdAt)],
)

export const serviceAccountScope = ['system:health:read'] as const
export const serviceAccountScopeSchema = z.enum(serviceAccountScope)

/** Machine credentials are distinct from people and retain only a token digest. */
export const serviceAccounts = pgTable(
  'service_account',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    tokenPrefix: text('token_prefix').notNull().unique(),
    tokenDigest: text('token_digest').notNull().unique(),
    scopes: text('scopes').array().notNull(),
    createdByUserId: text('created_by_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    rotatedAt: timestamp('rotated_at'),
    revokedAt: timestamp('revoked_at'),
    lastUsedAt: timestamp('last_used_at'),
  },
  (table) => [
    check(
      'service_account_scope_check',
      sql`cardinality(${table.scopes}) > 0 and ${table.scopes} <@ ARRAY['system:health:read']::text[]`,
    ),
    index('service_account_active_idx').on(table.revokedAt),
  ],
)

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
