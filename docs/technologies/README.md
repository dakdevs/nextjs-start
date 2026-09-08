# Technology map

The starter pins exact versions for intentionally pre-stable integrations and
reviews them deliberately. [Preview risk policy](preview-risk.md) is the source
of truth for upgrade and rollback expectations.

| Technology                 | Role                                                        |
| -------------------------- | ----------------------------------------------------------- |
| Next.js App Router + React | Application shell and rendering.                            |
| Bun                        | Package manager, task runner, and Vercel runtime selection. |
| oRPC                       | Contract-first BFF transport.                               |
| Effect 4 RC                | Typed side-effect composition at boundaries.                |
| Better Auth + Resend       | Single-account authentication and production email.         |
| Postgres + Drizzle         | Durable storage and typed queries/migrations.               |
| Vercel Queues + Workflows  | Background events and durable orchestration.                |
| Browser WebMCP             | In-browser agent capability discovery and execution.        |
| Agent-readable content     | Negotiated public Markdown and bounded discovery indexes.   |
| Tailwind + ShadCN          | Token-based accessible UI primitives and styling.           |
| TanStack Form              | Typed application form behavior and composition.            |
| Search and GEO             | Truthful public discovery and answer-engine readiness.      |
| Page metadata and sharing  | Safe route heads, social previews, and factual JSON-LD.     |
| Next.js rendering/caching  | Explicit rendering, freshness, and invalidation contracts.  |
| React Doctor               | Fail-closed React quality auditing.                         |

## Focused operating guides

- [Next.js, Bun, and Vercel](next-bun-vercel.md)
- [Agent-readable content](agent-readable-content.md)
- [Vercel platform services](vercel-platform-services.md)
- [Local development services](../guides/local-development-services.md)
- [oRPC](orpc.md) · [Effect 4](effect-4.md) · [Postgres and Drizzle](postgres-drizzle.md)
- [Better Auth, passkeys, and Resend](auth-email.md)
- [Browser WebMCP](browser-webmcp.md) · [Queues, workflows, and outbox](async-platform.md)
- [UI and state](ui-and-state.md) · [Type flow and tooling](type-flow-tooling.md)
- [TanStack Form](tanstack-form.md)
- [Technical SEO](search-engine-optimization.md) · [GEO](generative-engine-optimization.md)
- [Page metadata and social images](page-metadata-and-social-images.md)
- [Next.js rendering and caching](next-rendering-and-caching.md) · [cache lifetime and invalidation](next-cache-invalidation.md)
- [React Doctor](react-doctor.md)
- [Effect lint boundaries](effect-lint-boundaries.md)
