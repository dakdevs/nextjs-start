# Type flow, tests, and quality tooling

Types should flow downstream from a trustworthy entry boundary. Zod validates
untrusted data arriving at a route, oRPC operation, WebMCP tool, environment
module, queue event, or vendor adapter. From that point, infer rather than
re-declaring parallel object types.

## Type-flow rules

- Validate once at the entry point; pass the inferred value to the use case.
- Derive output and UI types from the contract/query source when possible.
- Introduce a named type only for a stable domain concept, public seam, or
  meaningful transformation—not to copy an inferred shape.
- Make invalid states unrepresentable where it clarifies a durable rule; do not
  turn simple code into type-level ceremony.

## Quality gate

`bun run verify` is the canonical handoff gate. It runs format, lint with every
warning denied, configuration linting, type checking, Knip, doc and architecture
validation, unit/contract/workflow tests, real-Postgres integration, and
happy-path Playwright/Axe E2E as configured. Fix failures; do not suppress or
downgrade them to warnings.

## Testing choice

| Change                   | Proof                                            |
| ------------------------ | ------------------------------------------------ |
| Pure meaningful rule     | Unit test with a fixture that can falsify it.    |
| Query/migration          | Disposable real Postgres integration test.       |
| oRPC/WebMCP seam         | Contract/schema/auth and observable result test. |
| Substantial user feature | One clean happy-path Playwright test plus Axe.   |

Tests need an independent oracle—known state or public output—not an assertion
that repeats the implementation's branches. E2E stays happy-path focused;
lower-layer tests cover meaningful recovery behavior.

## Links

[Testing strategy](../reference/testing-strategy.md) · [Error handling](../guides/error-handling.md) · [Feature workflow](../guides/feature-workflow.md)
