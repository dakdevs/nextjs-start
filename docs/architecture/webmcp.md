# Browser WebMCP

This starter uses browser-only WebMCP through a thin adapter around native
`document.modelContext`, `usewebmcp`, and `@mcp-b/webmcp-types`. There is no
remote MCP server and no global polyfill in production.

## Capability rules

- Register a tool only when it gives an agent a meaningful, non-overlapping way
  to read, navigate, or act in the current route.
- Prefer route-scoped tools; reserve global tools for global navigation/context.
- Keep names, descriptions, parameters, and outputs concise and strictly
  runtime-validated. Update visible UI state after execution.
- Maintain a capability manifest. CI requires every meaningful user-facing
  feature/read/action to be classified as shared oRPC, dedicated oRPC, or a
  documented exemption.
- Mark passive reads `readOnlyHint`; mark user-generated or external data with
  `untrustedContentHint`.

## Safety boundary

Use same-origin exposure by default. Cross-origin `exposedTo` needs a
per-feature security review. Destructive, financial, permission-changing, or
credential actions may only initiate and open a normal human-confirmation UI;
they do not complete autonomously. Low-risk reversible changes may execute.

## Sharing test

Share an app operation only if semantics, authorization, input, output, and
expected evolution are exactly the same. Otherwise create a dedicated capability
and, where useful, a dedicated backend operation.
