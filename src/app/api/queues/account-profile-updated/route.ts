import 'server-only'

import { Effect } from 'effect'

import { runAppEffect } from '~/effect/runtime'
import { AccountProfileUpdateWorkflow } from '~/queues/account-profile-updated-consumer'
import { accountProfileUpdatedQueueHandler } from '~/queues/account-profile-updated-handler'
import { FailedQueueEventStore } from '~/queues/failed-event-store'
import { ProcessedQueueEventStore } from '~/queues/idempotency'
import { postgresFailedQueueEventStore } from '~/queues/postgres-failed-event-store'
import {
  postgresProcessedQueueEventStore,
  processedQueueEventLeaseSeconds,
} from '~/queues/postgres-processed-event-store'
import { vercelQueueClient } from '~/queues/vercel-client'
import { vercelProfileUpdateWorkflowStarter } from '~/workflows/profile-update-audit'

/**
 * Vercel invokes this private callback endpoint; do not expose it as a public
 * application API. The Vercel callback signature and a durable event-ID claim
 * protect it against direct use and at-least-once delivery, respectively.
 */
export const POST = vercelQueueClient.handleCallback(
  async (message, metadata) => {
    await runAppEffect(
      accountProfileUpdatedQueueHandler.handle(message, metadata).pipe(
        // Dependencies remain at the route edge; consumer logic is pure.
        Effect.provideService(
          ProcessedQueueEventStore,
          postgresProcessedQueueEventStore,
        ),
        Effect.provideService(
          AccountProfileUpdateWorkflow,
          AccountProfileUpdateWorkflow.fromStarter(vercelProfileUpdateWorkflowStarter),
        ),
        Effect.provideService(FailedQueueEventStore, postgresFailedQueueEventStore),
      ),
    )
  },
  {
    visibilityTimeoutSeconds: processedQueueEventLeaseSeconds,
    retry: accountProfileUpdatedQueueHandler.retry,
  },
)
