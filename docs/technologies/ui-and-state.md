# Tailwind, ShadCN, modules, and state

Tailwind provides semantic styling tokens; ShadCN Base UI `base-nova` provides
installed primitives in `src/components/shadcn/`. Compose small pieces upward
instead of placing page behavior in a monolithic component.

## Ownership hierarchy

| Location                 | Owns                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| `src/app/**/_modules/`   | A route area's private modules and their local subcomponents.        |
| `src/components/shadcn/` | Installed ShadCN primitives; retain their generation-friendly shape. |
| `src/components/`        | Tiny reusable custom primitives.                                     |
| `src/modules/`           | Reusable compositions, promoted only when consumers co-evolve.       |
| `src/app/`               | Thin route assembly, metadata, and delivery wiring.                  |

Before custom UI, search ShadCN and compatible user-named sources. A component
does not become shared merely because it looks similar: promote only when both
clients use and benefit from every present and expected change.

## State decision matrix

| State                                     | First choice                                            |
| ----------------------------------------- | ------------------------------------------------------- |
| Shareable navigation/filter state         | `nuqs` URL state.                                       |
| Server cache, loading, mutation lifecycle | oRPC + TanStack Query.                                  |
| One component or close composition        | `useState` / `useReducer`.                              |
| Complex shared state inside one module    | Jotai, scoped to that module.                           |
| App-global atom                           | Exceptional; document why URL/server/local state fails. |

## Baseline visual language

Ship light by default: warm off-white canvas, subtle tonal surface contrast,
filled controls, spacing, type hierarchy, and restrained elevation. Borders are
sparse accents—not the only separator. Use semantic tokens, accessible focus,
keyboard paths, WCAG 2.2 AA contrast, and reduced motion.

## Links

[Design system](../design-system/README.md) · [Frontend organization](../architecture/frontend-organization.md) · [Component sourcing](../reference/component-sourcing.md)
