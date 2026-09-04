# 0002: purpose-built BFF contracts and browser-agent parity

**Status:** accepted · **Date:** 2026-09-04

## Context

Generic data endpoints create coupling between unrelated screens and make it
easy to expose browser agents to a shape or action that is wrong for their
intent. The starter needs an easy default that favors independent evolution.

## Decision

Every oRPC operation serves one precise consumer use case with its own input,
output, authorization boundary, and exact database projection. An operation may
be shared only while all consumers need every present and expected change.
Different screen, table, filter model, authorization, agent safety model, or
evolution path means a different operation.

Every meaningful user-facing read/action/content surface is represented by a
browser-only WebMCP capability or a recorded, specific exemption. A capability
shares an app operation only when semantics and safety are identical; otherwise
it receives a dedicated path. Sensitive actions open normal human UI.

## Consequences and reversal signal

More small contracts are intentional. Review operation count only when actual
bundle, compilation, ownership, or navigation cost appears—not preemptively.
If a well-observed set of contracts genuinely co-evolves, consolidate with a
feature/architecture update and behavior tests.

## Links

[BFF architecture](../architecture/bff-orpc.md) · [WebMCP architecture](../architecture/webmcp.md) · [Feature workflow](../guides/feature-workflow.md)
