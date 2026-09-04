---
name: preserve-type-flow
description: Preserve inferred TypeScript types and parse untrusted values once at real trust boundaries; use whenever adding types, schemas, assertions, or API data flow.
---

# Preserve type flow

Treat runtime validation boundaries as sources of truth. Validate external input
with schemas; infer values and return types downstream instead of recreating
parallel interfaces, casts, or guards.

Before adding a type annotation, ask whether it is already inferable from the
schema, contract, function return, query, or discriminated result. Add an
annotation only at a genuine upstream boundary or when it communicates a stable
public contract unavailable to inference.

Do not use an assertion to silence a mismatch. Narrow at the boundary, repair
the source type, or make the transformation explicit. Keep oRPC inputs/outputs
and Effect errors precise enough for consumers to infer safely.

This original local summary is informed by
[dakdevs’ Principle: Preserve Type Flow](https://github.com/dakdevs/skills/tree/main/skills/principle-preserve-type-flow).
