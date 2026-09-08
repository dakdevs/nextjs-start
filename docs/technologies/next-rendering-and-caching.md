# Next.js rendering and caching

Prefer a useful static shell, cacheable public content, and small request-time
islands. Keep page/layout functions synchronous unless they genuinely need to
await before rendering. An `async` function is not inherently dynamic or slow;
do not replace clear async code with promise chains merely to remove the keyword.

## Check the active model first

The starter currently does **not** enable `cacheComponents` in `next.config.ts`.
It therefore uses Next.js's previous caching model. The Cache Components path
below is the recommended architecture for adopting mixed static/cached/dynamic
pages, not a claim that partial prerendering is already enabled.

Before implementing caching, read the installed guides under
`node_modules/next/dist/docs/01-app/`: `01-getting-started/08-caching.md`,
`02-guides/caching-without-cache-components.md`, and the relevant API reference.
Next.js versions and flags change behavior; do not mix the two models.

## Classify each section

| Content                                                 | Default implementation                                                                                               |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Authored public copy, deterministic layout              | Synchronous Server Component; imported content; no artificial I/O or cache layer.                                    |
| Public remote/DB content with accepted staleness        | Purpose-built cached read; explicit freshness/invalidation policy and safe projection.                               |
| Session, authorization, personalized account/admin data | Uncached server read inside the appropriate protected boundary; never shared by default.                             |
| Public but must be fresh for correctness                | Uncached async child with a useful Suspense fallback; validate authoritative state again for mutations.              |
| User interaction or editable form                       | Small client module with oRPC/Query and shared TanStack Form; do not move initial public content to a client effect. |

Record the classification in the feature document. Metadata, JSON-LD, Markdown,
social images, and indexes must have compatible freshness and visibility.

## Page hierarchy and Suspense

Keep shared navigation and independently useful static content outside waiting
regions. Place the read **inside** the component below the boundary: awaiting
it in the parent and then wrapping its output cannot stream the wait.

```text
Synchronous page/layout shell
├── static title/navigation/content
├── cached public section (when the active model supports it)
└── Suspense: stable, accessible section fallback
    └── async route-local module: await request/data here
        ├── resolved primary content
        └── nested Suspense only for independently useful slower content
```

- Keep async children in adjacent `_modules`, promoting only for genuinely
  shared evolution. Pass the typed `params`/`searchParams` promise down when
  only that section needs it; await it inside its boundary.
- Use `loading.tsx` for a segment transition; use inline Suspense for independent
  sections. A segment loading boundary does not cover a parent layout's await.
- Group data that must appear consistently together. Do not wrap every tiny
  component or conceal the entire useful page behind one generic spinner.
- Start independent I/O together at the narrowest safe owner. Preserve real
  dependencies such as authorization before a privileged query; no speculative
  private work outside the guard just to parallelize it.
- Preserve shell geometry, heading context, focus, and accessible loading text.
  Suspense is not an error boundary, a cache, or a mechanism for effect-based
  fetches to suspend. Follow the normal safe-error/correlation-ID path.
- A protected subtree may wait as a unit. Never stream sensitive titles, counts,
  children, or fallback copy before authorization. Recheck at the data boundary.

## Current model: static rendering and ISR

Static public pages without request-time dependencies may prerender even when
their data function is async. Explicitly cache eligible fetches with
`cache: 'force-cache'` and/or `next: { revalidate, tags }` as appropriate; default
fetch behavior is not a persistence promise. For database functions use the
installed `unstable_cache` API only in this model, with explicit keys, lifetime,
and tags around the public purpose-built read—not around the whole repository.

Use `generateStaticParams` for deliberately selected public dynamic paths, and
document behavior for unknown paths. Route `revalidate` applies in this model;
`cookies`, `headers`, and other request-time work can prevent full-route static
caching. Suspense can stream such a route, but does not make its shell a CDN
partial prerender. Do not use `output: 'export'` for this authenticated oRPC app.

## Adopting Cache Components

Enable `cacheComponents: true` as an explicit migration, not a drive-by flag.
Read the installed migration and authentication guides, inspect every route and
layout, preserve Vercel's Bun selection, and verify production builds/navigation.
Remove incompatible legacy route cache settings rather than mixing models.

With it enabled, use `use cache` plus explicit `cacheLife`/`cacheTag` for safe
public functions/components. Runtime APIs and uncached async work live below
Suspense, leaving static/cached content in the prerendered shell. Never add
file-wide caching to an auth or transport module. Runtime keys include arguments
and captures; no session tokens, raw email, or secrets in either keys or tags.

The default runtime `use cache` store is per-instance and ephemeral on serverless;
it is not a promise of a durable cross-instance hit. Only introduce
`use cache: remote` with a verified Vercel cache handler, expected hit rate, cost,
and invalidation contract. `use cache: private` is not the starter's default or
a shortcut around revocation/logout freshness requirements.

On installed Next.js 16.3, unknown-param shell upgrades also depend on Partial
Prefetching configuration. Verify that flag's guide before promising the behavior;
do not blanket-prefetch every link or generate every database row at build time.

## Verification

Inspect `next build`'s actual route classification. Test cold and warm requests,
navigation, stale refresh, exact invalidation, failure recovery, and cross-user
isolation with independent fixtures. Use production mode: development/HMR caching
is not evidence of production freshness. Measure response and section arrival,
not only perceived speed or a successful build.

[Cache invalidation](next-cache-invalidation.md) · [Data policy](../architecture/data-and-caching.md) · [Next caching](https://nextjs.org/docs/app/getting-started/caching) · [Previous model](https://nextjs.org/docs/app/guides/caching-without-cache-components)
