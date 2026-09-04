# Evolving the design system

The light, tonal, non-border-dependent direction is the shipped starting point
for every clone. Design decisions accumulate into a language; treat reusable
visual decisions as product behavior, not one-off styling shortcuts.

## Workflow

1. Read the current design truth and the feature’s value/happy path.
2. Search ShadCN and user-named approved sources for a compatible primitive.
3. Prefer existing semantic tokens and tonal surface tiers. Do not reach for a
   border when a filled section, contrast, spacing, or type can express hierarchy.
4. For a material visual direction, ask one question: state the recommended
   direction, user outcome, and tradeoff that requires a choice.
5. Implement semantic tokens/primitives first, then feature composition.
6. Update this document and the feature doc in the same change; add an ADR when
   the choice is broad, durable, or reverses a prior rule.

## Decision matrix

| Situation                                     | Decision                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------- |
| Existing primitive and token fit              | Compose them locally.                                                     |
| Light hierarchy is unclear                    | Add tonal surface/fill, spacing, or type contrast before a sparse border. |
| Pattern is used by more than one site area    | Promote to `src/modules/` or a low-level component as appropriate.        |
| A new token/pattern will guide future screens | Document it here and update change impact.                                |
| A change is merely local layout               | Keep it route-local; no system change.                                    |

## Completion check

A fresh agent can explain why the visual choice exists, reuse it without
guesswork, and preserve WCAG 2.2 AA in light, dark, and system themes.
