# Architecture map

The starter is a single Next.js App Router application. Platform shells live at
the top level; each business domain owns its contracts, use cases, services,
repositories, schemas, and tests. Root registries compose; they do not hold
business rules.

## Boundaries

- [Purpose-built BFF contracts](bff-orpc.md) — oRPC is contract-first and one consumer/use case per operation.
- [Effect services](effect-services.md) — side effects are typed, layered, and run at edges.
- [Browser WebMCP](webmcp.md) — capabilities are route-scoped, manifest-backed, and human-safe.
- [Background work](background-work.md) — direct queue publishing, idempotent consumers, and durable workflows.
- [Frontend organization](frontend-organization.md) — local-first components and deliberate promotion.
- [Data and caching](data-and-caching.md) — exact Drizzle access and conservative cache rules.
- [Authentication and authorization](authentication-authorization.md) — Better Auth's
  single-account session boundary and explicit role checks.
- [Admin security](admin-security.md) — transactional bootstrap, safe data
  visibility, human-confirmed credentials, and audit boundaries.
- [Errors and observability](errors-observability.md) — safe user recovery and
  searchable, structured failure records.
- [Security headers](security-headers.md) — the static-rendering CSP baseline
  and the threshold for moving an application to request nonces.

Use [the feature workflow](../guides/feature-workflow.md) to apply these
boundaries incrementally.
