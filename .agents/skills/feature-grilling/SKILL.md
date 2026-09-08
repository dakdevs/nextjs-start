---
name: feature-grilling
description: Resolve only product-changing ambiguity before a material feature decision, then record the answer in current-truth feature documentation.
---

# Feature grilling

Use only before a material feature decision. First read the mandatory
[build-product router](../build-product/SKILL.md), the current feature document,
and the specific architecture or design guide that constrains the decision. Use
the [feature workflow](../../../docs/guides/feature-workflow.md) to select that
guide; do not load unrelated technology guidance.

Ask a single question only when an answer changes user value, authorization,
irreversible behavior, recovery, or reusable design language. Give a recommended
option and only the tradeoff needed to decide. Infer everything else from current
truth.

Push back only on a concrete detrimental outcome. Do not turn a harmless,
reversible preference into an architecture debate.

Capture the answer by updating the feature document: value, goals/non-goals,
happy path, invariant, WebMCP classification, and open question resolution.
Write it using [feature-document guidance](../../../docs/guides/writing-feature-docs.md),
then follow [the feature workflow](../../../docs/guides/feature-workflow.md).

This is an original project workflow inspired by the interview intent of
[Matt Pocock's Grill Me skill](https://github.com/mattpocock/skills); it is not a
copy of that skill.
