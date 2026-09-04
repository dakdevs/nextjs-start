# Queues, workflows, and optional outbox

Use Vercel Queues for asynchronous event delivery/fan-out and Vercel Workflows
for durable multistep orchestration. The default is direct queue publish after a
successful non-critical change; each consumer is idempotent because delivery is
at least once.

## Select the smallest durable mechanism

| Need                                           | Choice                         | Expected outcome                          |
| ---------------------------------------------- | ------------------------------ | ----------------------------------------- |
| Request-bound short work                       | Complete it synchronously.     | Immediate user result.                    |
| Independent retryable follow-up                | Direct Vercel Queue publish.   | Idempotent consumer can redeliver safely. |
| Pauses, multi-step retries, long orchestration | Vercel Workflow.               | Durable state outside request lifetime.   |
| DB change and event must never diverge         | Optional transactional outbox. | Dispatcher emits committed events safely. |

## Invariants

- Put an event ID and consumer identity in idempotency storage; a duplicate must
  produce the same external outcome, not merely avoid a thrown error.
- Workers validate their event boundary, log correlation/event IDs, and obey the
  shared timeout/retry policy. Treat workflow steps as retryable.
- Match the Postgres processing lease to the queue visibility timeout. Return
  completed, in-progress, and newly claimed states separately; fence completion
  with the claim ID so an expired worker cannot overwrite its replacement.
- The Queue and Workflow start SDKs do not expose AbortSignal support. Effect
  deadlines bound how long this caller waits, not the underlying request. Stable
  event IDs make late acceptance and the three total attempts safe.
- Retry permanent delivery failures three times and retry transient/active work
  at most twelve deliveries. Before terminal acknowledgement, persist only safe
  identifiers and failure classification to `failed_queue_event`, then log those
  identifiers with safe cause class, provider code/status, retryability, and
  attempt/delivery count. Never log payloads or arbitrary provider responses.
  Failed quarantine storage must retry.
- Workflow starts can be accepted when their response is lost. Every workflow
  with side effects needs an event-ID idempotent sink; this starter's audit table
  accepts one immutable outcome and detects conflicting event-ID reuse.
- Keep orchestration in the workflow and vendor/domain work in focused steps or
  Effect services.
- The outbox is not mandatory boilerplate. Adopt it only for documented critical
  invariants such as payments, entitlements, or inventory, with an operational
  owner and recovery plan.

## Links

[Background-work architecture](../architecture/background-work.md) · [Postgres/Drizzle](postgres-drizzle.md) · [Effect 4](effect-4.md)
