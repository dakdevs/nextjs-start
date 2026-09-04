# Purpose-built BFF contracts

oRPC contracts are backend-for-frontend seams, not generic data APIs. One
operation serves one precise consumer intention and does one thing well.

## Rules

- Give every operation a narrow name, input schema, output schema, auth base,
  and purpose. Keep implementation routes thin.
- A list/table operation queries the exact projection it renders. Do not fetch a
  broad entity “just in case.”
- A different page, filter model, projection, authorization context, or future
  evolution path receives a different operation.
- Reuse only when both clients need all current and foreseeable changes. Shared
  code is a commitment, not a deduplication reflex.
- Server Components use the direct server client for reads; Client Components
  use remote oRPC with TanStack Query. Business mutations are not Server Actions.

## Boundary flow

`validated input → purpose-built contract → domain use case → repository exact query → inferred result`

Validate untrusted entry data once. Let TypeScript infer the internal flow;
avoid separate handwritten duplicate shapes.

## Review prompts

- Could another consumer change independently? If yes, split now.
- Does the output contain a field the caller cannot render or use? If yes, trim it.
- Is an optional parameter adding a second job? If yes, make another operation.
- Does the domain depend on Next, oRPC, Drizzle, Vercel, or WebMCP? If yes,
  move that dependency to the boundary.
