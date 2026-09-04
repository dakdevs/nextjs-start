import { start } from 'workflow/api'
import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '~/db/client'
import { profileUpdateAuditWorkflow } from '~/workflows/profile-update-audit'
import { profileUpdateAuditReceipts } from '~/workflows/schema'

const event = {
  eventId: '0f936c71-6bbb-4268-bd7d-5b38fdfab734',
  type: 'account.profile-updated' as const,
  schemaVersion: 1 as const,
  occurredAt: '2026-09-04T12:00:00.000Z',
  correlationId: '4e2ebf2f-9d4f-4e14-b157-527c2073703b',
  subjectId: 'user_123',
}

describe('profile update audit workflow', () => {
  beforeEach(async () => {
    await db.delete(profileUpdateAuditReceipts)
  })

  it('persists one deterministic outcome for duplicate workflow starts', async () => {
    const [first, second] = await Promise.all([
      start(profileUpdateAuditWorkflow, [event]),
      start(profileUpdateAuditWorkflow, [event]),
    ])
    const receipts = await Promise.all([first.returnValue, second.returnValue])

    expect(receipts).toEqual([
      {
        eventId: event.eventId,
        correlationId: event.correlationId,
        subjectId: event.subjectId,
        recordedAt: event.occurredAt,
      },
      {
        eventId: event.eventId,
        correlationId: event.correlationId,
        subjectId: event.subjectId,
        recordedAt: event.occurredAt,
      },
    ])

    await expect(db.select().from(profileUpdateAuditReceipts)).resolves.toEqual([
      expect.objectContaining({
        eventId: event.eventId,
        correlationId: event.correlationId,
        subjectId: event.subjectId,
        recordedAt: new Date(event.occurredAt),
      }),
    ])
  })

  it('rejects reuse of an event ID for a different audit outcome', async () => {
    const first = await start(profileUpdateAuditWorkflow, [event])
    await first.returnValue

    const conflicting = await start(profileUpdateAuditWorkflow, [
      { ...event, subjectId: 'different_user' },
    ])

    await expect(conflicting.returnValue).rejects.toThrow(
      `Conflicting audit receipt for event ${event.eventId}`,
    )
    await expect(db.select().from(profileUpdateAuditReceipts)).resolves.toEqual([
      expect.objectContaining({
        eventId: event.eventId,
        subjectId: event.subjectId,
      }),
    ])
  })
})
