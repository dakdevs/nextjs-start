# Preview and beta risk policy

The following choices are intentional. Pin exact versions, isolate their
adapters, test public seams, and review official release notes before upgrades.
Do not “float” a pre-stable dependency through a range.

| Technology         | Status / risk                                            | Guardrail and rollback                                                                                                                                       |
| ------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Bun on Vercel      | Vercel runtime support may change behavior from Node.    | Use Bun through project runtime config and test Vercel builds. A runtime change requires an ADR; this baseline does not support a second deployment runtime. |
| Effect 4 RC        | RC APIs and ecosystem integrations can change.           | Pin exact version; keep Effect at services/edges with tests using layers. Upgrade one release at a time.                                                     |
| oRPC 2 beta        | Needed for Effect 4 integration; contract APIs are beta. | Pin all oRPC packages together, keep contracts explicit, and use contract tests before upgrades.                                                             |
| Browser WebMCP     | Browser/API proposal and support are evolving.           | Thin adapter over native API; dev/test polyfill only; feature docs record exemptions and fallback UI remains complete.                                       |
| Vercel Queues beta | Trigger and delivery semantics can evolve.               | Isolate producer/consumer adapters, use idempotency, and test consumers without live queues.                                                                 |

## Upgrade decision

Upgrade when a security fix, required platform compatibility, or clear feature
value outweighs adapter/test effort. Read the official migration notes, update
one technology boundary, run the full gate, and record a decision when public
behavior or rollback changes.

## Not a waiver

Preview status never relaxes input validation, authorization, observability,
testing, or user-facing fallback expectations.
