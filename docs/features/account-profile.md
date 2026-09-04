# Feature: account profile

**Status:** current reference vertical slice · **Owner:** application team · **Last reviewed:** 2026-09-04

## Problem and value

A signed-in person needs a small, obvious place to see and update their public
account details. This vertical slice demonstrates the starter’s contracts,
Effect services, Drizzle persistence, WebMCP parity, error IDs, and tests.

## Goals

- Display the exact profile projection required by the account screen.
- Update only the display name and bio through a distinct mutation contract.
- Make the current sign-in email visible but not editable in this feature.
- Provide an agent-readable profile view and a safe agent-initiated update path.

## Non-goals and not valuable now

- A generic “get user” endpoint, arbitrary user search, or cross-account edits.
- Email-address changes, avatar uploads, preferences, or organization settings.
- Reusing this contract for another page with different fields or filtering.

## Users and entry points

Authenticated people open Account from site navigation. The account page uses a
server read for its initial data and an interactive client mutation for saving.

## Core happy path

1. A signed-in person opens Account and sees name, email, bio, and passkey state.
2. They change name or bio and choose Save changes.
3. Validation feedback is shown for safe known errors; success refreshes the view.
4. An agent can inspect the same meaningful profile state and request the same
   low-risk update with explicit fields.
5. After the transaction commits, the server directly publishes a non-critical,
   identifier-only profile-updated event. Its workflow records one audit outcome.

## Invariants and decisions

- Read and write are separate purpose-built oRPC operations with exact schemas.
- Repository queries select only account-screen fields, never a broad user record.
- The authenticated account owner is implicit from session, never client input.
- Shared code remains shared only while every consumer benefits from every change.
- The account screen uses only the three routine semantic typography roles.
- Queue notification is deliberately non-critical: an exhausted publish logs its
  event/correlation identifiers but does not reverse an already committed edit.
- Audit receipts and terminal queue failures retain identifiers, never profile
  fields or rejected payloads.

## WebMCP parity

Profile read is `readOnlyHint`; profile update is a narrow, reversible mutation
but is not marked idempotent because every accepted call creates a new event and
audit outcome. Any future destructive or permission-changing account action
only initiates a normal human confirmation UI.

## Success and open questions

Success is a person reliably viewing and updating their own profile with no
cross-account access. Future additions must first decide whether they belong to
this screen’s contract or a new purpose-built feature contract.

## Links

[Authentication](authentication.md) · [BFF contracts](../architecture/bff-orpc.md) · [Typography](../design-system/typography.md) · [Testing](../reference/testing-strategy.md)
