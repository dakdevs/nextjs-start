---
name: preserve-type-flow
description: Preserve inferred TypeScript types and parse untrusted values once at real trust boundaries; use when adding types, schemas, assertions, contracts, or API data flow.
---

# Preserve type flow

Before adding or changing a type boundary, read the mandatory
[build-product router](../build-product/SKILL.md) and
[type-flow tooling](../../../docs/technologies/type-flow-tooling.md). Then read
only the boundary guide below that applies.

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

| Boundary                                                              | Read before acting                                                                                                         |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Untrusted browser, route, WebMCP, queue, environment, or vendor input | [Type-flow tooling](../../../docs/technologies/type-flow-tooling.md): parse with Zod once at entry.                        |
| oRPC contract or consumer projection                                  | [BFF contracts](../../../docs/architecture/bff-orpc.md) and [oRPC](../../../docs/technologies/orpc.md).                    |
| Effect error, service, or adapter                                     | [Effect services](../../../docs/architecture/effect-services.md) and [Effect 4](../../../docs/technologies/effect-4.md).   |
| Application form values or typed sections                             | [Application forms](../../../docs/architecture/forms.md) and [TanStack Form](../../../docs/technologies/tanstack-form.md). |

Keep annotations for stable public seams or meaningful transformations, not as
copies of a type already available downstream.

This original local summary is informed by
[dakdevs’ Principle: Preserve Type Flow](https://github.com/dakdevs/skills/tree/main/skills/principle-preserve-type-flow).
