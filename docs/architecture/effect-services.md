# Effect services

Use Effect 4 RC deliberately at external and operational boundaries. Keep domain
logic readable and independent of framework details; do not add empty service
layers for pure local logic.

## Service shape

- Model expected failures as tagged, typed errors with safe messages.
- Define capabilities with `Context.Service` and compose concrete dependencies
  through layers close to the application edge.
- Give each external concern its own runtime edge. Do not merge email, queues,
  or future vendors into one global runtime that every operation must load.
- Keep a use case small and linear: acquire dependency, perform one purpose,
  map boundary failure, return its domain result.
- Run effects only in route/worker/adapter edges. Tests inject a controlled layer.

## Adapter policy

Every external API adapter declares timeout, retry eligibility, retry schedule,
idempotency behavior, and observability fields. Default retry policy is in
[error handling](../guides/error-handling.md). Do not retry a mutation unless an
idempotency key makes repetition safe.

## Avoid

- Hiding unrelated work inside a convenience service.
- Context-wide mutable singletons or framework imports in domain code.
- Generic catch-all errors that erase user-safe classification.
- Caching authenticated data by default; document public cache freshness and tags.
