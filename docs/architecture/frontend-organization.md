# Frontend organization

Compose UI from the closest useful boundary outward.

| Location                 | Use for                                                                        |
| ------------------------ | ------------------------------------------------------------------------------ |
| `src/app/**/_modules/`   | Code used only by that route or route area. A module may own local components. |
| `src/components/shadcn/` | Generated ShadCN primitives; do not hand-edit without a documented reason.     |
| `src/components/`        | Tiny custom reusable primitives, not page compositions.                        |
| `src/modules/`           | Reusable compositions used by more than one site area.                         |
| `src/app/`               | Route composition, metadata, and thin delivery wiring.                         |

Promote a local module only when all current consumers benefit from its shared
contract and likely future changes. Do not make a component global merely to
avoid a second file.

## State hierarchy

1. URL state: `nuqs`.
2. Remote server state: oRPC plus TanStack Query.
3. Local component state: `useState` or `useReducer`.
4. Complex local cross-branch state: Jotai.
5. Global Jotai: exceptional; document why lower scopes fail.

Use semantic Tailwind tokens, accessible HTML, keyboard paths, focus states, and
reduced-motion behavior. See [design system](../design-system/README.md).
Every form declares its HTTP method; forms carrying credentials or private data
use POST so a pre-hydration submit cannot place values in URLs or access logs.
