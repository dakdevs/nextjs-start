# Testing strategy

Test behavior at public seams, not every function or a coverage percentage.
Assertions must use an independent oracle: known fixtures, real database state,
observable contract output, or a user-visible result—not a duplicate of the
implementation’s branching logic.

| Layer                    | Required proof                                                      |
| ------------------------ | ------------------------------------------------------------------- |
| Pure domain rule         | Unit test only when a meaningful rule exists.                       |
| Repository / integration | Disposable real Postgres, migrations, exact query behavior.         |
| oRPC                     | Contract, validation, auth, authorization, and observable result.   |
| WebMCP                   | Each exposed tool’s schema, classification, and execution behavior. |
| Substantial feature      | One clean Playwright happy path, including Axe checks.              |

## Rules

- Tests describe intended outcome and choose fixtures that could expose a wrong implementation.
- Integration files run serially because they share one disposable PostgreSQL
  database. Keep fixture identifiers unique and cleanup scoped as well.
- Do not mock the unit under test or assert private calls merely to mirror code.
- Keep E2E on the happy path; cover technical lower-layer error behavior only
  where it changes meaningful behavior.
- Use mutation testing as an available diagnostic, not a quota.
- WCAG 2.2 AA failures are failures, never warnings.

See the project-local [avoid tautological tests skill](../../.agents/skills/avoid-tautological-tests/SKILL.md).
