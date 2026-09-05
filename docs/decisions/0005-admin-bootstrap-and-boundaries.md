# 0005: transactional admin bootstrap and narrow operations

**Status:** accepted · **Date:** 2026-09-05

## Context

The template needs an immediately usable administrator without shipping a broad
privileged API. It also needs operational visibility without exposing the
credential-bearing tables that share the same Postgres database.

## Decision

The first eligible session claims the initial global administrator in the same
Postgres transaction as session insertion. A singleton claim is the concurrency
boundary; a trigger promotes the winner and writes the bootstrap audit event.
The initial claim must be completed through controlled access before production
is public. An upgrade adopts one pre-existing administrator into that claim and
halts when several exist so a human can reconcile the ambiguity first.

Admin behavior is delivered as task-oriented, purpose-built oRPC operations and
exact SQL projections. The broad Better Auth admin plugin/client is not exposed.
The catalog classifies all persisted tables, security data stays hidden, and
service accounts are separate digest-backed credentials with registered scopes.
Browser WebMCP can execute safe reads but only prepares human UI for credential
or permission mutations.

## Consequences and reversal signal

The template gains a small deployment ceremony and more operations than a
generic CRUD endpoint, in exchange for an auditable least-privilege surface.
Change bootstrap to an invitation or secret ceremony when first access cannot
be controlled. Add a new narrowly reviewed workflow when administrators need a
new outcome; do not widen an existing operation merely for reuse.

## Links

[Admin security](../architecture/admin-security.md) · [Admin operations](../features/admin-operations.md) · [Authentication](../architecture/authentication-authorization.md) · [Browser WebMCP](../architecture/webmcp.md)
