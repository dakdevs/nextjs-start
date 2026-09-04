# Postgres and Drizzle

Postgres is the durable source of truth. Drizzle is the typed persistence
boundary and migration tool; it is not a permission system or a generic
repository generator.

## Rules

- A repository method answers one use-case-shaped query or command. Select the
  exact fields the contract renders or consumes.
- Authorization belongs in the use case. Never accept an account ID simply
  because the client says it owns the resource; derive actor scope from session.
- Commit generated migrations with schema changes. Exercise them against a
  disposable real Postgres instance, not a SQL mock.
- Give Vercel a provider pooler URL that explicitly requires TLS. Postgres.js is
  capped at three connections per function instance, closes idle connections
  after 20 seconds, rotates them after 10 minutes, and disables prepared
  statements for transaction-pooler compatibility.
- Use a transaction when one local invariant spans multiple writes. Use the
  optional outbox only when a committed change and asynchronous event must not
  diverge.
- Cache authenticated data only after documenting scope, freshness,
  invalidation owner, and isolation. The default is no cache.
- Preserve transaction/concurrency integration coverage when changing pool or
  lease settings; the queue claim race test exercises concurrent real queries.

## Query decision matrix

| Consumer need                                                        | Repository response               |
| -------------------------------------------------------------------- | --------------------------------- |
| Account page with four displayed fields                              | A four-field account projection.  |
| Different table columns/filter/sort semantics                        | A separate purpose-built query.   |
| Entity update plus local audit row                                   | One transaction.                  |
| Entity update plus non-critical background notification              | Commit then direct queue publish. |
| Entity update plus non-divergent entitlement/payment/inventory event | Transactional outbox pattern.     |

## Links

[Data and caching](../architecture/data-and-caching.md) · [Queues/outbox](async-platform.md) · [Testing strategy](../reference/testing-strategy.md)
