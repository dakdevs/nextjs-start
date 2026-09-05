# Admin security boundary

The admin workspace is an outcome-oriented support surface, not a generic CRUD
panel, database browser, or implicit CMS. Elevated UI, oRPC, database access,
browser WebMCP, and audit behavior must all name the same narrow workflow.

## Initial administrator

The first verified, unbanned, non-impersonated human session that commits wins a
singleton Postgres claim. An `AFTER INSERT` session trigger creates the claim,
promotes that person, and appends the bootstrap audit event inside the same
transaction. A failed session rolls everything back; concurrent sessions can
produce exactly one initial administrator.

On upgrade, the migration adopts exactly one existing global administrator as
the singleton claimant before it installs the promotion guard. It stops with an
explicit reconciliation error when multiple administrators already exist;
choosing which account survives is a product decision, not a safe migration
guess.

This convenience creates a deployment responsibility: claim the initial admin
through a controlled login before an unclaimed production deployment becomes
public. The Let's Start workflow must surface that step. A future product that
cannot guarantee controlled first access must replace this policy with an
explicit invitation or deployment-secret ceremony and record a new ADR.

## Authorization layers

- The server layout redirects people without the current database role.
- Every admin oRPC operation also uses `adminMiddleware`; UI gating is never the
  authorization boundary.
- Sessions are re-read from Postgres, so a ban or role change takes effect on
  the next request. Client role state is not authoritative.
- Better Auth's broad admin plugin and browser admin client are intentionally
  absent. Add a named server workflow instead of exposing generic auth powers.
- A service account is not a Better Auth user, cannot open a browser session,
  and never receives an admin scope.

## Data visibility

Every persisted table belongs in the curated data catalog as either a safe
count or `security-hidden` with a reason. Add a purpose-built projection when an
admin needs more; never select a whole record and redact it afterward.

Never expose password hashes, provider tokens, session or verification tokens,
passkey keys/identifiers, rate-limit keys, service-account digests, reset URLs,
or one-time secrets. Names, email addresses, and operator-authored labels are
untrusted content even when an administrator can read them.

## Sensitive workflows

| Outcome                | Required boundary                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| Send password reset    | Stable user ID resolves server-side; Better Auth emails the reset; UI receives no token.                       |
| Create service account | Named account plus explicit registered scope; 256-bit secret appears once; only its digest and prefix persist. |
| Rotate credential      | Distinct operation; old token stops immediately; replacement appears once.                                     |
| Revoke credential      | Distinct operation with human confirmation; access stops immediately.                                          |
| Add a new scope        | A feature documents the real machine consumer and exact endpoint first.                                        |

Credential and permission changes are human-confirmed. Browser WebMCP may read
the same safe projection or prepare/focus the normal workflow, but it cannot
execute the final mutation or receive a secret.

## Audit rules

Admin audit rows are append-only at the database boundary. A database mutation
and its successful audit row share a transaction. External delivery records a
safe requested outcome before crossing the delivery boundary, so an audit-write
failure cannot send an untracked password-reset email. Never store request
bodies, reset links, credentials, tokens, or arbitrary provider payloads.

Each row names the actor, action, target kind and stable target identifier,
outcome, and request correlation ID. Successful sensitive workflows return the
correlation ID as the operator's reference. Unknown failures use the same ID at
the common error boundary so an operator can find the corresponding logs.

## Completion check

Prove rollback and concurrent bootstrap against real Postgres; rejection of
non-admin oRPC callers; one-time credential storage and lifecycle; safe catalog
and WebMCP outputs; and a human-confirmed desktop/mobile Playwright happy path.

## Links

[Admin operations](../features/admin-operations.md) · [Authentication](authentication-authorization.md) · [BFF contracts](bff-orpc.md) · [WebMCP](webmcp.md) · [Bootstrap decision](../decisions/0005-admin-bootstrap-and-boundaries.md)
