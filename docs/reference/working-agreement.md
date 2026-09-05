# Working agreement

This page records explicit collaboration preferences that affect future delivery.
It is not a substitute for feature documents or a place for inferred preferences.

## Test-video preference

**Current preference:** ask

After a feature has passed manual desktop and mobile testing, ask whether the
user wants a Playwright recording. Record one of these explicit choices:

| Preference | Delivery behavior                                             |
| ---------- | ------------------------------------------------------------- |
| `always`   | Capture a happy-path video for qualifying feature deliveries. |
| `ask`      | Ask after manual testing; this is the default.                |
| `never`    | Do not offer or capture routine test videos.                  |

Videos are produced only with `bun run test:e2e:video`, which sets Playwright's
video flag and writes files below `test-results/`. They are optional evidence;
manual testing and `bun run verify` remain required.

## Updating this agreement

Change a preference only after the user states it. Add another preference only
when it reliably changes the delivery workflow across features; keep feature-
specific choices in that feature's document instead.

## Links

[Agent feature delivery](../guides/agent-feature-delivery.md) · [Testing strategy](testing-strategy.md) · [Feature workflow](../guides/feature-workflow.md)
