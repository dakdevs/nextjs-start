# Background work

Use Vercel Queues for asynchronous events/fan-out/concurrency and Vercel
Workflows for durable multistep orchestration. Both are platform boundaries with
Effect services beneath them.

## Default pattern

Publish directly to a queue after non-critical work. Consumers are idempotent:
queues are at-least-once, not FIFO, and may redeliver. Give retryable mutations
an idempotency key, record consumer/event identity, and use the adapter retry
policy. A duplicate must preserve the external outcome, not merely avoid a throw.

For this starter, a processed-event claim has three observable results:

- `claimed`: this delivery owns a 300-second, claim-ID-fenced lease.
- `completed`: acknowledge because the consumer outcome already exists.
- `in-progress`: throw so Vercel redelivers; never treat active work as complete.

The database and Vercel visibility leases use the same duration. A crashed lease
can be reclaimed, while the claim ID prevents its stale worker from completing
or releasing the replacement lease.

## Workflow pattern

Start a workflow when steps must survive request lifetimes, pause, retry, or
coordinate several durable actions. Keep workflow bodies to orchestration and
place platform/npm work inside steps. Treat every step as retryable. Workflow
start has no caller-supplied run ID or AbortSignal, so a timeout can hide an
accepted start. Use the event ID at the workflow's external sink; the profile
example inserts one immutable audit receipt per event and rejects conflicting
reuse. Duplicate runs therefore converge on one outcome.

## Terminal failure policy

Vercel Queues has no native dead-letter queue. Permanent failures are attempted
three times; transient failures and active-lease collisions are attempted up to
twelve deliveries with capped backoff. On the terminal attempt, the async
handler must persist a sanitized quarantine row and emit a structured log with
message, event, and correlation IDs plus safe cause class, provider code/status,
retryability, and delivery count before returning success for acknowledgement.
Never store a rejected payload or arbitrary provider response. If quarantine
persistence fails, throw and keep the message retryable rather than acknowledging
an unrecorded loss.

## Optional outbox

The core does not require a transactional outbox. Adopt its optional module only
when a committed Postgres change and queued event must never diverge, such as
payments, entitlements, or inventory. Document the business invariant and
operational owner before adding it.

## Retention and ownership

Durable does not mean permanent by default:

- `processed_queue_events` is operational deduplication state. Keep completed or
  failed rows at least beyond the provider’s maximum redelivery window; the
  recommended initial policy is 30 days, then prune in bounded batches.
- `failed_queue_event` is an operator inbox. A named feature owner must inspect,
  replay or dismiss each record. Retain unresolved failures; add resolution
  fields and choose a post-resolution retention period before production launch.
- `profile_update_audit_receipt` is immutable product audit data. Retention is a
  product/compliance decision documented by the feature; never include it in a
  generic operational cleanup job.
- Optional outbox rows remain until publication is proven. Never age out pending
  or failed rows silently; published rows may use a documented bounded retention.

The starter intentionally does not schedule a universal cleanup workflow:
product ownership and compliance needs are not yet known. Every application
must name the operator, retention window, alert, and deletion job when it adopts
an asynchronous feature.

## Completion check

Every consumer can safely repeat a message, observes failures with correlation
context, has a bounded poison-event path, and has a documented decision for
direct publish versus outbox.
