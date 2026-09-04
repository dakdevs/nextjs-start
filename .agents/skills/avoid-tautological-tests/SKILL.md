---
name: avoid-tautological-tests
description: Design defect-sensitive tests with independent oracles; use whenever adding or reviewing tests, fixtures, mocks, expected values, or snapshots.
---

# Avoid tautological tests

Test an outcome using an oracle independent from the implementation being
tested. Choose fixtures, persisted state, contract responses, or visible UI that
would expose a plausible wrong implementation.

Avoid repeating production branching in the assertion, snapshotting an opaque
implementation result, mocking the unit under test, or asserting private calls
when observable behavior is available. A test should fail when behavior changes
even if internals are refactored.

For substantial features, keep browser coverage to a clear happy path and put
technical edge behavior at lower seams when it matters. See
[testing strategy](../../../docs/reference/testing-strategy.md).

This original local summary is informed by
[dakdevs’ Principle: Avoid Tautological Tests](https://github.com/dakdevs/skills/tree/main/skills/principle-avoid-tautological-tests).
