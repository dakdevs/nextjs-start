# Vercel platform services

Vercel is the complete hosting target. Use its CLI and Marketplace to keep
deployment, project linkage, managed services, and environment delivery simple.
All external provisioning and preview/production deployment require explicit
user confirmation.

## Baseline

- Ask the user to run `vercel login` only when the CLI is not authenticated.
- Link the local repository to its Vercel project after confirmation.
- Use Neon Postgres through Vercel Marketplace as the default managed database.
  Pull linked environment values without printing them; validate locally through
  the typed environment module.
- Bun is the Vercel runtime choice. Browser WebMCP is the only WebMCP target.
- Complete the first verified administrator login through controlled access
  before an unclaimed production deployment becomes public.

## Service decision matrix

| Need                                                             | Default                                  | When to introduce it                                                                                       |
| ---------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Durable relational application data                              | Neon Postgres                            | Every production application in this template.                                                             |
| Shared cache / distributed rate limit / lock / ephemeral counter | Upstash Redis through Vercel Marketplace | Only after documenting the shared cross-instance need, ownership, TTL, invalidation, and failure behavior. |
| Per-request local state or authenticated read                    | No Redis                                 | Keep it in request/process scope or Postgres as appropriate.                                               |
| AI model routing, provider management, and observability         | Vercel AI Gateway                        | The first time a product feature needs an AI provider; keep provider calls server-side.                    |
| Async fan-out or durable orchestration                           | Vercel Queue or Workflow                 | Follow the existing background-work policy.                                                                |

Redis is not a default database, session store, or cache layer. It is a specific
distributed coordination tool; retain Postgres as durable truth. Give every
introduced service a focused feature/architecture decision and real integration
test path.

## Safe CLI workflow

1. Verify authentication without exposing credentials.
2. Ask before linking, provisioning, adding an integration, pulling production
   values, or deploying.
3. Pull environment values into ignored local files; never print them.
4. Run environment validation and the relevant test/build gate before a preview
   or production deployment.
5. Treat preview and production as separate approvals and report the resulting
   URL only after the user-authorized command succeeds.

## Links

[Next.js, Bun, and Vercel](next-bun-vercel.md) · [Runtime configuration](runtime-configuration.md) · [Data and caching](../architecture/data-and-caching.md) · [Background work](../architecture/background-work.md)
