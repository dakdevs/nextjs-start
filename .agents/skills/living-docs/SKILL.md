---
name: living-docs
description: Create and maintain focused current-truth feature, architecture, technology, decision, and design-system documentation alongside behavior changes.
---

# Living documentation

Before changing product behavior, read the mandatory
[build-product router](../build-product/SKILL.md), the nearest feature document,
and the selected current-truth guide. Update the feature page before or with
code so its value, non-goals, happy path, and invariants remain testable.

Use [change impact](../../../docs/reference/change-impact.md) to find the
smallest additional documentation update. Keep pages focused and under 150
lines. Link parent and sibling pages; do not save research journals, handoffs,
or review transcripts.

Create an ADR only for a durable tradeoff or reversal. Finish by updating the
versioned `.changes` manifest when the repository convention requires it and
run the documented verification command.

Use [writing feature documents](../../../docs/guides/writing-feature-docs.md)
for feature truth and [design-system evolution](../../../docs/design-system/evolution.md)
when reusable visual language changes. When a new guide becomes canonical, add
only the focused routing link that makes it discoverable; do not copy its policy
into this skill.

For public-content changes, also follow the
[search delivery workflow](../../../docs/guides/search-discovery-workflow.md).
Record metadata and discovery decisions with the feature while preserving
private boundaries.
