# Documentation map

These pages are the project’s current truth. Update the smallest relevant page
with the implementation; do not keep research journals or handoff transcripts.
Every authored Markdown file stays under 150 lines.

## Product

- [Authentication](features/authentication.md)
- [Account profile](features/account-profile.md)
- [Writing feature documents](guides/writing-feature-docs.md)
- [Feature delivery workflow](guides/feature-workflow.md)

## Architecture

- [Architecture map](architecture/README.md)
- [Purpose-built BFF contracts](architecture/bff-orpc.md)
- [Effect services](architecture/effect-services.md)
- [Browser WebMCP](architecture/webmcp.md)
- [Background work](architecture/background-work.md)
- [Frontend organization](architecture/frontend-organization.md)
- [Data and caching](architecture/data-and-caching.md)
- [Authentication and authorization](architecture/authentication-authorization.md)
- [Errors and observability](architecture/errors-observability.md)

## Technology and quality

- [Technology map](technologies/README.md)
- [Preview and beta risk policy](technologies/preview-risk.md)
- [Runtime configuration](technologies/runtime-configuration.md)
- [Next.js, Bun, and Vercel](technologies/next-bun-vercel.md)
- [oRPC](technologies/orpc.md)
- [Effect 4](technologies/effect-4.md)
- [Postgres and Drizzle](technologies/postgres-drizzle.md)
- [Better Auth, passkeys, and Resend](technologies/auth-email.md)
- [Browser WebMCP](technologies/browser-webmcp.md)
- [Queues, workflows, and outbox](technologies/async-platform.md)
- [UI and state](technologies/ui-and-state.md)
- [Type flow and tooling](technologies/type-flow-tooling.md)
- [Design system](design-system/README.md)
- [Design-system evolution](design-system/evolution.md)
- [Testing strategy](reference/testing-strategy.md)
- [Change impact](reference/change-impact.md)
- [Component sourcing](reference/component-sourcing.md)
- [Error handling](guides/error-handling.md)

## Decisions

- [Decision index](decisions/README.md)
- [Initial architecture](decisions/0001-initial-architecture.md)
- [Purpose-built BFF and browser WebMCP](decisions/0002-purpose-built-bff-and-webmcp.md)
- [Direct queue delivery by default](decisions/0003-async-delivery-default.md)
