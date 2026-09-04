import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

/** One externally observable audit outcome for each profile-update event. */
export const profileUpdateAuditReceipts = pgTable('profile_update_audit_receipt', {
  eventId: uuid('event_id').primaryKey(),
  subjectId: text('subject_id').notNull(),
  correlationId: uuid('correlation_id').notNull(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
