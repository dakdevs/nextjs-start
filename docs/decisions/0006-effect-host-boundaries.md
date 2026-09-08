# ADR 0006: preserve host contracts without weakening brace or correctness rules

Status: accepted

## Context

The full shared Oxlint presets combine Effect-native style recommendations with
Next.js, browser, authentication, Workflow, and test-runner entry points. Some
recommendations reject the Promise signatures or native APIs owned by those
hosts. Moving every such boundary into Effect would change established
contracts or introduce unnecessary runtime layers.

The shared defaults also previously combined mandatory arrow braces with a
recommendation to remove them. That contradiction was corrected
[upstream](https://github.com/dakdevs/oxlint-plugin/pull/7).

## Decision

Keep the complete shared presets and promote warnings to errors. Permit only
the explicitly reviewed file-and-rule exceptions in
[the host-boundary policy](../technologies/effect-lint-boundaries.md).
Keep the manifest inside the root Oxlint config so its native loader does not
require a relative TypeScript-extension exception.

Braces remain mandatory for every arrow function and control-flow body,
including tests and framework callbacks. No exception may relax either rule.
Effect correctness remains enforced everywhere; production Effect services
retain their full service policy.

## Consequences and reversal signal

Native host integration remains straightforward, but a newly introduced
boundary is not automatically exempt. Its diagnostic must be reviewed against
the host contract and explicitly approved before adding a scoped entry.

Revisit an entry when its file or responsibility moves, the host API changes,
or an updated detector understands the boundary. Remove obsolete entries;
never replace the manifest with a broad Effect-rule exclusion. The mandatory
brace and boundary-policy tests protect these constraints during updates.

## Links

[Decision index](README.md) · [Tooling](../technologies/type-flow-tooling.md) · [Effect services](../architecture/effect-services.md)
