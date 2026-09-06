# nextjs-start

An agent-ready, production-minded [Next.js](https://nextjs.org) starter for
Vercel. It pairs Bun, Postgres, Drizzle, Better Auth, Effect 4, oRPC, browser
WebMCP, Vercel Queues/Workflows, Tailwind 4, and ShadCN Base UI with explicit
rules for evolving an application safely.

## What a GitHub template creates

**Use this template** creates a new, independent repository from this starter's
files. Unlike a fork, the new project begins with one fresh commit and has no
shared Git history with this repository. You choose its owner, name, and
visibility; later changes to this template do not sync into the new project.
See [GitHub's template guide](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template).

## Give this to your agent

Copy this prompt into an agent from the parent directory where the project
should live, or from an existing clone. It handles both cases.

```text
Bootstrap my application from the GitHub template dakdevs/nextjs-start.
Do not write product code or push anything until the setup handshake is complete.

First ask me, in one concise setup round, for:
- the product's working name and one-sentence purpose;
- the GitHub owner and repository name that should receive pushes;
- public, private, or internal visibility, with private recommended unless I intend open source;
- the local parent directory, unless you are already inside the intended clone;
- the Vercel account/team scope and whether to create or link an existing project.

Then verify Git, Bun, GitHub CLI, and Vercel CLI are available. Check GitHub with
`gh auth status` and Vercel with `bunx vercel whoami`. If a tool or login is
missing, give me the exact official install/login step, let me complete it, and
verify again. Never print or paste authentication tokens.

If the destination repository does not exist, use `gh repo create` with
`--template dakdevs/nextjs-start`, `--clone`, and exactly the `--private`,
`--public`, or `--internal` visibility I chose. If a clone already exists,
inspect `git remote -v` and `gh repo view`; do not change a remote, repository
visibility, or push target without my confirmation. Verify `origin` is the
confirmed destination before the first push, and update package/repository/app
identity away from the starter.

After cloning, read `AGENTS.md` and `.agents/skills/lets-start/SKILL.md` completely
and follow the Let's Start skill. Authenticate and, with my confirmation, link
the Vercel project up front, but do not provision paid services or deploy until
you ask separately. Establish the local database and environment without
revealing secrets, run the starter, claim the initial administrator safely, and
pass `bun run verify`.

Use the repository-local feature-grilling workflow to interview me about users,
value, the first happy path, non-goals, permissions, admin needs, WebMCP parity,
and design language. Record the agreed product direction and first feature in
the living docs before implementing it. Ask only questions whose answers change
product value or a durable decision; use documented defaults for the rest.
```

The equivalent web flow is: select **Use this template** → **Create a new
repository**, choose owner/name/visibility, create it, then clone with
`gh repo clone OWNER/REPO`. The CLI can do the same with `gh repo create
--template`; see the [GitHub CLI reference](https://cli.github.com/manual/gh_repo_create).

## Manual local setup

The agent prompt above is the intended first step. If you are setting up by
hand, install [Bun 1.4.0](https://bun.sh), authenticate `gh` and the
[Vercel CLI](https://vercel.com/docs/cli), then run a local Postgres instance:

```bash
docker run --name nextjs-start-db --rm \
  -p 54329:5432 \
  -e POSTGRES_DB=nextjs_start \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  postgres:17-alpine
```

Create local configuration and set a unique auth secret:

```bash
cp .env.example .env
# Replace BETTER_AUTH_SECRET with a random value of at least 32 characters.
```

Install, migrate, and start the app:

```bash
bun install --frozen-lockfile
bun run db:migrate
bun run dev
```

Open <http://localhost:3000>. `EMAIL_DELIVERY=development` writes messages to
the ignored `.next/development-emails` mailbox; deployed environments use Resend.

## Verify changes

Run the complete gate before handing off a change:

```bash
bun run verify
```

It creates a disposable Docker Postgres database, runs quality checks and
tests, builds the production app, then runs Chromium happy-path E2E coverage.
Docker and Chromium system dependencies are therefore required. The GitHub
workflow runs the same command.

## Build with the starter

Start every feature with its current-truth document and update it alongside the
implementation. The architecture is deliberately local-first: one purpose-built
oRPC operation per consumer contract, route-local UI in `_modules`, and shared
code only when all consumers benefit from its future changes.

- [Feature workflow](docs/guides/feature-workflow.md)
- [Agent feature delivery](docs/guides/agent-feature-delivery.md)
- [Documentation map](docs/README.md)
- [BFF/oRPC contracts](docs/architecture/bff-orpc.md)
- [Browser WebMCP policy](docs/architecture/webmcp.md)
- [Effect services](docs/architecture/effect-services.md)
- [Design-system workflow](docs/design-system/evolution.md)
- [Testing strategy](docs/reference/testing-strategy.md)

## Deploy to Vercel

Use Vercel as the complete hosting target. After explicit confirmation, use the
Vercel CLI to link the project and add Neon Postgres through Vercel Marketplace;
pull environment values without printing them. Production uses Neon’s pooled
Postgres URL with `sslmode=require` (or stronger), `EMAIL_DELIVERY=resend`,
`RESEND_API_KEY`, a real `EMAIL_FROM`, and a distinct `BETTER_AUTH_SECRET`.
See [Vercel platform services](docs/technologies/vercel-platform-services.md)
for Neon, selective Upstash Redis, AI Gateway, and deployment approval rules.

Set `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL` to the canonical deployment
origin. Vercel Git integration can handle preview and production deployments;
the included GitHub Action verifies source changes and does not deploy.

Passkeys require a secure, stable relying-party origin. They are disabled on
Vercel preview deployments by default; set `ALLOW_PREVIEW_PASSKEYS=true` only
when a preview has a suitable stable origin and you explicitly need to test the
ceremony. Browser WebMCP is progressively enhanced: the normal human UI remains
complete where the API is unavailable, and credential ceremonies always remain
human-confirmed.

## License

[MIT](LICENSE)
