# Change impact

Use this table before handoff. Update only pages changed by the shipped truth;
do not retrofit unrelated documentation.

| Change                                              | Required accompanying update                                                                                                  |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| New/changed feature behavior                        | `docs/features/<feature>.md`, tests, WebMCP classification, `.changes` manifest.                                              |
| New oRPC consumer contract                          | Feature doc, [BFF guidance](../architecture/bff-orpc.md) if a reusable rule changes, contract tests.                          |
| Authentication, role, passkey, or mail flow         | [Authentication architecture](../architecture/authentication-authorization.md), authentication feature, and auth/email guide. |
| New WebMCP capability/exemption                     | Feature doc, capability manifest/tests, [WebMCP](../architecture/webmcp.md) if policy changes.                                |
| New visual primitive/token/pattern                  | Feature doc and [design system](../design-system/README.md); ADR if durable/reversing.                                        |
| New persistence shape/cache rule                    | Feature doc and [data/cache guidance](../architecture/data-and-caching.md).                                                   |
| New service/vendor/retry behavior                   | Feature doc and [Effect](../architecture/effect-services.md) or [risk policy](../technologies/preview-risk.md).               |
| New environment value/deployment config             | [Runtime configuration](../technologies/runtime-configuration.md) and deployment validation.                                  |
| Queue/workflow/outbox choice                        | Feature doc and [background work](../architecture/background-work.md); ADR for critical invariants.                           |
| Retry, timeout, or vendor adapter behavior          | [Effect 4](../technologies/effect-4.md), [error policy](../guides/error-handling.md), and relevant feature.                   |
| Component ownership, state, or reusable visual rule | [UI/state guide](../technologies/ui-and-state.md), design system, and feature document.                                       |
| Migration or exact database projection              | [Postgres/Drizzle](../technologies/postgres-drizzle.md), data/cache guidance, real-Postgres test.                             |
| Durable tradeoff/reversal                           | New ADR linked from the affected current-truth pages.                                                                         |
| Tooling/verification command                        | `AGENTS.md`, relevant nested router, and this table if workflow impact changes.                                               |

Every Markdown page links to its parent or relevant siblings so a fresh agent can
navigate from the root guide to a focused rule.
