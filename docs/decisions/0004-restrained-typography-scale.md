# 0004: restrained four-role typography scale

**Status:** accepted · **Date:** 2026-09-04

## Context

Page-local font sizes weaken visual hierarchy and cause an application assembled
over time to feel inconsistent. The minimal interface needs a small scale whose
rarity, not novelty, gives the largest text its meaning.

## Decision

Use exactly four semantic size roles: `ui`, `body`, `title`, and `display`. The
first three serve routine product UI. `display` is exceptional, limited to one
earned principal hero statement on a page, and should be absent from ordinary
application screens. Raw, arbitrary, inline, and route-local sizes are rejected
by the architecture check.

Use one centrally loaded product sans family. Monospace is allowed only for code
or identifiers and must use an existing size role. Express lesser hierarchy with
weight, semantic color, spacing, and placement before reaching for scale.

## Consequences and reversal signal

Installed components must be normalized to the semantic roles. Some compact
elements share a size and rely on weight or color for distinction. Revisit role
values—not the four-role limit—only when repeated accessibility testing or
product evidence shows the current scale is materially failing readers.

## Links

[Typography](../design-system/typography.md) · [Design system](../design-system/README.md) · [Evolution workflow](../design-system/evolution.md)
