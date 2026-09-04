# Authentication and authorization

Better Auth is the credential and session boundary. This starter deliberately
models one account and global roles; it is not an organization or tenancy model.
The database is durable storage, but application code asks Better Auth for the
current session rather than interpreting session records itself.

## Rules

- Public routes may not infer identity from client-supplied IDs. Authenticated
  operations derive the account owner from the trusted session context.
- Each protected oRPC operation attaches the narrowest authentication or role
  middleware at its contract boundary. Do not rely on a page-only check.
- `user` and `admin` are the complete role set. One application schema feeds
  TypeScript and Better Auth, while Postgres independently enforces the same
  closed set so manual or legacy writes cannot invent an authorization state.
- Passwords, verification tokens, recovery tokens, and passkey ceremonies never
  enter logs, WebMCP tool inputs, or user-safe errors. Better Auth may place a
  single-use reset token in its emailed handoff URL; remove it from browser URL
  state after the reset completes and never copy it elsewhere.
- Password sign-in is the baseline. After a successful login, invite the person
  to register a passkey; it is an optional alternative login method, not MFA.
- Better Auth rate limits are always enabled and atomically stored in Postgres;
  per-process memory is not an enforcement boundary on Vercel.
- An agent can navigate or explain auth. Credential creation, enrollment,
  recovery completion, and authorization changes always use normal human UI.

## Authorization decision matrix

| Need                                  | Boundary                           | Expected outcome                                  |
| ------------------------------------- | ---------------------------------- | ------------------------------------------------- |
| Any signed-in account                 | authenticated operation middleware | Session-derived actor only.                       |
| Global administrative action          | admin operation middleware         | Explicit role check and audit-worthy behavior.    |
| Another person or resource            | domain policy after identity       | Ownership/relationship checked server-side.       |
| Account, team, or tenant partitioning | product decision first             | Do not retrofit into this single-account starter. |

## Completion check

The happy path works with password and passkey sign-in; a caller cannot select a
different account; unsafe authentication details cannot reach a browser agent.

## Links

[Authentication feature](../features/authentication.md) · [BFF contracts](bff-orpc.md) · [WebMCP safety](webmcp.md) · [Auth and email technology](../technologies/auth-email.md)
