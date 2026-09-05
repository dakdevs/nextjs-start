# Feature: authentication

**Status:** current · **Owner:** application team · **Last reviewed:** 2026-09-05

## Problem and value

A single-account application needs a trustworthy, low-friction way to create,
verify, recover, and protect an account. Password login is the baseline;
passkeys reduce future password dependence.

## Goals

- Support email/password sign-up, verification, sign-in, sign-out, and reset.
- Offer passkey enrollment after login and accept it as a secondary sign-in method.
- Distinguish public, authenticated, and admin access in one authorization model.
- Bootstrap exactly one initial admin when the first account successfully authenticates.
- Keep known user-facing failures clear and unexpected failures traceable by ID.

## Non-goals and not valuable now

- Organizations, teams, invitations, SSO, social login, and billing roles.
- Making passkeys mandatory before the user can use the application.
- Hiding security decisions behind autonomous agent actions.

## Users and entry points

Visitors use sign-up/sign-in/reset pages. The first person to complete
authentication becomes admin through a server-side atomic bootstrap. Signed-in
people see a calm passkey prompt after login and can manage passkeys in account
settings. Admin-only operations require the global admin role.

## Core happy path

1. A visitor signs up with email and password and verifies their email.
2. They sign in, reach their intended page, and are invited to add a passkey.
3. They enroll a passkey using the browser ceremony, then may use it to sign in.
4. They can reset a forgotten password through a time-limited emailed link.

## Invariants and decisions

- Better Auth owns session and credential mechanics; Postgres is the durable store.
- Resend is the production mail boundary and a development-safe adapter is used locally.
- Authentication mutations use explicit input schemas and typed safe failures.
- A permanent ban, or a temporary ban whose expiry is still in the future,
  blocks new sessions and invalidates a current session. A completed temporary
  ban is cleared atomically when either boundary next evaluates that account.
- Authentication screens use the three routine typography roles; they do not
  use the exceptional display role. They stay on one calm canvas: controls and
  the primary action carry contrast while errors and passkey options add no
  persistent container layer.
- An agent may describe or navigate to auth flows, but enrollment and sign-in
  always use the browser’s normal human-confirmed security ceremony.

## WebMCP parity

Agent-accessible account-state reads and safe navigation are classified in each
feature that needs them. Passkey enrollment and sign-out tools only focus or
open the normal human-confirmed UI. Sign-in, reset completion, and permission
changes remain normal UI-confirmed flows.

## Success and open questions

Success is a verified user who can sign in with either password or passkey and
can recover access. Future product decisions: whether to nudge passkey adoption
again after dismissal and what mail provider fallback, if any, is warranted.

## Links

[Account profile](account-profile.md) · [WebMCP policy](../architecture/webmcp.md) · [Typography](../design-system/typography.md) · [Error policy](../guides/error-handling.md)
