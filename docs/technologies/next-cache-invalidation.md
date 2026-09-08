# Cache lifetime and invalidation

Read [rendering and the active cache model](next-rendering-and-caching.md) first.
Caching is a consistency decision. Fast, incorrect, or cross-user data is not a
successful optimization. Public cached reads must keep one consumer contract.

## Required cache contract

Record in the owning feature: safe projection, key inputs, storage layer,
freshness allowance, maximum acceptable stale behavior, invalidating mutations,
tag/path owner, failure behavior, client refresh path, and tests. Ask a product
question only when stale data could change a person's decision or cause harm.
Ordinary editorial content may tolerate delay; permissions, payment/entitlement
decisions, one-time secrets, and inventory writes require authoritative checks.

Distinguish these layers; invalidating one does not automatically refresh all:

| Layer                           | Purpose and caution                                                                    |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| React `cache`                   | Deduplicates matching work within server rendering; not a persistent TTL cache.        |
| Next server data/function cache | Reuses a selected result; model-specific lifetime and invalidation.                    |
| Prerendered route/static shell  | Reuses rendered output; affected by the data it contains and active model.             |
| Client Router cache             | Reuses navigation payloads; refresh when the visible server result must change.        |
| TanStack Query                  | Client query state; invalidate/update exact consumer queries after a mutation.         |
| HTTP/CDN cache                  | Response reuse; explicit public-only policy, correct `Vary`, no session-specific body. |

## Cache Components lifetimes

Only after Cache Components is enabled, set `cacheLife` in each `use cache`
function/component. Do not hide it in a generic helper. Choose a built-in
profile matching the documented tolerance, or an explicit named policy.

| Property     | Meaning                                                                                                                                |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `stale`      | Client Router reuse time before checking the server; not the HTTP `stale-while-revalidate` directive.                                  |
| `revalidate` | After this age, a subsequent request may serve existing content and trigger background regeneration.                                   |
| `expire`     | After this age without refresh, the next request waits for fresh content rather than receiving stale output. Must exceed `revalidate`. |

Revalidation is demand-driven, not a polling timer or an exact refresh schedule.
Short profiles can exclude content from prerendering and require Suspense; read
the installed thresholds. An explicit outer lifetime can retain an inner
result longer than expected. Avoid nested caches without a clear consistency
need; inspect the effective outer behavior rather than assuming the shortest
inner TTL always wins. [cacheLife reference](https://nextjs.org/docs/app/api-reference/functions/cacheLife)

## After a successful mutation

1. Authorize and validate at the real entry boundary, commit the intended write,
   and derive affected identifiers from the trusted result.
2. Invalidate every affected public projection and index through its owner.
   Keep Next-specific invalidation in a server delivery adapter; domain services
   must not import `next/cache`.
3. Return the authoritative mutation result when the caller needs immediate
   confirmation. Update/invalidate its exact Query cache and refresh affected
   server UI when necessary; do not show stale data as proof of the write.
4. If write and invalidation diverge, preserve the committed-write truth in
   logs and user feedback. Make invalidation safely repeatable; use the approved
   queue/workflow policy for justified recovery, not a mandatory global outbox.

| Context/outcome                                        | API and semantics                                                                                                                |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Public content may serve stale while refreshing        | `revalidateTag(tag, 'max')` from an authorized server context/Route Handler. It marks stale; the next visit triggers refresh.    |
| A Route Handler/oRPC mutation requires next read fresh | `revalidateTag(tag, { expire: 0 })`; next read blocks. Return authoritative result and coordinate client caches too.             |
| A genuine Server Action needs read-your-own-writes     | `updateTag(tag)` is Action-only. Do not call it from an oRPC Route Handler or create a second mutation transport just to use it. |
| A specific route/layout output changed                 | Use `revalidatePath` deliberately in addition to data tags if required; it is not universal cross-route data invalidation.       |

Never use deprecated single-argument `revalidateTag(tag)` examples. Do not expose
an unauthenticated `GET ?tag=...` invalidator. Map verified webhook events to
allowlisted affected tags; validate signatures and replay behavior. Queue workers
need a supported invalidation adapter, not an assumed Next request context.
[revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) · [updateTag](https://nextjs.org/docs/app/api-reference/functions/updateTag)

## Safety and tests

- Authenticated reads remain uncached by default. User-ID keys alone do not
  solve authorization revocation, ownership changes, logout, or browser reuse.
- HTML, Markdown, JSON-LD, social images, and discovery indexes must not disagree
  indefinitely. Document shared tags or explicit per-projection invalidation.
  Existing negotiated Markdown remains `no-store` until its policy changes.
- A warm stale response is not enough proof: mutate the backing fixture, observe
  the allowed stale response, then verify eventual fresh content and unrelated
  keys remaining intact. Test immediate-expiry semantics separately.
- Test one clean browser mutation/read happy path. At lower seams cover failed
  refresh, unauthorized invalidation, cold misses, and cross-user boundaries.
- Never cache a generic error as valid content or turn stale fallback into an
  unbounded promise. Surface safe failures and correlation IDs consistently.

[Data and caching](../architecture/data-and-caching.md) · [Background work](../architecture/background-work.md) · [Agent-readable content](agent-readable-content.md)
