# Error handling and observability

Errors preserve safety and user trust before diagnostic detail.

## User-facing policy

| Error kind                              | UI message                                                  | Logging                                                |
| --------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| Known, safe, actionable                 | Explain the next action plainly.                            | Structured event with correlation ID.                  |
| Validation/authentication/authorization | Explain the safe constraint without leaking protected data. | Structured event; avoid secrets.                       |
| Unknown or unsafe                       | “Something went wrong” and an error ID.                     | Structured error, cause, request context, and same ID. |

Generate a UUID for each unexpected failure. The UI displays it so support can
find the exact event in Vercel logs. Never show stacks, credentials, raw vendor
responses, or internal authorization details.

## External service defaults

Effect adapters set a timeout and classify failures. Retry only transient,
idempotent reads or operations protected by an idempotency key: three total
attempts, exponential backoff with jitter, cancellation support, and
`Retry-After` respect. Ask the product owner only when retry/recovery changes a
user-visible or business outcome.

Some vendor SDKs do not expose cancellation. In those adapters, the Effect
timeout bounds only the caller's wait. Resend, Queue, and Workflow operations
therefore use stable idempotency keys so late vendor acceptance is safe; keep
this exception explicit beside the adapter.

## Completion check

Each boundary turns failures into typed domain-safe errors where possible; edge
handlers log once with correlation context; tests assert behavior rather than
logging implementation.
