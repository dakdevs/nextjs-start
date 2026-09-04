---
name: feature-grilling
description: Resolve only product-changing ambiguity before a material feature and record the answer in living feature documentation.
---

# Feature grilling

Use before a material feature decision. Read its current feature document and
linked architecture/design pages first.

Ask a single question only when an answer changes user value, authorization,
irreversible behavior, recovery, or reusable design language. Give a recommended
option and only the tradeoff needed to decide. Infer everything else from current
truth.

Capture the answer by updating the feature document: value, goals/non-goals,
happy path, invariant, WebMCP classification, and open question resolution.
Then follow [the feature workflow](../../../docs/guides/feature-workflow.md).

This is an original project workflow inspired by the interview intent of
[Matt Pocock's Grill Me skill](https://github.com/mattpocock/skills); it is not a
copy of that skill.
