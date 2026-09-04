# Browser WebMCP

WebMCP is browser-only in this starter. A thin route-aware adapter registers
native `document.modelContext` capabilities through `usewebmcp`; development and
tests may use a polyfill, but production does not expose a remote MCP server.

## Parity workflow

For every meaningful user-facing read, action, or content surface, make one of
these explicit in its feature document:

| Situation                                                      | Agent outcome                                                         |
| -------------------------------------------------------------- | --------------------------------------------------------------------- |
| Helpful read/action with same app semantics                    | Route-scoped tool that shares the app operation.                      |
| Helpful capability with different shape/safety/auth            | Dedicated browser tool and, when needed, dedicated backend operation. |
| Global navigation/context                                      | Small global tool.                                                    |
| Credentials, permissions, money, deletion, irreversible action | Tool only opens normal human-confirmation UI.                         |
| Not meaningful or unsafe to expose                             | Specific recorded exemption and complete normal UI.                   |

Tools have concise names, descriptions, strict schemas, focused outputs, and
annotations (`readOnlyHint`, `untrustedContentHint`, and safety hints where
applicable). Update visible UI state after an executed safe capability.

## Safety rules

Same-origin is the default. Cross-origin exposure requires per-feature security
review. Do not make a browser agent a bearer of credentials or an autonomous
approver. Discoverability complements accessible UI; it never replaces it.

## Links

[WebMCP architecture](../architecture/webmcp.md) · [BFF contracts](../architecture/bff-orpc.md) · [Feature workflow](../guides/feature-workflow.md)
