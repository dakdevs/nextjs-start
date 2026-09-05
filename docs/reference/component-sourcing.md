# Component sourcing

Before creating a custom UI primitive, search the configured ShadCN catalogue
and any compatible sources the user has explicitly named. ShadCN is the default
starting point; new sources are additions only when the user asks for them.

## Decision matrix

| Need                                                            | Choose                                                                  |
| --------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Existing ShadCN primitive fits                                  | Install it into `src/components/shadcn/` and compose it.                |
| Admin-only workflow primitive or layout                         | Use Chakra UI inside the scoped admin boundary.                         |
| Ordinary icon or related semantic icon-state transition         | Use Lucide; add Morphicons only when a morph explains the state change. |
| Purposeful interaction/exit/shared layout motion                | Use Motion under the design-system motion rules.                        |
| Dithered texture or placeholder image                           | Use local Dither Kit source or a generated brand-matched dither asset.  |
| Existing source is close but needs product layout               | Keep the composition route-local or in `src/modules/`.                  |
| A tiny reusable behavior/primitive is missing                   | Create it in `src/components/` with semantic tokens and accessibility.  |
| A route-only composition is missing                             | Create it under that route’s `_modules/`.                               |
| A proposed source changes licensing, bundle, or design language | Ask one concise product question before adoption.                       |

Do not copy components blindly. Preserve accessible semantics, keyboard behavior,
and the starter’s tonal design language. See [UI library selection](ui-library-selection.md)
and [design system](../design-system/README.md).
