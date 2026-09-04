# nextjs-start

An agent-ready, production-minded [Next.js](https://nextjs.org) starter for
Vercel. It pairs Bun, Postgres, Drizzle, Better Auth, Effect 4, oRPC, browser
WebMCP, Vercel Queues/Workflows, Tailwind 4, and ShadCN Base UI with explicit
rules for evolving an application safely.

Use this repository as a GitHub template, then make it your own.

## Start a project

1. Select **Use this template** on GitHub and create a new repository.
2. Clone it and install [Bun 1.4.0](https://bun.sh).
3. Run a local Postgres instance (Docker is the simplest option):

   ```bash
   docker run --name nextjs-start-db --rm \
     -p 54329:5432 \
     -e POSTGRES_DB=nextjs_start \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     postgres:17-alpine
   ```

4. Create local configuration and set a unique auth secret:

   ```bash
   cp .env.example .env
   # Replace BETTER_AUTH_SECRET with a random value of at least 32 characters.
   ```

5. Install, migrate, and start the app:

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
- [Documentation map](docs/README.md)
- [BFF/oRPC contracts](docs/architecture/bff-orpc.md)
- [Browser WebMCP policy](docs/architecture/webmcp.md)
- [Effect services](docs/architecture/effect-services.md)
- [Design-system workflow](docs/design-system/evolution.md)
- [Testing strategy](docs/reference/testing-strategy.md)

## Deploy to Vercel

Import the generated repository into Vercel. Use the Bun runtime and add every
required value from [`.env.schema`](.env.schema) to the matching Vercel
environment. Production uses a provider’s pooled Postgres URL with `sslmode=require`
(or stronger), `EMAIL_DELIVERY=resend`, `RESEND_API_KEY`, a real `EMAIL_FROM`, and
a distinct `BETTER_AUTH_SECRET`.

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
