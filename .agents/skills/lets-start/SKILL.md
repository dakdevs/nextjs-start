---
name: lets-start
description: Explicitly bootstrap a fresh nextjs-start clone and establish its product direction. Use only when the user or copied bootstrap prompt invokes it; never select it automatically.
---

# Let's Start

This skill is explicit-only. Run it only when the user invokes `$lets-start` or
the copied README bootstrap prompt directs you to invoke it. Never select it
autonomously merely because a repository is new.

Use after this template has been cloned and before the first product feature is
built. It establishes a working local application, a durable product outline,
and the working agreement that later feature delivery follows. It is not a
shortcut around the [feature delivery workflow](../../../docs/guides/agent-feature-delivery.md).

## Establish repository and tool ownership

Before installing dependencies or changing code, ask one concise setup round for
the product working name/purpose, GitHub owner and repository name, public/private/
internal visibility, intended local directory, and Vercel account/team plus
existing-or-new project. Recommend private visibility unless the user intends an
open-source product. Do not infer an organization, visibility, or push target.

1. Verify Git, Bun, GitHub CLI, and Vercel CLI availability. Use `gh auth status`
   and `bunx vercel whoami` to verify authentication without exposing tokens.
   If installation or login is missing, give the official command, wait for the
   user's interactive completion, and verify again.
2. If no destination repository exists, use `gh repo create` with the
   `dakdevs/nextjs-start` template, `--clone`, and the user's exact `--private`,
   `--public`, or `--internal` choice. If already cloned, inspect
   `git remote -v` and `gh repo view`.
3. Never push, replace a remote, or change visibility until the user confirms the
   exact destination. Verify `origin` resolves to that destination afterward.
4. Update the package name, repository URL, README/app name, and metadata from
   starter identity to confirmed product identity; keep technology credits.
5. Resolve the Vercel scope and project up front. With explicit confirmation,
   run `bunx vercel link`; linking is not permission to provision or deploy.

## Establish the local baseline

1. Inspect `AGENTS.md`, `README.md`, `.env.example`, `docs/README.md`, and the
   current git status. Preserve user changes and learn the existing product
   truth before changing anything.
2. Confirm Bun is available, then run `bun install --frozen-lockfile`.
3. Check whether `DATABASE_URL` reaches a usable local Postgres instance. Start
   Docker Postgres only when it does not. Use the repository's documented local
   database parameters; do not stop, replace, or expose a working user database.
   Follow the [local-service guide](../../../docs/guides/local-development-services.md)
   when the product needs another containerized dependency.
4. Create `.env` from `.env.example` only if it is absent. Generate required
   local secrets without printing them, and use `bun run env:check` to validate
   configuration. Never echo, commit, or paste secret values into chat or logs.
5. Run `bun run db:migrate`, start `bun run dev`, and manually confirm the local
   home page and sign-in path load. Resolve setup failures before product work.
6. Through controlled access, complete the first verified login and confirm it
   reaches `/admin`. This claims the singleton initial-administrator slot; never
   make an unclaimed production deployment public.
7. Run `bun run verify` once the local baseline works. It is the required
   quality gate before handoff; Lefthook's pre-commit gate is earlier feedback,
   not a substitute.

## Discover the product before building

Use the repository's `feature-grilling` skill for a focused Grill Me session.
Start broad, then ask only questions that change product value or a durable
decision. Establish:

- business, target users, their jobs, and the outcomes worth paying attention to;
- the first valuable user journey, success signal, non-goals, and a clean happy path;
- required data, permissions, external systems, and browser WebMCP parity;
- whether any feature needs an admin workflow, safe data view, runtime-editable
  content, or user/account action; repository content remains the default;
- initial design language, including what should feel distinctly on-brand.

Record the result before coding: create `docs/features/<first-feature>.md` for
the first vertical slice, and a concise product outline at
`docs/features/product-direction.md` only when it expresses cross-feature
truth. Follow the existing feature-document shape and link relevant architecture
and design pages. Do not begin a generic backlog disguised as documentation.

## Hosting and platform defaults

Vercel is the entire hosting target. Authentication, scope, and project linkage
are established during the opening handshake. Before any external provisioning,
clearly ask for confirmation, then use Vercel Marketplace/CLI to add Neon for
Postgres and pull environment values without printing them. If product discovery
establishes an email need, discover and add the Resend Marketplace integration
before implementing email, then pull its environment values without printing
them. Offer preview or production deployment separately; each requires its own
confirmation.

Read [Vercel platform services](../../../docs/technologies/vercel-platform-services.md)
before choosing managed services. Do not add Redis by habit: prefer Upstash via
Vercel Marketplace only when shared caching, distributed rate limiting, locks,
or short-lived counters have a documented need. For AI features, recommend
Vercel AI Gateway by default. Browser WebMCP remains the only WebMCP target.

## Hand off to feature delivery

For each implementation, use the applicable repository-local skills rather than
loading every skill: type flow for typed boundaries, tautology avoidance for
tests, clean implementation for code review, living docs for durable truth, and
feature grilling for a product-changing ambiguity. Follow the canonical delivery
workflow through independent tests, desktop and mobile manual testing, review,
and `bun run verify`.

## Stop conditions

Pause for a user decision only when it changes product value, authorization,
irreversible behavior, cost-bearing external provisioning, or deployment target.
Otherwise choose the documented default, record the consequence, and continue.
