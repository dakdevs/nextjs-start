# Copilot instructions

Start at [AGENTS.md](../AGENTS.md) and use [the documentation map](../docs/README.md).

- Keep oRPC contracts purpose-built per consumer.
- Use inferred TypeScript downstream of validated boundaries.
- Add behavior-facing tests with independent assertions; do not test an
  implementation by repeating its logic.
- Keep feature, design-system, and decision documentation current with code.
- Run `bun run verify`; treat every lint/format result as an error.
