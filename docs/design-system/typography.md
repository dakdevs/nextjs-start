# Typography

Typography should feel quiet, legible, and structurally obvious. The system has
exactly four semantic size roles. Three are routine; the fourth is deliberately
rare so scale continues to communicate importance.

## Size roles

| Utility        | Size / line height | Use                                                        |
| -------------- | ------------------ | ---------------------------------------------------------- |
| `text-ui`      | 14px / 20px        | Controls, labels, metadata, helper text, and error IDs.    |
| `text-body`    | 16px / 24px        | Reading copy, field values, and default unclassified text. |
| `text-title`   | 32px / 1.15        | Page titles and the highest content heading on a screen.   |
| `text-display` | 48px / 1.05        | One principal promotional or hero statement, when earned.  |

Use `ui`, `body`, and `title` for routine product screens. `display` should be
absent from most features and appear at most once on a page. It is not a generic
large heading or a responsive replacement for `title`. Never add a fifth size.

## Family and hierarchy

- Use the single product sans family loaded centrally with `next/font` and
  exposed as `--font-geist`. Do not import or choose a font inside a route.
- A different product or display family requires a design-system decision. It
  must replace a role intentionally, not create another local hierarchy.
- `font-mono` is a functional exception for code and opaque identifiers where
  character distinction matters. It still uses one of the four size roles.
- Use regular body copy, medium UI emphasis, and semibold titles by default.
  Prefer weight, semantic color, spacing, and placement before changing scale.
- Keep paragraph measures readable and preserve the line height attached to the
  role. Reflow or wrap at narrow widths instead of inventing breakpoint sizes.

## Implementation rails

Tailwind's default size namespace is disabled in `src/app/globals.css`. Use only
`text-ui`, `text-body`, `text-title`, and `text-display`; raw `text-sm`, arbitrary
`text-[...]`, inline `fontSize`, and local `font-size` declarations fail the
architecture check. Normalize newly installed ShadCN components to these roles.

Changing a role's value or meaning is a material system change: review affected
feature intent, update this page and the design-system ADR, and ask the user only
when the product outcome or hierarchy tradeoff is unresolved.

## Review questions

1. Can weight, color, spacing, or placement solve the hierarchy first?
2. Does every text element map cleanly to one existing role?
3. Is `display` absent, or justified as the page's single principal statement?
4. Does the family load centrally and remain readable without layout shift?

## Links

[Design system](README.md) · [Evolution workflow](evolution.md) · [UI and state](../technologies/ui-and-state.md) · [Typography decision](../decisions/0004-restrained-typography-scale.md)
