# Building the product

This blueprint is mandatory for every repository built from this starter: the
product, marketing website, application, features, maintenance, refactors, and
bug fixes. It is not an example menu or a set of optional prompts. Apply the
smallest applicable path below without asking the user to re-decide settled
technical choices.

Agents enter through the repository-local
[`build-product` skill](../../.agents/skills/build-product/SKILL.md), which
selects the relevant guides and companion skills before work begins. Keep its
routing updated whenever this workflow gains or changes a technical direction.

## Delivery path

1. Read the owning feature/current-truth docs; create the feature document
   first if behavior is new or materially changed.
2. Use the decision matrix to select the existing boundary and build the
   smallest valuable vertical slice.
3. Keep WebMCP, Markdown access, tests, and docs aligned with the behavior.
4. Use `feature-grilling` only for a product choice that materially changes
   value, recovery, permission, irreversible effects, or design language.
5. Run the canonical verification gate; resolve every failure without warnings
   or rule suppressions.
6. Push back only on a concrete harmful outcome; respect harmless reversible
   preferences and apply settled safe defaults automatically.

## Decision matrix

| Need                                            | Mandatory path                                                                                                                                                              | Current truth                                                                                                   |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| User input, search, filter, or editable control | Shared TanStack Form composition: `useAppForm`, `AppField`, `AppForm`, registered ShadCN/Base UI control. `nuqs` may hold published URL state, not a duplicate React draft. | [Forms](../architecture/forms.md)                                                                               |
| Visual UI                                       | Follow the design system; search ShadCN/user-named sources; keep local until every consumer benefits from sharing.                                                          | [Design system](../design-system/README.md) · [Frontend organization](../architecture/frontend-organization.md) |
| UI just created or materially changed           | Run the read-only animation-opportunity scout; implement only accepted motion within the authorized UI task.                                                                | [Motion language](../design-system/motion.md)                                                                   |
| Backend read/action                             | Purpose-built oRPC BFF contract per consumer; Effect service at external side-effect boundaries.                                                                            | [BFF](../architecture/bff-orpc.md) · [Effect](../architecture/effect-services.md)                               |
| State                                           | URL: `nuqs`; remote: oRPC/Query; local: React; complex module-local: Jotai. Form behavior always belongs to TanStack Form.                                                  | [UI and state](../technologies/ui-and-state.md)                                                                 |
| Feature scope                                   | Preserve the feature's documented value and happy path; reject stated non-goals and ask only product-changing questions.                                                    | [Feature workflow](feature-workflow.md)                                                                         |
| Agent access                                    | Give meaningful user-facing reads/actions browser WebMCP or record a specific exemption.                                                                                    | [WebMCP](../architecture/webmcp.md)                                                                             |
| Meaningful text                                 | Provide the appropriate Markdown page/index or record a specific exemption.                                                                                                 | [Agent-readable content](../technologies/agent-readable-content.md)                                             |
| Change proof                                    | Use independent-oracle tests, one clean E2E happy path when substantial, desktop/mobile review, current docs, and `.changes`.                                               | [Testing](../reference/testing-strategy.md) · [Change impact](../reference/change-impact.md)                    |
| Public content                                  | Apply search delivery; private content stays out of public indexes and no ranking/citation result is guaranteed.                                                            | [Search delivery](search-discovery-workflow.md)                                                                 |

## Settled choices

Do not ask whether to use the prescribed form, UI, state, BFF, Effect, WebMCP,
Markdown, testing, or documentation architecture. Explain and ask one concise
question only if the requested outcome requires a new product decision not
already answered by the feature documentation.

## Links

[Agent feature delivery](agent-feature-delivery.md) · [Writing feature docs](writing-feature-docs.md) · [Application forms feature](../features/application-forms.md) · [Documentation map](../README.md)
