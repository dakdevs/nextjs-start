# Documentation map

These pages are the project’s current truth. Update the smallest relevant page
with the implementation; do not keep research journals or handoff transcripts.
Every authored Markdown file stays under 150 lines.

Agents start with the local [`build-product` skill](../.agents/skills/build-product/SKILL.md).
It routes tasks into these canonical guides; read selected guidance before work,
and update the owning skill route whenever a new guide is introduced.

## Product

- [Authentication](features/authentication.md)
- [Account profile](features/account-profile.md)
- [Admin operations](features/admin-operations.md)
- [Agent-readable content](features/agent-readable-content.md)
- [Writing feature documents](guides/writing-feature-docs.md)
- [Feature delivery workflow](guides/feature-workflow.md)
- [Agent feature delivery](guides/agent-feature-delivery.md)
- [Product-building router](guides/building-the-product.md)
- [Protecting the product](guides/protecting-the-product.md)
- [Search delivery workflow](guides/search-discovery-workflow.md)

## Architecture

- [Architecture map](architecture/README.md)
- [Purpose-built BFF contracts](architecture/bff-orpc.md)
- [Effect services](architecture/effect-services.md)
- [Browser WebMCP](architecture/webmcp.md)
- [Background work](architecture/background-work.md)
- [Frontend organization](architecture/frontend-organization.md)
- [Application forms](architecture/forms.md)
- [Data and caching](architecture/data-and-caching.md)
- [Authentication and authorization](architecture/authentication-authorization.md)
- [Admin security](architecture/admin-security.md)
- [Errors and observability](architecture/errors-observability.md)

## Technology and quality

- [Technology map](technologies/README.md)
- [Preview and beta risk policy](technologies/preview-risk.md)
- [Runtime configuration](technologies/runtime-configuration.md)
- [Next.js, Bun, and Vercel](technologies/next-bun-vercel.md)
- [Agent-readable content](technologies/agent-readable-content.md)
- [Vercel platform services](technologies/vercel-platform-services.md)
- [oRPC](technologies/orpc.md)
- [Effect 4](technologies/effect-4.md)
- [Postgres and Drizzle](technologies/postgres-drizzle.md)
- [Better Auth, passkeys, and Resend](technologies/auth-email.md)
- [Browser WebMCP](technologies/browser-webmcp.md)
- [Queues, workflows, and outbox](technologies/async-platform.md)
- [UI and state](technologies/ui-and-state.md)
- [TanStack Form](technologies/tanstack-form.md)
- [Technical SEO](technologies/search-engine-optimization.md)
- [Generative engine optimization](technologies/generative-engine-optimization.md)
- [Page metadata and social images](technologies/page-metadata-and-social-images.md)
- [Next.js rendering and caching](technologies/next-rendering-and-caching.md)
- [Cache lifetime and invalidation](technologies/next-cache-invalidation.md)
- [React Doctor](technologies/react-doctor.md)
- [Type flow and tooling](technologies/type-flow-tooling.md)
- [Design system](design-system/README.md)
- [Typography](design-system/typography.md)
- [Design-system evolution](design-system/evolution.md)
- [Motion and interaction language](design-system/motion.md)
- [Animation-opportunity scout](../.agents/skills/find-animation-opportunities/SKILL.md)
- [Brand-matched dither imagery](design-system/dither-images.md)
- [Social-image design](design-system/social-images.md)
- [Testing strategy](reference/testing-strategy.md)
- [Local development services](guides/local-development-services.md)
- [Working agreement](reference/working-agreement.md)
- [Change impact](reference/change-impact.md)
- [Component sourcing](reference/component-sourcing.md)
- [UI library selection](reference/ui-library-selection.md)
- [Error handling](guides/error-handling.md)
- [Search verification](reference/search-verification.md)

## Decisions

- [Decision index](decisions/README.md)
- [Initial architecture](decisions/0001-initial-architecture.md)
- [Purpose-built BFF and browser WebMCP](decisions/0002-purpose-built-bff-and-webmcp.md)
- [Direct queue delivery by default](decisions/0003-async-delivery-default.md)
- [Restrained four-role typography scale](decisions/0004-restrained-typography-scale.md)
- [Transactional admin bootstrap and narrow operations](decisions/0005-admin-bootstrap-and-boundaries.md)
