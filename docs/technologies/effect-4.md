# Effect 4

Effect 4 is used for meaningful side effects and operational composition—not as
a replacement for simple pure TypeScript. Keep it at service, adapter, worker,
and application-edge boundaries; pure domain transformations remain plain,
inferred functions.

## Service pattern

1. Define a small capability with `Context.Service` for one external concern.
2. Give expected failures tagged, typed error variants with safe metadata.
3. Build a live adapter as a Layer; compose it at the route/worker runtime edge.
   Keep unrelated vendor layers in separate runtimes so imports stay narrow.
4. Keep the use case linear: obtain service, perform one purpose, map failure,
   return domain output.
5. Tests supply controlled Layers and assert observable outcome.

## Adapter default

| Concern          | Mandatory default                                                            |
| ---------------- | ---------------------------------------------------------------------------- |
| Deadline         | Explicit timeout suitable for the vendor/use case.                           |
| Retry            | Transient failures only; three total attempts, exponential backoff + jitter. |
| Mutations        | Retry only with a vendor/business idempotency key.                           |
| Cancellation     | Preserve caller cancellation; do not create detached work.                   |
| Vendor direction | Respect `Retry-After` where supplied.                                        |
| Visibility       | Log operation, attempt, elapsed time, safe vendor status, correlation ID.    |

Ask the user only when recovery policy changes value or an irreversible business
outcome. The recommended default is the policy above.

## Links

[Effect service architecture](../architecture/effect-services.md) · [Errors](../architecture/errors-observability.md) · [Async platform](async-platform.md)
