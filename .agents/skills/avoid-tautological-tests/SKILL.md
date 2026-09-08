---
name: avoid-tautological-tests
description: Design defect-sensitive tests with independent oracles; use when adding or reviewing tests, fixtures, mocks, expected values, snapshots, or test plans.
---

# Avoid tautological tests

Before adding or changing tests, read the mandatory
[build-product router](../build-product/SKILL.md),
[testing strategy](../../../docs/reference/testing-strategy.md), and the one
feature or boundary guide being proved. Use [change impact](../../../docs/reference/change-impact.md)
to find any required seam-specific evidence; do not load unrelated guides.

Test an outcome using an oracle independent from the implementation being
tested. Choose fixtures, persisted state, contract responses, or visible UI that
would expose a plausible wrong implementation.

Avoid repeating production branching in the assertion, snapshotting an opaque
implementation result, mocking the unit under test, or asserting private calls
when observable behavior is available. A test should fail when behavior changes
even if internals are refactored.

For substantial features, keep browser coverage to a clear happy path and put
technical edge behavior at lower seams when it matters. Form changes also need
the type/browser evidence in [application forms](../../../docs/architecture/forms.md).
Run the documented quality gate and fix failures rather than weakening tests or
their assertions.

This original local summary is informed by
[dakdevs’ Principle: Avoid Tautological Tests](https://github.com/dakdevs/skills/tree/main/skills/principle-avoid-tautological-tests).
