# React Doctor

React Doctor is a mandatory quality signal, pinned locally at `0.9.13`. Its
repository gate runs one complete root-project JSON scan and fails closed.

## Required result

- React is detected; one root project and application source are fully scanned.
- No project or check is skipped, and diagnostics, warnings, and errors are zero.
- Project and summary scores are exactly 100. Missing, malformed, or degraded
  output is a failure, never a pass.

## Narrow approved exception

The only approved false positive is `preventDefault` in
`src/modules/forms/form-components.tsx`, required for TanStack Form's native
submit lifecycle. It is not a general suppression. Any other exception needs
observed evidence, exact scope, explicit approval, and a review trigger.

An audit with this exact rule override removed still sees that false positive.
Normal JSON scans honor the configuration. Report 100 as the configured gate
result, not as proof that an exception-free audit has zero findings. Revisit
the exception when the shared submit lifecycle or detector changes.

## Generated Workflow routes

`@workflow/next` writes `src/app/.well-known/workflow/**` during a Next build,
including a nested `.gitignore` for those files. React Doctor excludes that
regenerable compiler output before scanning; it is not an authored route or a
rule suppression. The gate continues to scan the rest of `src/`, including
`src/app/`, before and after a build.

## Operating rule

Fix real diagnostics. Do not lower severity or add broad exclusions merely to
make a score green. See [protecting the product](../guides/protecting-the-product.md).

## Links

[Testing](../reference/testing-strategy.md) · [Forms](../architecture/forms.md) · [Type flow](type-flow-tooling.md)
