# Next.js, Bun, and Vercel

Use the current Next.js App Router as one deployable application. Bun is the
package manager, task runner, and the Vercel runtime choice—do not make the
browser or domain model depend on Bun-specific APIs.

## Delivery rules

- Prefer Server Components for initial, authenticated reads and thin route
  composition. Client Components own interactivity and remote query state.
- Route handlers are transport edges: establish context, call an operation, map
  safe failure, and finish. Keep business rules outside them.
- Deploy only to Vercel. Configure Bun on Vercel; local developer tools may use
  Bun but must not simulate a second hosting platform.
- Read configuration through the typed environment module. Validate it in build
  and deployment; never scatter `process.env` access.
- Check the installed Next documentation before changing Next APIs—the major
  version intentionally changes conventions quickly.
- Keep `bun run typecheck` self-contained: run `next typegen` first so a fresh
  clone has route-aware `PageProps`, `LayoutProps`, and typed-link definitions.

## Decision matrix

| Need                      | Choice                                                 |
| ------------------------- | ------------------------------------------------------ |
| Initial page data         | Server Component through the server oRPC client.       |
| Interactive remote data   | Client oRPC + TanStack Query.                          |
| Browser-only state        | Local state, URL state, or Jotai by the state guide.   |
| Long-running/durable work | Vercel Workflow or Queue, never hold the request open. |
| Secret/vendor access      | Server Effect adapter, never a Client Component.       |

## Links

[Runtime configuration](runtime-configuration.md) · [Frontend organization](../architecture/frontend-organization.md) · [Background work](../architecture/background-work.md)
