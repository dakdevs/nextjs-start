# Agent feature delivery

This is the canonical workflow for an agent shipping a feature. It turns product
intent into a tested, observable change without replacing judgment with a
generator command. See the [feature workflow](feature-workflow.md) for its
delivery decisions and [working agreement](../reference/working-agreement.md)
for user preferences.

| Stage          | Agent action                                                                                                                                                                                                | Exit condition                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Understand     | Read the relevant feature, architecture, design, and decision pages. Use the project-local `feature-grilling` skill to resolve only product-changing ambiguity.                                             | The value, happy path, non-goals, authorization, WebMCP classification, and needed admin workflow are understood. |
| Record         | Create or update `docs/features/<feature>.md` before code. Capture the answer as current truth, not an implementation diary.                                                                                | A later agent can defend the feature's value and reject scope drift.                                              |
| Design         | Apply relevant local skills and the component/library matrices. Ask one concise question only when an answer changes product or design language.                                                            | The vertical slice has a purpose-built contract, ownership boundary, and accessible UI direction.                 |
| Build          | Implement the smallest coherent slice: schema/domain/contract/UI/WebMCP/error behavior as applicable. Keep boundaries single-purpose and infer types after entry validation.                                | The happy path is implemented without a generic escape hatch.                                                     |
| Test           | Add independent-oracle tests at public seams and one clean happy-path E2E test for a substantial feature.                                                                                                   | Tests could detect a plausible wrong implementation.                                                              |
| Manually prove | Exercise the happy path in a real browser on desktop and a mobile viewport/device. Check keyboard, touch target, 16px-or-larger input text, no mobile input zoom, loading/error states, and reduced motion. | Both form factors are ergonomic and the result matches feature intent.                                            |
| Review         | Re-read only applicable repository-local skills: clean implementation, type flow, tautology avoidance, living docs, and any task-specific skill. Fix every violation found.                                 | Code, docs, tests, and design rules agree.                                                                        |
| Verify         | Run `bun run verify`; repair failures and repeat until clean. Let Lefthook run its deterministic pre-commit gate, then commit only when it passes.                                                          | The canonical gate and commit gate pass without suppressed warnings.                                              |

## Test videos

After manual testing, ask whether the user wants a test video. Respect only an
explicit response: record `always`, `ask`, or `never` in the
[working agreement](../reference/working-agreement.md). The default is `ask`.
When requested, run `bun run test:e2e:video`; Playwright emits recordings in its
ignored `.artifacts/playwright/` directory. Recordings are local-only, opt-in
evidence: never commit, publish, or attach them to a PR. They are not a required
quality gate or a reason to skip manual testing.

## Review matrix

| Change                             | Read before review                              |
| ---------------------------------- | ----------------------------------------------- |
| Types, schema, transport           | `preserve-type-flow`                            |
| Tests                              | `avoid-tautological-tests`                      |
| Implementation shape               | `clean-implementation`                          |
| Durable product/architecture truth | `living-docs`                                   |
| Material product ambiguity         | `feature-grilling`                              |
| Visual or motion interaction       | applicable design-system and animation guidance |

Do not read every installed skill by default. Select the smallest set whose
rules govern the change, then update the feature document and the focused
current-truth page named by [change impact](../reference/change-impact.md).

## Links

[Feature workflow](feature-workflow.md) · [Testing strategy](../reference/testing-strategy.md) · [Writing feature documents](writing-feature-docs.md) · [Vercel platform services](../technologies/vercel-platform-services.md)
