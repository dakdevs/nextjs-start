import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'

import { eq, sql } from 'drizzle-orm'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { accountRole } from '~/auth/roles'
import { auth } from '~/auth/auth'
import { db } from '~/db/client'
import {
  adminAuditEvents,
  adminBootstrapClaims,
  serviceAccounts,
  sessions,
  users,
} from '~/db/schema'
import {
  authenticateServiceAccountForSystemHealth,
  getDataCatalogForAdminDataCatalogFromDatabase,
} from '~/domains/admin/server/admin-repository'
import {
  createServiceAccountForAdminServiceAccounts,
  requestPasswordResetForAdminUserSupport,
  revokeServiceAccountForAdminServiceAccounts,
  rotateServiceAccountForAdminServiceAccounts,
} from '~/domains/admin/server/admin-service'
import { runAppEffect } from '~/effect/runtime'
import { GET as serviceHealth } from '~/app/api/service/health/route'

const person = (label: string, emailVerified = true) => ({
  email: `${label}-${randomUUID()}@example.test`,
  emailVerified,
  id: `${label}_${randomUUID()}`,
  name: label,
})

const sessionFor = (userId: string) => ({
  expiresAt: new Date('2027-09-05T00:00:00.000Z'),
  id: `session_${randomUUID()}`,
  token: `token_${randomUUID()}`,
  userId,
})

const adminMigrationPath = new URL(
  '../../../../drizzle/0001_admin_reference.sql',
  import.meta.url,
)

async function removeAdminReferenceSchema() {
  await db.execute(
    sql.raw('drop trigger if exists session_admin_bootstrap on "session"'),
  )
  await db.execute(
    sql.raw('drop trigger if exists user_admin_role_promotion_guard on "user"'),
  )
  await db.execute(
    sql.raw('drop trigger if exists admin_audit_event_immutable on admin_audit_event'),
  )
  await db.execute(
    sql.raw('drop function if exists claim_first_verified_session_admin()'),
  )
  await db.execute(sql.raw('drop function if exists guard_admin_role_promotion()'))
  await db.execute(
    sql.raw('drop function if exists prevent_admin_audit_event_mutation()'),
  )
  await db.execute(
    sql.raw(
      'drop table if exists admin_audit_event, admin_bootstrap_claim, service_account',
    ),
  )
}

async function applyAdminReferenceMigration() {
  const migration = await readFile(adminMigrationPath, 'utf8')
  const statements = migration
    .split('--> statement-breakpoint')
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0)

  await db.transaction(async (transaction) => {
    for (const statement of statements) {
      await transaction.execute(sql.raw(statement))
    }
  })
}

async function createAdministrator() {
  const administrator = person('administrator')
  await db.insert(users).values(administrator)
  await db.insert(sessions).values(sessionFor(administrator.id))
  return administrator
}

describe('admin reference PostgreSQL boundaries', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  beforeEach(async () => {
    await db.execute(sql`truncate table "user" cascade`)
  })

  it('reconciles one pre-bootstrap admin and keeps a later member from claiming admin', async () => {
    await removeAdminReferenceSchema()

    const existingAdministrator = {
      ...person('existing-administrator'),
      role: accountRole.admin,
    }
    const laterMember = person('later-member')
    await db.insert(users).values([existingAdministrator, laterMember])

    await applyAdminReferenceMigration()

    await expect(
      db
        .select({ adminUserId: adminBootstrapClaims.adminUserId })
        .from(adminBootstrapClaims),
    ).resolves.toEqual([{ adminUserId: existingAdministrator.id }])

    await db.insert(sessions).values(sessionFor(laterMember.id))

    await expect(
      db.select({ id: users.id }).from(users).where(eq(users.role, accountRole.admin)),
    ).resolves.toEqual([{ id: existingAdministrator.id }])
  })

  it('stops an ambiguous pre-bootstrap administrator upgrade', async () => {
    await removeAdminReferenceSchema()

    const firstAdministrator = {
      ...person('first-existing-administrator'),
      role: accountRole.admin,
    }
    const secondAdministrator = {
      ...person('second-existing-administrator'),
      role: accountRole.admin,
    }
    await db.insert(users).values([firstAdministrator, secondAdministrator])

    await expect(applyAdminReferenceMigration()).rejects.toThrow(
      'admin bootstrap migration is ambiguous',
    )

    await db
      .update(users)
      .set({ role: accountRole.user })
      .where(eq(users.id, secondAdministrator.id))
    await applyAdminReferenceMigration()
  })

  it('rolls back the administrator claim when the qualifying session does not commit', async () => {
    const candidate = person('rolled-back')
    await db.insert(users).values(candidate)

    await expect(
      db.transaction(async (transaction) => {
        await transaction.insert(sessions).values(sessionFor(candidate.id))
        throw new Error('Rollback the qualifying session')
      }),
    ).rejects.toThrow('Rollback the qualifying session')

    await expect(db.select().from(adminBootstrapClaims)).resolves.toEqual([])
    await expect(
      db.select({ role: users.role }).from(users).where(eq(users.id, candidate.id)),
    ).resolves.toEqual([{ role: accountRole.user }])
  })

  it('does not deliver a reset email when writing its immutable audit event fails', async () => {
    const target = person('password-reset-target')
    await db.insert(users).values(target)
    const delivery = vi.spyOn(auth.api, 'requestPasswordReset')

    await expect(
      runAppEffect(
        requestPasswordResetForAdminUserSupport({
          actorUserId: 'missing-administrator',
          correlationId: randomUUID(),
          userId: target.id,
        }),
      ),
    ).rejects.toMatchObject({ _tag: 'AdminWriteError' })

    expect(delivery).not.toHaveBeenCalled()
  })

  it('atomically gives one concurrent verified session the global administrator claim', async () => {
    const first = person('first')
    const second = person('second')
    await db.insert(users).values([first, second])

    await Promise.all([
      db.insert(sessions).values(sessionFor(first.id)),
      db.insert(sessions).values(sessionFor(second.id)),
    ])

    const administrators = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.role, accountRole.admin))
    expect(administrators).toHaveLength(1)
    expect([first.id, second.id]).toContain(administrators[0]?.id)
    await expect(db.select().from(adminBootstrapClaims)).resolves.toHaveLength(1)
    const bootstrapEvents = await db
      .select({ subjectUserId: adminAuditEvents.subjectUserId })
      .from(adminAuditEvents)
      .where(eq(adminAuditEvents.action, 'admin.bootstrap.claimed'))
    expect(bootstrapEvents).toHaveLength(1)
    expect(bootstrapEvents[0]?.subjectUserId).toMatch(/^(first|second)_/u)
  })

  it('stores only a digest and makes rotated and revoked service credentials unusable', async () => {
    const administrator = await createAdministrator()

    const created = await runAppEffect(
      createServiceAccountForAdminServiceAccounts({
        actorUserId: administrator.id,
        correlationId: randomUUID(),
        name: 'Health monitor',
        scopes: ['system:health:read'],
      }),
    )
    const [stored] = await db
      .select({ digest: serviceAccounts.tokenDigest, scopes: serviceAccounts.scopes })
      .from(serviceAccounts)
      .where(eq(serviceAccounts.id, created.serviceAccount.id))

    expect(Object.keys(created.serviceAccount)).not.toContain('tokenDigest')
    expect(stored?.digest).not.toBe(created.token)
    expect(stored?.scopes).toEqual(['system:health:read'])
    await expect(
      runAppEffect(authenticateServiceAccountForSystemHealth(created.token)),
    ).resolves.toBeUndefined()

    const rotated = await runAppEffect(
      rotateServiceAccountForAdminServiceAccounts({
        actorUserId: administrator.id,
        correlationId: randomUUID(),
        serviceAccountId: created.serviceAccount.id,
      }),
    )
    await expect(
      runAppEffect(authenticateServiceAccountForSystemHealth(created.token)),
    ).rejects.toMatchObject({ _tag: 'ServiceAccountUnauthorizedError' })
    await expect(
      runAppEffect(authenticateServiceAccountForSystemHealth(rotated.token)),
    ).resolves.toBeUndefined()

    await runAppEffect(
      revokeServiceAccountForAdminServiceAccounts({
        actorUserId: administrator.id,
        correlationId: randomUUID(),
        serviceAccountId: created.serviceAccount.id,
      }),
    )
    await expect(
      runAppEffect(authenticateServiceAccountForSystemHealth(rotated.token)),
    ).rejects.toMatchObject({ _tag: 'ServiceAccountUnauthorizedError' })
    await expect(
      serviceHealth(
        new Request('http://localhost:3100/api/service/health', {
          headers: { authorization: `Bearer ${rotated.token}` },
        }),
      ),
    ).resolves.toMatchObject({ status: 401 })
  })

  it('exposes only the curated data catalog rather than reflective database data', async () => {
    const catalog = await runAppEffect(getDataCatalogForAdminDataCatalogFromDatabase)

    expect(catalog.domains).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'authentication',
          tableName: 'user',
          visibility: 'safe-count',
        }),
        expect.objectContaining({
          category: 'security',
          rowCount: null,
          tableName: 'service_account',
          visibility: 'security-hidden',
        }),
      ]),
    )
    const safeCounts = catalog.domains.filter(
      (domain) => domain.visibility === 'safe-count',
    )
    const hiddenCounts = catalog.domains.filter(
      (domain) => domain.visibility === 'security-hidden',
    )
    expect(safeCounts.every((domain) => Number.isInteger(domain.rowCount))).toBe(true)
    expect(hiddenCounts.every((domain) => domain.rowCount === null)).toBe(true)
    expect(JSON.stringify(catalog)).not.toContain('token_digest')
  })

  it('explicitly classifies every persisted application table', async () => {
    const catalog = await runAppEffect(getDataCatalogForAdminDataCatalogFromDatabase)
    const tables = await db.execute<{ table_name: string }>(sql`
      select table_name from information_schema.tables
      where table_schema = 'public' and table_type = 'BASE TABLE'
        and table_name <> '__drizzle_migrations'
    `)

    const classified = new Set(catalog.domains.map((domain) => domain.tableName))
    expect(tables.map((table) => table.table_name).toSorted()).toEqual(
      [...classified].toSorted(),
    )
  })
})
