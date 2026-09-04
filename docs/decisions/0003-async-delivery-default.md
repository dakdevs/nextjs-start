# 0003: direct queues by default; outbox for critical divergence

**Status:** accepted · **Date:** 2026-09-04

## Context

Most background work does not justify an outbox's schema and operational burden,
but some domains cannot tolerate a committed record and a missing event.

## Decision

Publish directly to Vercel Queues after successful non-critical work. Consumers
are idempotent and use the shared timeout/retry policy. Use Vercel Workflows for
durable multi-step orchestration. Include a transactional outbox as an optional,
documented module only for a committed Postgres change and queued event that
must not diverge, such as payments, entitlements, or inventory.

Because Vercel Queues has no native DLQ, terminal failures are acknowledged only
after a sanitized durable quarantine record and structured correlation log exist.
Because Workflow start cannot accept a deterministic run ID, external workflow
outcomes are idempotent by event ID.

## Consequences and reversal signal

Direct publication can lose a non-critical follow-up between commit and publish;
this is accepted only when the feature document says so. Introduce the outbox
when that loss violates a named business invariant. Do not make every feature
pay for it preemptively.

## Links

[Async platform](../technologies/async-platform.md) · [Background work](../architecture/background-work.md)
