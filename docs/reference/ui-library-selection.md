# UI library selection

Choose a library because it gives the feature a durable capability, not because
it is fashionable. Check the current design system, ShadCN, and the sources
below before making a primitive. Record a material adoption in the feature doc
and use its actual, current documentation before installation.

## Decision matrix

| Need                                                       | Default decision                                                                                                     | When to suggest or ask                                                                                                                   |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Public product primitive                                   | ShadCN Base UI in `src/components/shadcn/`.                                                                          | Suggest when an existing accessible primitive fits; ask only for a library with a material bundle, license, or language tradeoff.        |
| Reusable product composition                               | Local composition first; promote only when all consumers benefit from shared evolution.                              | Suggest promotion after a second genuine consumer, not visual resemblance alone.                                                         |
| Admin-only primitive/layout                                | Chakra UI, scoped to the admin route/provider.                                                                       | Suggest Chakra patterns for admin workflow UI; do not let Chakra tokens or primitives leak into public product surfaces.                 |
| Ordinary icon                                              | `lucide-react`.                                                                                                      | Use by default with an accessible label for icon-only controls.                                                                          |
| One persistent semantic icon state becoming another        | Morphicons, using compatible Lucide icon data.                                                                       | Suggest only for a meaningful state transition (for example menu open/close or save/success), not decoration or unrelated icon swaps.    |
| Purposeful interactive motion                              | `motion` for React (`motion/react`), with CSS/WAAPI for simple or navigation-time effects.                           | Suggest Motion for exit, shared-layout, gesture, or interruptible state motion; do not animate high-frequency work without value.        |
| A changing numeric value needs spatial continuity          | Verify a maintained package/API from [rolling.kitlangton.dev](https://rolling.kitlangton.dev/) before adopting it.   | Suggest a rolling number for important, infrequent metric changes; retain tabular width and a non-animated fallback.                     |
| Interaction sound might confirm a rare, meaningful outcome | Ask whether sound is wanted; use [Procedural Sounds](https://procedural-sounds.vercel.app/) to audition/generate it. | Do not add sound silently. Commit the exported file and recipe/intent; pair it with visible feedback and a mute/respect-preference path. |
| Dithered visual texture or workflow-card backdrop          | Copy the needed Dither Kit source locally and keep it a small, inspectable component.                                | Suggest it for deterministic, brand-aligned texture—not as a substitute for information hierarchy.                                       |
| Placeholder image                                          | Generate a brand-matched dither image; see [placeholder policy](../design-system/dither-images.md).                  | Never use arbitrary stock imagery or a generic remote placeholder.                                                                       |

## Boundaries

- `lucide-react` is the icon baseline. Do not build an icon library around a
  one-off SVG. Morphicons augments Lucide; it does not replace the baseline.
- Use Morphicons only when the same control has two related, named states and
  a morph makes that relationship clearer. Honor reduced motion with an instant
  change or fade; preserve an accessible text label/state.
- Motion is the default React motion toolkit, not a mandate to animate every
  event. Follow [motion guidance](../design-system/motion.md).
- Chakra is an intentional admin boundary. Public routes retain Tailwind,
  ShadCN, and the shared design tokens; do not mix two design systems inside
  one ordinary surface without a documented reason.
- Inside `/admin`, Chakra owns layout, controls, and interactive primitives.
  Shared CSS typography roles, semantic color variables, and accessibility
  utilities may cross that boundary so both surfaces retain one design
  language. Do not import ShadCN components or use Tailwind to recreate a
  second admin component system.
- Dither Kit is copied source, not a hidden runtime dependency. Keep a local
  wrapper responsible for title-derived deterministic seed/palette selection.
- Rolling Numbers is a reference, not an approved dependency until its package,
  maintenance, accessibility, and bundle impact are verified at adoption time.

## Completion check

The feature document names the user outcome, chosen source, and why an existing
primitive was insufficient. The UI works without its decorative/motion layer,
uses the shared tokens, and has no unreviewed package or copied source.

## Links

[Component sourcing](component-sourcing.md) · [Design system](../design-system/README.md) · [Motion](../design-system/motion.md) · [Feature workflow](../guides/feature-workflow.md)
