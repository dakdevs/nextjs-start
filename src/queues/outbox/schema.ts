import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

/**
 * Optional outbox table. Do not add it to the default feature path: opt in
 * only when a committed Postgres write and the emitted event cannot diverge.
 */
export const transactionalOutboxMessages = pgTable(
  'transactional_outbox_messages',
  {
    id: uuid('id').primaryKey(),
    topic: text('topic').notNull(),
    eventId: uuid('event_id').notNull().unique(),
    payload: jsonb('payload').notNull(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    failedAt: timestamp('failed_at', { withTimezone: true }),
    isPublished: boolean('is_published').notNull().default(false),
  },
  (table) => [index('transactional_outbox_unpublished_idx').on(table.isPublished)],
)
