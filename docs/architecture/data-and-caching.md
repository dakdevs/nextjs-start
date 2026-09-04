# Data and caching

Postgres is the durable application store and Drizzle is its typed persistence
boundary. Repositories answer one use-case-shaped query or command at a time;
they do not return broad records for callers to trim later.

## Data rules

- Store migrations with the application and exercise them against disposable real
  Postgres in integration tests.
- Select exact columns for the operation’s consumer. Keep authorization scope in
  the use case, not caller-supplied account identifiers.
- Treat schema and migration changes as product-impacting when they affect a
  feature’s value, recovery, or operational invariant.

## Cache rules

Authenticated and user-specific data is uncached by default. Cache only public,
stable reads with an explicit freshness period, tags, invalidation owner, and
test isolation plan. Never introduce a blanket repository or Effect cache.

## Decision matrix

| Question                                                       | Decision                                                    |
| -------------------------------------------------------------- | ----------------------------------------------------------- |
| Is the response user-specific or authorization-dependent?      | Do not cache by default.                                    |
| Is it public, stable, and expensive enough to justify a cache? | Document freshness, tags, invalidation, and stale behavior. |
| Does a mutation affect cached data?                            | Invalidate the exact tags/queries it changes.               |
| Is data needed by a different page shape?                      | Make a purpose-built query/operation.                       |
