# Documentation tooling

Tooling in this directory enforces documentation invariants: authored Markdown
stays under 150 lines, internal links resolve, and required feature/design/
architecture changes are represented in the change manifest. Keep scripts small
and deterministic; `bun run verify` remains the only canonical user command.

See [the documentation map](../../docs/README.md) and
[change impact](../../docs/reference/change-impact.md).
