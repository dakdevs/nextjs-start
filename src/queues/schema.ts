import {
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

/** Durable at-least-once delivery state, scoped to each named consumer. */
export const processedQueueEvents = pgTable(
  'processed_queue_events',
  {
    consumerName: text('consumer_name').notNull(),
    eventId: uuid('event_id').notNull(),
    claimId: uuid('claim_id').notNull().defaultRandom(),
    status: text('status').notNull().default('processing'),
    claimedAt: timestamp('claimed_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => [
    primaryKey({ columns: [table.consumerName, table.eventId] }),
    index('processed_queue_events_claimed_at_idx').on(table.claimedAt),
    check(
      'processed_queue_events_status_check',
      sql`${table.status} in ('processing', 'completed', 'failed')`,
    ),
  ],
)

/** Sanitized terminal failures retained because Vercel Queues has no native DLQ. */
export const failedQueueEvents = pgTable(
  'failed_queue_event',
  {
    consumerName: text('consumer_name').notNull(),
    messageId: text('message_id').notNull(),
    eventId: uuid('event_id'),
    correlationId: uuid('correlation_id'),
    failureCode: text('failure_code').notNull(),
    deliveryCount: integer('delivery_count').notNull(),
    failedAt: timestamp('failed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.consumerName, table.messageId] })],
)
