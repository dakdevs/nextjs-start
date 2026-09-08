---
name: clean-implementation
description: Keep implementation and refactoring single-purpose, readable, and cleanly layered; use when changing application behavior or reviewing its shape.
---

# Clean implementation

Before changing behavior, read the mandatory [build-product router](../build-product/SKILL.md),
then the owning feature and the one current-truth guide for the boundary being
changed. Do not preload every guide: use the routing below only when it applies.

Make each unit easy to name, read, test, and change. A function, operation,
service, component, or module should have one coherent purpose and expose the
smallest useful contract.

Use explicit brace bodies for every arrow function and control-flow statement,
including callbacks and tests. The [tooling policy](../../../docs/technologies/type-flow-tooling.md)
does not allow exceptions to these two rules.

Keep policy in domain code and delivery/framework mechanics at edges. Prefer
straight-line code and meaningful names over clever indirection. Extract only
when the extracted concept has an independent reason to change. Do not introduce
factories, interfaces, or layers without a concrete boundary they protect.

| Change                                                 | Read before acting                                                                                                                                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| oRPC consumer contract or exact projection             | [BFF contracts](../../../docs/architecture/bff-orpc.md)                                                                                                                                          |
| Vendor, queue, workflow, or other external side effect | [Effect services](../../../docs/architecture/effect-services.md) and [error handling](../../../docs/guides/error-handling.md)                                                                    |
| Form or editable control                               | [Application forms](../../../docs/architecture/forms.md)                                                                                                                                         |
| Local/shared UI, state, or visual language             | [Frontend organization](../../../docs/architecture/frontend-organization.md), [design system](../../../docs/design-system/README.md), and [UI/state](../../../docs/technologies/ui-and-state.md) |
| New or materially changed UI                           | [Motion language](../../../docs/design-system/motion.md), then the required animation scout                                                                                                      |

For external work, use Effect services and typed errors. For UI, compose small
local pieces first and promote only when all consumers benefit. Follow the
selected guide before changing that boundary.

Raise a concrete harmful outcome with a safe alternative, but implement
harmless preferences without turning them into an architecture debate.

This guidance is an original project synthesis. _Clean Code_ and _Clean
Architecture_ are by Robert C. Martin; Martin Fowler's related work informs
refactoring and evolutionary architecture, not authorship of those books.
