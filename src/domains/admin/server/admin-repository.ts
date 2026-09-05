import 'server-only'

import { createHash, randomBytes } from 'node:crypto'

import { and, count, desc, eq, ilike, isNull, lt, or } from 'drizzle-orm'
import { DateTime, Effect } from 'effect'
import type { z } from 'zod'

import { accountRole } from '~/auth/roles'
import { db } from '~/db/client'
import {
  adminAuditEvents,
  accountProfiles,
  adminBootstrapClaims,
  failedQueueEvents,
  processedQueueEvents,
  profileUpdateAuditReceipts,
  serviceAccounts,
  serviceAccountScopeSchema,
  transactionalOutboxMessages,
  users,
} from '~/db/schema'
import { adminPaginatedSearchInputSchema } from '~/domains/admin/contracts'
import { AdminReadError, AdminWriteError } from '~/domains/admin/server/errors'
import { AdminUserNotFoundError } from '~/domains/admin/server/admin-user-not-found-error'
import { ServiceAccountNotFoundError } from '~/domains/admin/server/service-account-errors'
import { ServiceAccountUnauthorizedError } from '~/domains/admin/server/service-account-unauthorized-error'

type AdminReadFailure = InstanceType<typeof AdminReadError>
type AdminWriteFailure = InstanceType<typeof AdminWriteError>
type ServiceAccountUnauthorizedFailure = InstanceType<
  typeof ServiceAccountUnauthorizedError
>
type AdminPaginatedSearchInput = z.output<typeof adminPaginatedSearchInputSchema>

const serviceAccountProjection = {
  createdAt: serviceAccounts.createdAt,
  id: serviceAccounts.id,
  lastUsedAt: serviceAccounts.lastUsedAt,
  name: serviceAccounts.name,
  revokedAt: serviceAccounts.revokedAt,
  rotatedAt: serviceAccounts.rotatedAt,
  scopes: serviceAccounts.scopes,
  tokenPrefix: serviceAccounts.tokenPrefix,
}

const auditReferenceProjection = {
  correlationId: adminAuditEvents.correlationId,
  id: adminAuditEvents.id,
}

type ServiceAccountRecord = {
  readonly createdAt: Date
  readonly id: string
  readonly lastUsedAt: Date | null
  readonly name: string
  readonly revokedAt: Date | null
  readonly rotatedAt: Date | null
  readonly scopes: string[]
  readonly tokenPrefix: string
}

const safeServiceAccount = (record: ServiceAccountRecord) => ({
  ...record,
  scopes: serviceAccountScopeSchema.array().parse(record.scopes),
})

const hasSystemHealthReadScope = (scopes: readonly string[]) => {
  const parsed = serviceAccountScopeSchema.array().safeParse(scopes)
  return parsed.success && parsed.data.includes('system:health:read')
}

const tokenDigest = (token: string) => createHash('sha256').update(token).digest('hex')

const createServiceAccountToken = () => {
  const token = `njsa_${randomBytes(32).toString('base64url')}`
  return { token, tokenDigest: tokenDigest(token), tokenPrefix: token.slice(0, 13) }
}

const requireReturnedRow = <Record>(
  rows: readonly Record[],
  message: string,
): Record => {
  const row = rows[0]
  if (row === undefined) throw new Error(message)
  return row
}

const countValue = (rows: readonly { readonly value: number }[]) => rows[0]?.value ?? 0

export const getAdminHomeSummaryForAdminHomeFromDatabase = Effect.tryPromise({
  try: () =>
    Promise.all([
      db.select({ value: count() }).from(users),
      db
        .select({ value: count() })
        .from(users)
        .where(eq(users.role, accountRole.admin)),
      db
        .select({ value: count() })
        .from(serviceAccounts)
        .where(isNull(serviceAccounts.revokedAt)),
    ]),
  catch: (cause) => new AdminReadError({ cause }),
}).pipe(
  Effect.map(([[userTotal], [adminTotal], [activeServiceAccountTotal]]) => ({
    activeServiceAccountCount: activeServiceAccountTotal?.value ?? 0,
    administratorCount: adminTotal?.value ?? 0,
    userCount: userTotal?.value ?? 0,
  })),
)

export const listUsersForAdminUserSupportFromDatabase = (
  input: AdminPaginatedSearchInput,
) =>
  Effect.tryPromise({
    try: () => {
      const { cursor } = input
      return db
        .select({
          createdAt: users.createdAt,
          email: users.email,
          emailVerified: users.emailVerified,
          id: users.id,
          name: users.name,
          role: users.role,
        })
        .from(users)
        .where(
          and(
            cursor === undefined
              ? undefined
              : or(
                  lt(users.createdAt, cursor.createdAt),
                  and(eq(users.createdAt, cursor.createdAt), lt(users.id, cursor.id)),
                ),
            input.query === undefined
              ? undefined
              : or(
                  ilike(users.email, `%${input.query}%`),
                  ilike(users.name, `%${input.query}%`),
                ),
          ),
        )
        .orderBy(desc(users.createdAt), desc(users.id))
        .limit(51)
    },
    catch: (cause) => new AdminReadError({ cause }),
  }).pipe(
    Effect.map((rows) => ({
      nextCursor:
        rows.length === 51 && rows[49] !== undefined
          ? { createdAt: rows[49].createdAt, id: rows[49].id }
          : null,
      users: rows.slice(0, 50),
    })),
  )

export const findAdminPasswordResetTarget = (userId: string) =>
  Effect.tryPromise({
    try: () =>
      db.select({ email: users.email }).from(users).where(eq(users.id, userId)),
    catch: (cause) => new AdminReadError({ cause }),
  }).pipe(
    Effect.flatMap(([user]) =>
      user === undefined
        ? Effect.fail(new AdminUserNotFoundError())
        : Effect.succeed(user),
    ),
  )

export const recordAdminPasswordResetRequest = (input: {
  readonly actorUserId: string
  readonly correlationId: string
  readonly subjectUserId: string
}) =>
  Effect.tryPromise({
    try: () =>
      db
        .insert(adminAuditEvents)
        .values({
          action: 'admin.user.password-reset.requested',
          actorUserId: input.actorUserId,
          correlationId: input.correlationId,
          outcome: 'requested',
          subjectUserId: input.subjectUserId,
          targetId: input.subjectUserId,
          targetKind: 'user',
        })
        .returning(auditReferenceProjection),
    catch: (cause) => new AdminWriteError({ cause }),
  }).pipe(
    Effect.flatMap(([audit]) =>
      audit === undefined
        ? Effect.fail(
            new AdminWriteError({
              cause: new Error('Audit insert returned no row'),
            }),
          )
        : Effect.succeed(audit),
    ),
  )

export const listServiceAccountsForAdminServiceAccountsFromDatabase = Effect.tryPromise(
  {
    try: () => db.select(serviceAccountProjection).from(serviceAccounts),
    catch: (cause) => new AdminReadError({ cause }),
  },
).pipe(
  Effect.map((serviceAccounts) => ({
    serviceAccounts: serviceAccounts.map(safeServiceAccount),
  })),
)

export const createServiceAccountForAdminServiceAccountsInDatabase = (input: {
  readonly actorUserId: string
  readonly correlationId: string
  readonly name: string
  readonly scopes: readonly 'system:health:read'[]
}) =>
  Effect.gen(function* () {
    const credential = yield* Effect.sync(createServiceAccountToken)
    const result = yield* Effect.tryPromise({
      try: () =>
        db.transaction((transaction) =>
          transaction
            .insert(serviceAccounts)
            .values({
              createdByUserId: input.actorUserId,
              name: input.name,
              scopes: [...input.scopes],
              tokenDigest: credential.tokenDigest,
              tokenPrefix: credential.tokenPrefix,
            })
            .returning(serviceAccountProjection)
            .then((rows) =>
              requireReturnedRow(rows, 'Service account insert returned no row'),
            )
            .then((created) =>
              transaction
                .insert(adminAuditEvents)
                .values({
                  action: 'admin.service-account.created',
                  actorUserId: input.actorUserId,
                  correlationId: input.correlationId,
                  outcome: 'succeeded',
                  targetId: created.id,
                  targetKind: 'service-account',
                })
                .returning(auditReferenceProjection)
                .then((rows) => ({
                  audit: requireReturnedRow(rows, 'Audit insert returned no row'),
                  created,
                })),
            ),
        ),
      catch: (cause) => new AdminWriteError({ cause }),
    })
    return {
      audit: result.audit,
      serviceAccount: safeServiceAccount(result.created),
      token: credential.token,
    }
  })

export const rotateServiceAccountForAdminServiceAccountsInDatabase = (input: {
  readonly actorUserId: string
  readonly correlationId: string
  readonly serviceAccountId: string
}) =>
  Effect.gen(function* () {
    const credential = yield* Effect.sync(createServiceAccountToken)
    const now = yield* DateTime.nowAsDate
    const result = yield* Effect.tryPromise({
      try: () =>
        db.transaction((transaction) =>
          transaction
            .update(serviceAccounts)
            .set({
              rotatedAt: now,
              tokenDigest: credential.tokenDigest,
              tokenPrefix: credential.tokenPrefix,
            })
            .where(
              and(
                eq(serviceAccounts.id, input.serviceAccountId),
                isNull(serviceAccounts.revokedAt),
              ),
            )
            .returning(serviceAccountProjection)
            .then(([updated]) => {
              if (updated === undefined) return null
              return transaction
                .insert(adminAuditEvents)
                .values({
                  action: 'admin.service-account.rotated',
                  actorUserId: input.actorUserId,
                  correlationId: input.correlationId,
                  outcome: 'succeeded',
                  targetId: updated.id,
                  targetKind: 'service-account',
                })
                .returning(auditReferenceProjection)
                .then((rows) => ({
                  audit: requireReturnedRow(rows, 'Audit insert returned no row'),
                  updated,
                }))
            }),
        ),
      catch: (cause) => new AdminWriteError({ cause }),
    })
    if (result === null) return yield* new ServiceAccountNotFoundError()
    return {
      audit: result.audit,
      serviceAccount: safeServiceAccount(result.updated),
      token: credential.token,
    }
  })

export const revokeServiceAccountForAdminServiceAccountsInDatabase = (input: {
  readonly actorUserId: string
  readonly correlationId: string
  readonly serviceAccountId: string
}) =>
  Effect.gen(function* () {
    const now = yield* DateTime.nowAsDate
    const result = yield* Effect.tryPromise({
      try: () =>
        db.transaction((transaction) =>
          transaction
            .update(serviceAccounts)
            .set({ revokedAt: now })
            .where(
              and(
                eq(serviceAccounts.id, input.serviceAccountId),
                isNull(serviceAccounts.revokedAt),
              ),
            )
            .returning({ id: serviceAccounts.id })
            .then(([revoked]) => {
              if (revoked === undefined) return null
              return transaction
                .insert(adminAuditEvents)
                .values({
                  action: 'admin.service-account.revoked',
                  actorUserId: input.actorUserId,
                  correlationId: input.correlationId,
                  outcome: 'succeeded',
                  targetId: revoked.id,
                  targetKind: 'service-account',
                })
                .returning(auditReferenceProjection)
                .then((rows) =>
                  requireReturnedRow(rows, 'Audit insert returned no row'),
                )
            }),
        ),
      catch: (cause) => new AdminWriteError({ cause }),
    })
    if (result === null) return yield* new ServiceAccountNotFoundError()
    return { audit: result, revoked: true as const }
  })

export const authenticateServiceAccountForSystemHealth = (
  token: string,
): Effect.Effect<
  void,
  AdminReadFailure | AdminWriteFailure | ServiceAccountUnauthorizedFailure
> =>
  Effect.gen(function* () {
    const serviceAccount = yield* Effect.tryPromise({
      try: () =>
        db
          .select({ id: serviceAccounts.id, scopes: serviceAccounts.scopes })
          .from(serviceAccounts)
          .where(
            and(
              eq(serviceAccounts.tokenDigest, tokenDigest(token)),
              isNull(serviceAccounts.revokedAt),
            ),
          ),
      catch: (cause) => new AdminReadError({ cause }),
    }).pipe(
      Effect.map(([record]) => record),
      Effect.filterOrFail(
        (record) => record !== undefined,
        () => new ServiceAccountUnauthorizedError(),
      ),
    )
    yield* Effect.succeed(serviceAccount.scopes).pipe(
      Effect.filterOrFail(
        hasSystemHealthReadScope,
        () => new ServiceAccountUnauthorizedError(),
      ),
    )
    const now = yield* DateTime.nowAsDate
    yield* Effect.tryPromise({
      try: () =>
        db
          .update(serviceAccounts)
          .set({ lastUsedAt: now })
          .where(eq(serviceAccounts.id, serviceAccount.id)),
      catch: (cause) => new AdminWriteError({ cause }),
    })
  })

export const getDataCatalogForAdminDataCatalogFromDatabase = Effect.tryPromise({
  try: () =>
    Promise.all([
      db.select({ value: count() }).from(accountProfiles),
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(failedQueueEvents),
      db.select({ value: count() }).from(processedQueueEvents),
      db.select({ value: count() }).from(profileUpdateAuditReceipts),
      db.select({ value: count() }).from(transactionalOutboxMessages),
      db.select({ value: count() }).from(adminBootstrapClaims),
      db.select({ value: count() }).from(adminAuditEvents),
    ]),
  catch: (cause) => new AdminReadError({ cause }),
}).pipe(
  Effect.map(
    ([
      profileRows,
      userRows,
      failedQueueRows,
      processedQueueRows,
      workflowReceiptRows,
      outboxRows,
      bootstrapClaimRows,
      auditRows,
    ]) => ({
      domains: [
        {
          category: 'account' as const,
          displayName: 'Account profiles',
          reason: 'Optional profile information owned by people.',
          rowCount: countValue(profileRows),
          tableName: 'account_profile',
          visibility: 'safe-count' as const,
        },
        {
          category: 'authentication' as const,
          displayName: 'Accounts',
          reason: 'Authentication provider records can contain credential material.',
          rowCount: null,
          tableName: 'account',
          visibility: 'security-hidden' as const,
        },
        {
          category: 'security' as const,
          displayName: 'Authentication rate limits',
          reason: 'Rate-limit state is hidden to avoid aiding abuse analysis.',
          rowCount: null,
          tableName: 'rate_limit',
          visibility: 'security-hidden' as const,
        },
        {
          category: 'authentication' as const,
          displayName: 'Passkeys',
          reason: 'WebAuthn credential identifiers and keys are security-sensitive.',
          rowCount: null,
          tableName: 'passkey',
          visibility: 'security-hidden' as const,
        },
        {
          category: 'authentication' as const,
          displayName: 'People',
          reason:
            'Application user records, shown only through purpose-built support views.',
          rowCount: countValue(userRows),
          tableName: 'user',
          visibility: 'safe-count' as const,
        },
        {
          category: 'authentication' as const,
          displayName: 'Sessions',
          reason: 'Session tokens and device metadata are security-sensitive.',
          rowCount: null,
          tableName: 'session',
          visibility: 'security-hidden' as const,
        },
        {
          category: 'authentication' as const,
          displayName: 'Verification records',
          reason: 'Verification values include one-time security tokens.',
          rowCount: null,
          tableName: 'verification',
          visibility: 'security-hidden' as const,
        },
        {
          category: 'delivery' as const,
          displayName: 'Failed queue events',
          reason: 'Operational failures awaiting investigation.',
          rowCount: countValue(failedQueueRows),
          tableName: 'failed_queue_event',
          visibility: 'safe-count' as const,
        },
        {
          category: 'delivery' as const,
          displayName: 'Processed queue events',
          reason: 'Idempotency receipts for completed queue work.',
          rowCount: countValue(processedQueueRows),
          tableName: 'processed_queue_events',
          visibility: 'safe-count' as const,
        },
        {
          category: 'delivery' as const,
          displayName: 'Transactional outbox messages',
          reason:
            'Durable records for workflows that require transactional event delivery.',
          rowCount: countValue(outboxRows),
          tableName: 'transactional_outbox_messages',
          visibility: 'safe-count' as const,
        },
        {
          category: 'delivery' as const,
          displayName: 'Workflow audit receipts',
          reason: 'Confirmation receipts for completed workflow side effects.',
          rowCount: countValue(workflowReceiptRows),
          tableName: 'profile_update_audit_receipt',
          visibility: 'safe-count' as const,
        },
        {
          category: 'security' as const,
          displayName: 'Administrator bootstrap claim',
          reason:
            'The singleton record that secures the first administrator assignment.',
          rowCount: countValue(bootstrapClaimRows),
          tableName: 'admin_bootstrap_claim',
          visibility: 'safe-count' as const,
        },
        {
          category: 'operations' as const,
          displayName: 'Administrator activity',
          reason: 'Immutable records of safe administrative outcomes.',
          rowCount: countValue(auditRows),
          tableName: 'admin_audit_event',
          visibility: 'safe-count' as const,
        },
        {
          category: 'security' as const,
          displayName: 'Service accounts',
          reason:
            'Machine credential digests and lifecycle state are security-sensitive.',
          rowCount: null,
          tableName: 'service_account',
          visibility: 'security-hidden' as const,
        },
      ],
    }),
  ),
)

export const listAccountProfilesForAdminDataCatalogFromDatabase = Effect.tryPromise({
  try: () =>
    db
      .select({
        accountId: accountProfiles.accountId,
        bio: accountProfiles.bio,
        updatedAt: accountProfiles.updatedAt,
      })
      .from(accountProfiles)
      .orderBy(desc(accountProfiles.updatedAt))
      .limit(50),
  catch: (cause) => new AdminReadError({ cause }),
}).pipe(Effect.map((recentProfiles) => ({ recentProfiles })))

export const listFailedQueueEventsForAdminDataCatalogFromDatabase = Effect.tryPromise({
  try: () =>
    db
      .select({
        consumerName: failedQueueEvents.consumerName,
        deliveryCount: failedQueueEvents.deliveryCount,
        failedAt: failedQueueEvents.failedAt,
        failureCode: failedQueueEvents.failureCode,
        messageId: failedQueueEvents.messageId,
      })
      .from(failedQueueEvents)
      .orderBy(desc(failedQueueEvents.failedAt))
      .limit(50),
  catch: (cause) => new AdminReadError({ cause }),
}).pipe(Effect.map((recentEvents) => ({ recentEvents })))

export const listWorkflowReceiptsForAdminDataCatalogFromDatabase = Effect.tryPromise({
  try: () =>
    db
      .select({
        correlationId: profileUpdateAuditReceipts.correlationId,
        eventId: profileUpdateAuditReceipts.eventId,
        recordedAt: profileUpdateAuditReceipts.recordedAt,
        subjectId: profileUpdateAuditReceipts.subjectId,
      })
      .from(profileUpdateAuditReceipts)
      .orderBy(desc(profileUpdateAuditReceipts.recordedAt))
      .limit(50),
  catch: (cause) => new AdminReadError({ cause }),
}).pipe(Effect.map((recentReceipts) => ({ recentReceipts })))

export const listAdminActivityForAdminActivityScreenFromDatabase = (
  input: AdminPaginatedSearchInput,
) =>
  Effect.tryPromise({
    try: () => {
      const { cursor } = input
      return db
        .select({
          action: adminAuditEvents.action,
          actorUserId: adminAuditEvents.actorUserId,
          correlationId: adminAuditEvents.correlationId,
          createdAt: adminAuditEvents.createdAt,
          id: adminAuditEvents.id,
          outcome: adminAuditEvents.outcome,
          subjectUserId: adminAuditEvents.subjectUserId,
          targetId: adminAuditEvents.targetId,
          targetKind: adminAuditEvents.targetKind,
        })
        .from(adminAuditEvents)
        .where(
          and(
            cursor === undefined
              ? undefined
              : or(
                  lt(adminAuditEvents.createdAt, cursor.createdAt),
                  and(
                    eq(adminAuditEvents.createdAt, cursor.createdAt),
                    lt(adminAuditEvents.id, cursor.id),
                  ),
                ),
            input.query === undefined
              ? undefined
              : ilike(adminAuditEvents.action, `%${input.query}%`),
          ),
        )
        .orderBy(desc(adminAuditEvents.createdAt), desc(adminAuditEvents.id))
        .limit(51)
    },
    catch: (cause) => new AdminReadError({ cause }),
  }).pipe(
    Effect.map((rows) => ({
      events: rows.slice(0, 50),
      nextCursor:
        rows.length === 51 && rows[49] !== undefined
          ? { createdAt: rows[49].createdAt, id: rows[49].id }
          : null,
    })),
  )
