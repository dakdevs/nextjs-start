<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# nextjs-start agent guide

This blueprint is mandatory across the product, website, and application for
every feature, change, refactor, and maintenance task. It is not an optional
example. Start by reading the local
[`build-product` skill](.agents/skills/build-product/SKILL.md), then load the
guides and skills it selects before acting. If the host does not auto-discover
repository skills, open the files directly. Do not re-ask settled decisions.

Run `bun run verify` before handoff. It is the canonical quality gate; do not
silence warnings because this repository has no warning tier.

Require braces for every arrow-function body and all control-flow bodies,
including callbacks and tests. Neither lint overrides nor framework exceptions
may relax `arrow-body-style: always` or `curly: all`.

## Critical invariants

- Start a feature with its current-truth document in `docs/features/` and update
  it with its code. Follow [the feature workflow](docs/guides/feature-workflow.md).
- Keep one oRPC operation purpose-built for one consumer contract. Do not add
  optional modes merely to reuse a procedure; see [BFF contracts](docs/architecture/bff-orpc.md).
- Expose every meaningful user-facing read/action to browser WebMCP, or record a
  specific exemption in the feature document; see [WebMCP](docs/architecture/webmcp.md).
- Give every meaningful textual result a useful Markdown page or bounded index,
  or record a specific exemption. Classify it as Markdown plus index, Markdown
  without index, index-only overview, authenticated scoped Markdown, or exempt;
  see [agent-readable content](docs/technologies/agent-readable-content.md).
- Validate at external entry points only; carry inferred types downstream. See
  [type-flow guidance](.agents/skills/preserve-type-flow/SKILL.md).
- Unknown failures show “Something went wrong” plus a correlation ID. Typed,
  safe errors may be actionable. See [error handling](docs/guides/error-handling.md).
- Keep route-local UI in its adjacent `_modules`; promote only when every
  consumer benefits from shared evolution. See [frontend organization](docs/architecture/frontend-organization.md).
- Build every application form with the shared `useAppForm`, `AppField`, and
  `AppForm` layer. TanStack Form owns form behavior; configured ShadCN/Base UI
  owns controls. This includes search and filter inputs; `nuqs` may publish URL
  state but does not replace the form layer. Do not import direct TanStack form
  factories or another form library; see [application forms](docs/architecture/forms.md).
- Follow [agent feature delivery](docs/guides/agent-feature-delivery.md): grill,
  document, build, independently test, manually check desktop and mobile,
  self-review with applicable local skills, and pass `bun run verify`.
- After creating or materially changing UI, run the read-only
  [`find-animation-opportunities`](.agents/skills/find-animation-opportunities/SKILL.md)
  scout. Its report may recommend no changes; implement motion only within the
  user's UI task and [motion language](docs/design-system/motion.md).
- Push back on a concrete harmful outcome; respect harmless preferences and
  apply settled safe defaults automatically. See [protecting the product](docs/guides/protecting-the-product.md).

## Map

- [Build product skill](.agents/skills/build-product/SKILL.md) — mandatory entry point and task-to-guide routing; automatically applicable to repository product work.

- [Documentation map](docs/README.md) — canonical product, architecture, technology, and decision records.
- [Design system](docs/design-system/README.md) — starting visual language and evolution workflow.
- [Motion language](docs/design-system/motion.md) — purposeful motion and the automatic post-UI scout.
- [Testing strategy](docs/reference/testing-strategy.md) — independent-oracle and happy-path rules.
- [Local development services](docs/guides/local-development-services.md) — Docker and test-container rules for new dependencies.
- [Change impact](docs/reference/change-impact.md) — files and docs to update by change type.
- [Agent-readable content](docs/technologies/agent-readable-content.md) — negotiated
  public Markdown, discovery indexes, authorization parity, and test rules.
- [Application forms](docs/architecture/forms.md) — typed composition, control
  integration, and the canonical example.
- [Let's Start](.agents/skills/lets-start/SKILL.md) — fresh-clone setup and first-product discovery.
- [Product-building router](docs/guides/building-the-product.md) — the concise,
  mandatory decision matrix for every task.
- [Search discovery](docs/guides/search-discovery-workflow.md) — mandatory for applicable public content; private content never enters public discovery.
- [Page metadata and social images](docs/technologies/page-metadata-and-social-images.md) — every route's safe head, share-image, and JSON-LD contract.
- [Rendering and caching](docs/technologies/next-rendering-and-caching.md) — choose the active Next.js model and record freshness before adding I/O.
- [React Doctor](docs/technologies/react-doctor.md) — full score-100, fail-closed quality gate.
