import 'server-only'

import { eq } from 'drizzle-orm'
import { FatalError } from 'workflow'
import { start } from 'workflow/api'
import { z } from 'zod'

import { db } from '~/db/client'
import { accountProfileUpdatedEventSchema } from '~/queues/account-profile-updated'
import { profileUpdateAuditReceipts } from '~/workflows/schema'

type AccountProfileUpdatedEvent = z.infer<typeof accountProfileUpdatedEventSchema>

type ProfileUpdateAuditReceipt = Readonly<{
  eventId: string
  subjectId: string
  correlationId: string
  recordedAt: string
}>

/** Orchestrate durable steps here; keep I/O inside step functions. */
export async function profileUpdateAuditWorkflow(
  event: AccountProfileUpdatedEvent,
): Promise<ProfileUpdateAuditReceipt> {
  'use workflow'

  const receipt = await createProfileUpdateAuditReceipt(event)
  await writeProfileUpdateAuditReceipt(receipt)
  return receipt
}

async function createProfileUpdateAuditReceipt(
  event: AccountProfileUpdatedEvent,
): Promise<ProfileUpdateAuditReceipt> {
  'use step'

  return {
    eventId: event.eventId,
    subjectId: event.subjectId,
    correlationId: event.correlationId,
    recordedAt: event.occurredAt,
  }
}

async function writeProfileUpdateAuditReceipt(
  receipt: ProfileUpdateAuditReceipt,
): Promise<void> {
  'use step'

  await db
    .insert(profileUpdateAuditReceipts)
    .values({ ...receipt, recordedAt: new Date(receipt.recordedAt) })
    .onConflictDoNothing({ target: profileUpdateAuditReceipts.eventId })

  const [persisted] = await db
    .select({
      correlationId: profileUpdateAuditReceipts.correlationId,
      subjectId: profileUpdateAuditReceipts.subjectId,
    })
    .from(profileUpdateAuditReceipts)
    .where(eq(profileUpdateAuditReceipts.eventId, receipt.eventId))

  if (
    persisted === undefined ||
    persisted.correlationId !== receipt.correlationId ||
    persisted.subjectId !== receipt.subjectId
  ) {
    throw new FatalError(`Conflicting audit receipt for event ${receipt.eventId}`)
  }
}

export const vercelProfileUpdateWorkflowStarter = {
  start: (event: AccountProfileUpdatedEvent) =>
    start(profileUpdateAuditWorkflow, [event]),
}
