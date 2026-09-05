---
name: lets-start
description: Set up a fresh nextjs-start clone, establish its product direction, and prepare an agent-ready first delivery plan before implementation begins.
---

# Let's Start

Use after this template has been cloned and before the first product feature is
built. It establishes a working local application, a durable product outline,
and the working agreement that later feature delivery follows. It is not a
shortcut around the [feature delivery workflow](../../../docs/guides/agent-feature-delivery.md).

## Establish the local baseline

1. Inspect `AGENTS.md`, `README.md`, `.env.example`, `docs/README.md`, and the
   current git status. Preserve user changes and learn the existing product
   truth before changing anything.
2. Confirm Bun is available, then run `bun install --frozen-lockfile`.
3. Check whether `DATABASE_URL` reaches a usable local Postgres instance. Start
   Docker Postgres only when it does not. Use the repository's documented local
   database parameters; do not stop, replace, or expose a working user database.
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

Vercel is the entire hosting target. Check Vercel authentication with the CLI;
ask the user to complete `vercel login` only when it is not already authenticated.
With the user's confirmation, link the repository to a Vercel project. Before
any external provisioning, clearly ask for confirmation, then use Vercel
Marketplace/CLI to add Neon for Postgres and pull environment values without
printing them. Offer preview or production deployment separately; each requires
its own confirmation.

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
