# Documentation tooling

Tooling in this directory enforces documentation invariants: authored Markdown
stays under 150 lines, internal links resolve, and required feature/design/
architecture changes are represented in the change manifest. Keep scripts small
and deterministic; `bun run verify` remains the only canonical user command.

The same link and line-limit checks cover repository-local skill Markdown and
root/source/tooling `AGENTS.md` entry points, not just `docs/`. New guidance must
remain reachable through the owning skill and the documentation map.

See [the documentation map](../../docs/README.md) and
[change impact](../../docs/reference/change-impact.md).
