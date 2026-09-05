# Design system

Every clone starts with a light, tonal, non-border-dependent interface—not an
optional example. The default canvas is warm/neutral off-white, with softly
differentiated surface tiers and filled controls or sections creating hierarchy.
Sparse borders are accents, never the primary way to separate the page.

## Current truth

- Preserve light, dark, and system themes; the light theme is the shipped default.
- Use semantic tokens for canvas, raised surface, muted surface, foreground,
  accent, and interactive fills. Never hard-code raw product colors.
- Establish hierarchy with tonal surfaces, filled controls, spacing, and clear
  type before adding a border. Use restrained shadows only for real elevation.
- Keep corners and visual density calm; avoid decorative cards and heavy chrome.
- Keep narrow authentication flows on one calm canvas. Use fill for controls
  and the primary action, not nested page, card, alert, and secondary-action layers.
- Use one primary action per local context; secondary actions stay visually quiet.
- Use only the `ui`, `body`, and `title` type sizes in routine product UI. The
  fourth `display` size is a rare exception for a principal hero statement.
- Keep font family, loading, role selection, and hierarchy consistent with the
  [typography directive](typography.md); raw or route-local sizes are prohibited.
- Preserve visible focus, semantic HTML, keyboard access, contrast, and reduced motion.
- Treat mobile as first-class: inputs, selects, and textareas are at least 16px
  at every breakpoint; all actionable touch targets are at least 44×44 CSS px.
  Evaluate the desktop and mobile happy paths for ergonomics, not only fit.
- ShadCN Base UI `base-nova` components live in `src/components/shadcn/`.
- Check ShadCN and user-named compatible sources before introducing a custom primitive.
- Use Lucide by default; Morphicons are reserved for a related semantic icon
  state transition. Chakra UI is scoped to the admin workspace.
- Use purposeful Motion according to the [motion language](motion.md), and
  generate brand-matched dither imagery for placeholders.

## Ownership

Feature UI may compose existing primitives locally. A new reusable token,
primitive, pattern, color role, typography rule, spacing rule, or motion rule
changes this document and follows [the evolution workflow](evolution.md).

## Links

[Frontend organization](../architecture/frontend-organization.md) · [UI and state](../technologies/ui-and-state.md) · [Feature workflow](../guides/feature-workflow.md) · [Change impact](../reference/change-impact.md)

[Typography](typography.md) · [Motion language](motion.md) · [Dither imagery](dither-images.md) · [Evolution workflow](evolution.md)
