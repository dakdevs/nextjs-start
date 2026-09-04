<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# nextjs-start agent guide

Run `bun run verify` before handoff. It is the canonical quality gate; do not
silence warnings because this repository has no warning tier.

## Critical invariants

- Start a feature with its current-truth document in `docs/features/` and update
  it with its code. Follow [the feature workflow](docs/guides/feature-workflow.md).
- Keep one oRPC operation purpose-built for one consumer contract. Do not add
  optional modes merely to reuse a procedure; see [BFF contracts](docs/architecture/bff-orpc.md).
- Expose every meaningful user-facing read/action to browser WebMCP, or record a
  specific exemption in the feature document; see [WebMCP](docs/architecture/webmcp.md).
- Validate at external entry points only; carry inferred types downstream. See
  [type-flow guidance](.agents/skills/preserve-type-flow/SKILL.md).
- Unknown failures show “Something went wrong” plus a correlation ID. Typed,
  safe errors may be actionable. See [error handling](docs/guides/error-handling.md).
- Keep route-local UI in its adjacent `_modules`; promote only when every
  consumer benefits from shared evolution. See [frontend organization](docs/architecture/frontend-organization.md).

## Map

- [Documentation map](docs/README.md) — canonical product, architecture, technology, and decision records.
- [Design system](docs/design-system/README.md) — starting visual language and evolution workflow.
- [Testing strategy](docs/reference/testing-strategy.md) — independent-oracle and happy-path rules.
- [Change impact](docs/reference/change-impact.md) — files and docs to update by change type.
