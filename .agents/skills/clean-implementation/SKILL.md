---
name: clean-implementation
description: Keep application code single-purpose, readable, and cleanly layered; use for feature implementation, refactoring, and code review.
---

# Clean implementation

Make each unit easy to name, read, test, and change. A function, operation,
service, component, or module should have one coherent purpose and expose the
smallest useful contract.

Keep policy in domain code and delivery/framework mechanics at edges. Prefer
straight-line code and meaningful names over clever indirection. Extract only
when the extracted concept has an independent reason to change. Do not introduce
factories, interfaces, or layers without a concrete boundary they protect.

For external work, use Effect services and typed errors. For UI, compose small
local pieces first and promote only when all consumers benefit. Review
[architecture](../../../docs/architecture/README.md) before changing a boundary.

This guidance is an original project synthesis. _Clean Code_ and _Clean
Architecture_ are by Robert C. Martin; Martin Fowler's related work informs
refactoring and evolutionary architecture, not authorship of those books.
