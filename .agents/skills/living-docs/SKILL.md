---
name: living-docs
description: Create and maintain feature, architecture, technology, decision, and design-system documentation alongside behavioral changes.
---

# Living documentation

Before changing product behavior, read the nearest feature document and its
linked current-truth pages. Update that feature page before or with the code so
the stated value, non-goals, happy path, and invariants remain testable.

Use [change impact](../../../docs/reference/change-impact.md) to find the
smallest additional documentation update. Keep pages focused and under 150
lines. Link parent and sibling pages; do not save research journals, handoffs,
or review transcripts.

Create an ADR only for a durable tradeoff or reversal. Finish by updating the
versioned `.changes` manifest when the repository convention requires it and
run the documented verification command.
