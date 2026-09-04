import { z } from 'zod'

/**
 * Queue payloads carry identifiers, not profile fields. Consumers resolve the
 * current data they need without copying personal data into infrastructure.
 */
export const accountProfileUpdatedTopic = 'account-profile-updated'

export const accountProfileUpdatedEventSchema = z
  .object({
    eventId: z.uuid(),
    type: z.literal('account.profile-updated'),
    schemaVersion: z.literal(1),
    occurredAt: z.iso.datetime(),
    correlationId: z.uuid(),
    subjectId: z.string().min(1).max(128),
  })
  .strict()
