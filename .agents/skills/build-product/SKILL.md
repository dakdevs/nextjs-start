---
name: build-product
description: Required entry point for product, website, and application work in this repository, including features, UI, forms, backend changes, fixes, refactors, reviews, and living documentation. Select and read the applicable repository guides before acting.
---

# Build the product

Use this skill at the start of repository product work, not only when asked to
build a large feature. These are the starter's working rules, not optional
examples. Keep automatic discovery enabled. If the host does not discover local
skills, open this file directly; never depend on a globally installed skill.

## Before acting

1. Read the nearest `AGENTS.md`, the owning `docs/features/` document, and the
   [product-building router](../../../docs/guides/building-the-product.md).
   For a new feature, create its current-truth page before implementation.
2. Classify the task with the matrix below. Read each selected guide completely,
   then follow its links when they govern the change. A link is a routing
   instruction, not a substitute for reading the policy. Skip unrelated topics.
   Do not recursively reload guidance already read for this task unless it changes.
3. Load the applicable local skills: [clean implementation](../clean-implementation/SKILL.md),
   [type flow](../preserve-type-flow/SKILL.md) for TypeScript,
   [test design](../avoid-tautological-tests/SKILL.md) for tests, and
   [living docs](../living-docs/SKILL.md) for current-truth changes.
4. Apply settled choices without another interview. Use
   [feature grilling](../feature-grilling/SKILL.md) only for unanswered decisions
   that change value, permissions, recovery, irreversible effects, or design
   language. Explain a concrete harmful outcome and offer a safer alternative
   using [product protection](../../../docs/guides/protecting-the-product.md).

## Select the relevant guides

| Work touches                                     | Read before implementation                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature intent, scope, happy path                | [Feature workflow](../../../docs/guides/feature-workflow.md), [feature writing](../../../docs/guides/writing-feature-docs.md)                                                                                                                                                                                                                              |
| UI, components, layout, input or state           | [UI/state](../../../docs/technologies/ui-and-state.md), [frontend ownership](../../../docs/architecture/frontend-organization.md), [design system](../../../docs/design-system/README.md), [component sourcing](../../../docs/reference/component-sourcing.md)                                                                                             |
| Any form, search, filter or editable field       | [Form architecture](../../../docs/architecture/forms.md), [TanStack composition](../../../docs/technologies/tanstack-form.md); use the shared form modules plus configured ShadCN/Base UI controls                                                                                                                                                         |
| Visual language or typography                    | [Typography](../../../docs/design-system/typography.md), [design evolution](../../../docs/design-system/evolution.md), [UI library selection](../../../docs/reference/ui-library-selection.md); preserve tonal hierarchy, four-size limit and balanced content text                                                                                        |
| UI just created or materially changed            | Run [find-animation-opportunities](../find-animation-opportunities/SKILL.md), then apply warranted recommendations within the UI task; no animation is a valid outcome                                                                                                                                                                                     |
| New or changed route, rendering or data loading  | [Next/Bun/Vercel](../../../docs/technologies/next-bun-vercel.md), [rendering/cache model](../../../docs/technologies/next-rendering-and-caching.md), [invalidation](../../../docs/technologies/next-cache-invalidation.md), [metadata](../../../docs/technologies/page-metadata-and-social-images.md)                                                      |
| Backend operation or consumer contract           | [BFF contracts](../../../docs/architecture/bff-orpc.md), [oRPC](../../../docs/technologies/orpc.md), [Effect services](../../../docs/architecture/effect-services.md), [Effect 4](../../../docs/technologies/effect-4.md)                                                                                                                                  |
| External service, retries, timeout or failure    | [Effect 4](../../../docs/technologies/effect-4.md), [error handling](../../../docs/guides/error-handling.md), [observability](../../../docs/architecture/errors-observability.md)                                                                                                                                                                          |
| Data model, SQL, cache or migration              | [Postgres/Drizzle](../../../docs/technologies/postgres-drizzle.md), [data policy](../../../docs/architecture/data-and-caching.md)                                                                                                                                                                                                                          |
| Durable work, queues or workflows                | [Background architecture](../../../docs/architecture/background-work.md), [async platform](../../../docs/technologies/async-platform.md); direct queues by default, outbox only for the documented need                                                                                                                                                    |
| Login, access, passkeys, email or administration | [Auth architecture](../../../docs/architecture/authentication-authorization.md), [auth/email](../../../docs/technologies/auth-email.md); also [admin security](../../../docs/architecture/admin-security.md) for privileged operations                                                                                                                     |
| User-facing read or action                       | [Browser WebMCP architecture](../../../docs/architecture/webmcp.md), [browser integration](../../../docs/technologies/browser-webmcp.md); record parity or a specific exemption                                                                                                                                                                            |
| Meaningful readable content                      | [Agent-readable content](../../../docs/technologies/agent-readable-content.md); classify Markdown/index exposure and preserve authorization                                                                                                                                                                                                                |
| Public page, metadata, JSON-LD or discovery      | [Search workflow](../../../docs/guides/search-discovery-workflow.md), [SEO](../../../docs/technologies/search-engine-optimization.md), [GEO](../../../docs/technologies/generative-engine-optimization.md), [metadata](../../../docs/technologies/page-metadata-and-social-images.md), [social-image design](../../../docs/design-system/social-images.md) |
| Environment, vendor or deployment setup          | [Runtime configuration](../../../docs/technologies/runtime-configuration.md), [Vercel services](../../../docs/technologies/vercel-platform-services.md), [local Docker services](../../../docs/guides/local-development-services.md), [preview risk](../../../docs/technologies/preview-risk.md)                                                           |
| Tests, quality tools or handoff                  | [Testing](../../../docs/reference/testing-strategy.md), [tooling defaults](../../../docs/technologies/type-flow-tooling.md), [React Doctor](../../../docs/technologies/react-doctor.md), [change impact](../../../docs/reference/change-impact.md)                                                                                                         |

For a guide not named here, use the [documentation map](../../../docs/README.md)
and [decision index](../../../docs/decisions/README.md). Read the relevant ADR
when considering a reversal. Installed Next.js documentation governs the active
version; do not silently substitute stale framework recipes.

Before changing lint configuration or resolving a host/Effect diagnostic,
read [Effect lint boundaries](../../../docs/technologies/effect-lint-boundaries.md).
Keep both brace rules mandatory; never expand the reviewed exceptions silently.

## Delivery and expected outcome

Follow [agent feature delivery](../../../docs/guides/agent-feature-delivery.md).
For implementation work, deliver the smallest coherent slice with purpose-built
contracts, appropriate UI/agent/content access, independent tests, current docs,
and the applicable manual desktop/mobile/reduced-motion checks. Run
`bun run verify`; no warnings, skipped checks, or fabricated passing scores.
Read-only reviews report evidence and do not authorize edits or publication.

Update the feature intent and technical/design truth with the code. When adding
or changing a guide, update this matrix or the owning skill's route so the next
agent can find it. Keep guidance canonical in `docs/`, actionable routing in
skills, and each Markdown file at 150 lines or fewer. Do not copy whole guides
into skills where they can drift.

If a required guide is missing or conflicts with a required framework contract,
state the gap, inspect authoritative evidence, and resolve the decision before
claiming compliance. Never weaken a gate or invent an exception silently.

The [Let's Start skill](../lets-start/SKILL.md) is explicitly invoked by the user
for onboarding. This skill must not auto-run onboarding, provision resources,
publish, or change repository visibility merely because it can find that skill.
