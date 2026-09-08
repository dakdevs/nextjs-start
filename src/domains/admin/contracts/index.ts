import { z } from 'zod'

import { adminContractBase } from '~/orpc/contract-base'
import { serviceAccountScope } from '~/db/schema'

const safeUser = z.object({
  createdAt: z.date(),
  email: z.email(),
  emailVerified: z.boolean(),
  id: z.string(),
  name: z.string(),
  role: z.enum(['user', 'admin']),
})

const safeServiceAccount = z.object({
  createdAt: z.date(),
  id: z.uuid(),
  lastUsedAt: z.date().nullable(),
  name: z.string(),
  revokedAt: z.date().nullable(),
  rotatedAt: z.date().nullable(),
  scopes: z.array(z.enum(serviceAccountScope)),
  tokenPrefix: z.string(),
})
const auditReference = z.object({ correlationId: z.uuid(), id: z.uuid() })
const safeProfile = z.object({
  accountId: z.string(),
  bio: z.string(),
  updatedAt: z.date(),
})
const safeFailedQueueEvent = z.object({
  consumerName: z.string(),
  deliveryCount: z.number().int(),
  failedAt: z.date(),
  failureCode: z.string(),
  messageId: z.string(),
})
const safeWorkflowReceipt = z.object({
  correlationId: z.uuid(),
  eventId: z.uuid(),
  recordedAt: z.date(),
  subjectId: z.string(),
})
const adminPaginationCursor = z.strictObject({
  createdAt: z.date(),
  id: z.string().min(1),
})

export const adminPaginatedSearchInputSchema = z.strictObject({
  cursor: adminPaginationCursor.optional(),
  query: z.string().trim().max(100).optional(),
})

export const requestPasswordResetForAdminUserSupportInputSchema = z.strictObject({
  userId: z.string().min(1),
})

export const createServiceAccountForAdminServiceAccountsInputSchema = z.strictObject({
  name: z.string().trim().min(1).max(100),
  scopes: z.array(z.enum(serviceAccountScope)).min(1).max(1),
})

export const serviceAccountIdForAdminServiceAccountsInputSchema = z.strictObject({
  serviceAccountId: z.uuid(),
})

export const adminContracts = {
  getAdminHomeSummaryForAdminHome: adminContractBase.input(z.strictObject({})).output(
    z.object({
      activeServiceAccountCount: z.number().int().nonnegative(),
      administratorCount: z.number().int().nonnegative(),
      userCount: z.number().int().nonnegative(),
    }),
  ),
  listUsersForAdminUserSupport: adminContractBase
    .input(adminPaginatedSearchInputSchema)
    .output(
      z.object({
        nextCursor: adminPaginationCursor.nullable(),
        users: z.array(safeUser),
      }),
    ),
  requestPasswordResetForAdminUserSupport: adminContractBase
    .input(requestPasswordResetForAdminUserSupportInputSchema)
    .output(z.object({ audit: auditReference, requested: z.literal(true) })),
  listServiceAccountsForAdminServiceAccounts: adminContractBase
    .input(z.strictObject({}))
    .output(z.object({ serviceAccounts: z.array(safeServiceAccount) })),
  createServiceAccountForAdminServiceAccounts: adminContractBase
    .input(createServiceAccountForAdminServiceAccountsInputSchema)
    .output(
      z.object({
        audit: auditReference,
        serviceAccount: safeServiceAccount,
        token: z.string().min(1),
      }),
    ),
  rotateServiceAccountForAdminServiceAccounts: adminContractBase
    .input(serviceAccountIdForAdminServiceAccountsInputSchema)
    .output(
      z.object({
        audit: auditReference,
        serviceAccount: safeServiceAccount,
        token: z.string().min(1),
      }),
    ),
  revokeServiceAccountForAdminServiceAccounts: adminContractBase
    .input(serviceAccountIdForAdminServiceAccountsInputSchema)
    .output(z.object({ audit: auditReference, revoked: z.literal(true) })),
  getDataCatalogForAdminDataCatalog: adminContractBase.input(z.strictObject({})).output(
    z.object({
      domains: z.array(
        z.object({
          category: z.enum([
            'account',
            'authentication',
            'delivery',
            'operations',
            'security',
          ]),
          displayName: z.string(),
          reason: z.string(),
          rowCount: z.number().int().nonnegative().nullable(),
          tableName: z.string(),
          visibility: z.enum(['safe-count', 'security-hidden']),
        }),
      ),
    }),
  ),
  listAccountProfilesForAdminDataCatalog: adminContractBase
    .input(z.strictObject({}))
    .output(z.object({ recentProfiles: z.array(safeProfile) })),
  listFailedQueueEventsForAdminDataCatalog: adminContractBase
    .input(z.strictObject({}))
    .output(z.object({ recentEvents: z.array(safeFailedQueueEvent) })),
  listWorkflowReceiptsForAdminDataCatalog: adminContractBase
    .input(z.strictObject({}))
    .output(z.object({ recentReceipts: z.array(safeWorkflowReceipt) })),
  listAdminActivityForAdminActivityScreen: adminContractBase
    .input(adminPaginatedSearchInputSchema)
    .output(
      z.object({
        events: z.array(
          z.object({
            action: z.string(),
            actorUserId: z.string().nullable(),
            correlationId: z.uuid(),
            createdAt: z.date(),
            id: z.uuid(),
            outcome: z.string(),
            subjectUserId: z.string().nullable(),
            targetId: z.string(),
            targetKind: z.string(),
          }),
        ),
        nextCursor: adminPaginationCursor.nullable(),
      }),
    ),
}
