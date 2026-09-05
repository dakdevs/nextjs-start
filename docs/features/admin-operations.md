# Feature: admin operations

**Status:** current · **Owner:** application team · **Last reviewed:** 2026-09-05

## Problem and value

An application needs a calm, task-oriented administrative workspace for the
small number of operational tasks that genuinely need elevated access. It must
make the system understandable without turning sensitive credentials, security
artifacts, or ordinary repository content into an editable control panel.

## Goals

- Promote the first successfully authenticated account to global `admin` once,
  atomically and server-side; every later account starts as `user`.
- Give an admin a minimal sidebar and a home grid of clear workflows, rather
  than a generic database browser or a maze of settings.
- Show safe, purpose-built projections of application data and explain each
  workflow's outcome before the admin starts it.
- Let an admin initiate a password-reset email, never see or set a password.
- Manage service-account labels, declared scopes, creation, rotation, and
  revocation while showing a generated secret exactly once.
- Ask feature authors whether a feature needs an admin workflow as it is built.

## Non-goals and not valuable now

- A raw SQL console, an unrestricted table editor, password/token/passkey
  inspection, impersonation, or a generic "admin API".
- Moving repository-owned copy, configuration, or product rules into the panel
  merely because an editable field could be made.
- Autonomous browser-agent completion of credential, permission, recovery, or
  service-account secret actions.

## Users and entry points

The first person to complete authentication becomes the initial admin. Admins
enter `/admin`, choose an outcome-oriented card, and complete a focused human
workflow. Other signed-in people cannot discover or load admin data.

## Core happy paths

1. The first authenticated account reaches the application and is promoted
   within an atomic server-side bootstrap; a concurrent login cannot create a
   second initial admin.
2. An admin opens the home grid, chooses **Review accounts**, sees only the
   projection needed for that workflow, searches or pages through bounded
   results, and opens a selected account.
3. An admin chooses **Send password reset**, reviews the recipient, confirms,
   and sees a neutral delivery result with an audit/correlation reference.
4. An admin creates a labeled, scoped service account, copies the secret at its
   one display, and later rotates or revokes it through distinct workflows.
5. While framing a new feature, the agent asks whether an admin needs a
   specific operational outcome; if yes, it records and builds that workflow.

## Invariants and decisions

- Bootstrap derives the actor from a trusted authenticated session and uses a
  database transaction/lock; no client role, route order, or UI state decides it.
- Admin authorization is enforced at the oRPC/domain boundary as well as route
  layout. Each dashboard, account, reset, and service-account operation has one
  consumer contract and one purpose.
- Safe projections exclude password hashes, recovery/verification/session
  tokens, passkey material, raw credentials, and security-sensitive metadata.
- The data catalog classifies every persisted table. Purpose-built recent
  profile, failed-delivery, and workflow-receipt views are bounded to 50 safe
  rows; user and activity screens use server-side search and cursor pagination.
- Reset sends a provider-issued, single-use recovery handoff. The panel never
  receives a password or reset token. Security-significant actions are audited.
- Service-account secrets are high-entropy, stored only as a non-reversible
  verifier, revealed once on create/rotate, omitted from logs and WebMCP, and
  revoked rather than edited in place. Scopes are explicit; there is no
  blanket database or administrator scope.
- Repository content is the default. Ask about runtime editing only when a
  non-developer must safely change it often enough to justify permissions,
  review, history, and a rollback story.

## Feature-to-admin interview

During feature framing, answer these in the feature document before adding an
admin surface:

| Question                                              | Default / outcome                                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| What operational outcome would an admin need?         | None until a concrete support, moderation, recovery, or lifecycle need exists.                    |
| Is this content repository-owned or runtime-managed?  | Repository-owned; ask about editable runtime content only when its value is clear.                |
| Who may act, on which record, with what confirmation? | Named admin role, purpose-built policy, explicit review step.                                     |
| What safe facts make the workflow understandable?     | Small allowlisted projection; never secrets or credentials.                                       |
| Could an agent help?                                  | Expose safe reads/navigation; sensitive mutations focus human-confirmed UI.                       |
| What audit, reversal, and retention behavior matter?  | Record actor, target identifier, outcome, correlation ID; choose rotate/revoke/undo deliberately. |

## WebMCP parity

Expose route-scoped safe dashboard summaries, workflow descriptions, and
navigation where they materially help a browser agent. The data screen exposes
its catalog and the same three named safe projections through purpose-built
read tools. Do not expose account
security artifacts, full sensitive datasets, password-reset execution,
authorization changes, service-account create/rotate/revoke, or one-time
secrets. Those tools may only open the focused, human-confirmed UI. Record any
other specific exemption with the feature that owns it.

## Success and open questions

Success is an initial administrator safely completing common operational work
without a generic privileged backdoor. A future feature decides its own scoped
admin workflow rather than expanding this panel speculatively. Before a service
account is granted a new capability, document its API/auth boundary and scope.

## Links

[Authentication](authentication.md) · [Admin security](../architecture/admin-security.md) · [Authentication architecture](../architecture/authentication-authorization.md) · [BFF contracts](../architecture/bff-orpc.md) · [WebMCP policy](../architecture/webmcp.md) · [Component sourcing](../reference/component-sourcing.md) · [Feature workflow](../guides/feature-workflow.md)
