# Local development services

Add a local container only when a feature has a real external dependency and
the container preserves enough of the production protocol to test meaningful
behavior. The owning feature document names the need, production provider,
local substitute, failure behavior, and cleanup path before implementation.

## Placement

| Need                                     | Location                         | Rule                                                                                                                                    |
| ---------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Long-running opt-in developer dependency | Root `compose.yaml`              | One named service, pinned image, health check, loopback-only port, and named volume only when state must survive restarts.              |
| Integration, workflow, or E2E dependency | `tooling/test/with-<service>.ts` | Start a disposable container per run, publish to a dynamic loopback port, wait for readiness, inject its URL, and stop it in `finally`. |
| Unit-test dependency                     | In-memory layer or test double   | Model the typed boundary; do not start Docker for a unit test.                                                                          |
| Vendor-specific hosted behavior          | Real sandbox/test account        | Do not claim a generic container proves provider behavior it cannot reproduce.                                                          |

Never make every developer start an optional service. Give optional Compose
services profiles, and make the feature's targeted command start only what its
test path needs. The canonical `bun run verify` must remain isolated and
repeatable from a clean machine with Docker available.

## Service defaults

| Capability                                                    | Production                        | Local development and tests                                                                                                                                    |
| ------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Relational data                                               | Neon Postgres                     | `postgres:17-alpine`; use the existing disposable Postgres harness in tests.                                                                                   |
| Redis protocol for a documented distributed need              | Upstash Redis                     | Pinned official Redis-compatible image; prove TTL, serialization, invalidation, and outage behavior without treating it as durable truth.                      |
| Email delivery                                                | Resend through Vercel Marketplace | Existing ignored development mailbox; use Resend's real test path for provider integration checks.                                                             |
| Object storage, queues, workflows, payments, or external APIs | Approved Vercel/vendor service    | Prefer the provider's official local mode or sandbox. If none exists, test the Effect adapter contract locally and keep a separate provider integration check. |

Redis is never added preemptively. Document why process memory or Postgres is
insufficient before adding it. Email never requires a local SMTP container in
this starter because the development mailbox already makes messages inspectable
without accidental delivery.

## Container requirements

1. Pin an explicit image version; do not use `latest`.
2. Bind published ports to `127.0.0.1`. Test harnesses request a dynamic host
   port instead of assuming a fixed one.
3. Add a real readiness probe and a bounded wait. Startup logs are not readiness.
4. Put URLs and credentials through the typed environment boundary. Use only
   obvious local/test credentials and never reuse production secrets.
5. Give each test run a collision-resistant container name and its own database,
   namespace, or key prefix.
6. Stop disposable containers in `finally`, including after failures. Provide a
   documented command for removing any persistent developer volume.
7. Test one success path and the meaningful service boundary: unavailable,
   timeout, retry/idempotency, or stale data as applicable. Avoid tautological
   tests against the same implementation.
8. Update `.env.example`, runtime validation, `README.md` when setup changes,
   the owning feature document, and the change-impact manifest.

## Adoption workflow

1. Confirm the feature cannot use an existing service or simpler local state.
2. Choose the production provider first, then verify local protocol parity.
3. Add the smallest Effect service interface and production adapter.
4. Add the local/test container path and an independently observed integration
   test; do not leak Docker details into domain code.
5. Exercise cold start, readiness, cleanup, and concurrent test runs.
6. Run `bun run verify` and document any behavior that still requires the real
   provider's sandbox.

## Links

[Vercel platform services](../technologies/vercel-platform-services.md) · [Effect services](../architecture/effect-services.md) · [Testing strategy](../reference/testing-strategy.md) · [Runtime configuration](../technologies/runtime-configuration.md) · [Change impact](../reference/change-impact.md)
