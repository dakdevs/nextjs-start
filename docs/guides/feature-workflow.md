# Feature delivery workflow

The agent performs this workflow; there is no generator command.

| Step      | Action                                                                                             | Expected outcome / stop condition                                     |
| --------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1. Frame  | Read related feature, architecture, design, and decision pages. Create or update the feature doc.  | Value, happy path, non-goals, and WebMCP classification are explicit. |
| 2. Decide | Use the matrices below. Ask one question only if the answer changes the product.                   | A purpose-built contract and ownership boundary are selected.         |
| 3. Design | Check ShadCN and user-named sources before custom UI. Use current design tokens.                   | The UI is accessible and fits the design language.                    |
| 4. Build  | Add the smallest vertical slice: contract, domain behavior, UI, WebMCP classification, and errors. | No generic multipurpose endpoint or leaky boundary is introduced.     |
| 5. Prove  | Add behavior tests and one happy-path E2E test when the feature is substantial.                    | Tests use independent assertions and cover the public seam.           |
| 6. Record | Update feature/design/architecture/ADR docs and `.changes` manifest as applicable.                 | Docs describe the shipped truth, not intent.                          |
| 7. Verify | Run `bun run verify`.                                                                              | All gates pass; fix failures rather than suppressing them.            |

`docs/features/<feature>.md` is created before implementation and updated in the
same change. It is a beacon for later work: preserve valuable behavior, reject
explicit non-goals, and ask only when a new requirement changes its stated
outcome. Use the [canonical template](writing-feature-docs.md#canonical-template).

## Contract decision matrix

| Question                                                                      | Choose                                    |
| ----------------------------------------------------------------------------- | ----------------------------------------- |
| Same consumer intent, auth, input/output, and future change needs?            | Reuse the existing operation.             |
| Different page, projection, filter, action, authorization, or evolution path? | Create a new purpose-built operation.     |
| Need to validate untrusted input?                                             | Validate at that boundary with a schema.  |
| Data already typed downstream?                                                | Infer; do not re-declare a parallel type. |

## WebMCP decision matrix

| Capability                                               | Choose                                                  |
| -------------------------------------------------------- | ------------------------------------------------------- |
| Meaningful content/read/action helpful to an agent       | Register a concise route-scoped or global browser tool. |
| Exact consumer semantics match an app operation          | Share it.                                               |
| Semantics or authorization differ                        | Create a dedicated capability/operation.                |
| Destructive, financial, permission, or credential action | Initiate and open normal human confirmation UI only.    |
| Not agent-accessible                                     | Record a specific exemption in the feature document.    |
