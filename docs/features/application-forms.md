# Application forms

Status: active · Owner: application platform · Last reviewed: 2026-09-07

## Problem and value

Give every person a predictable, accessible way to enter and submit information
while giving product work one typed, composable form architecture.

## Goals

- Consistent labels, validation, feedback, keyboard behavior, and submission
  states make forms easier to use and review.
- A shared TanStack Form layer preserves field-name and value inference as forms
  grow from a simple screen into typed sections.
- The architecture prevents an accidental mix of form state systems.

## Users and entry points

Any person entering application data, from authentication through an account or
admin workflow, encounters this architecture through the feature that owns it.

## Core happy path

1. A person opens a native form, sees its labeled controls, and may use
   autocomplete and the keyboard.
2. The configured control updates its TanStack Form field and validates at the
   intended lifecycle point.
3. The person submits once; form-level feedback communicates the result.
4. The form resets or advances only after the successful application outcome.

## Invariants and decisions

- All application forms use `useAppForm`, `form.AppField`, and `form.AppForm`
  from `src/modules/forms/`.
- The shared layer owns values, validation, reset, and submission state. Local
  React state may support presentation only, never duplicate those concerns.
- Field components bind configured ShadCN/Base UI controls to labels, change,
  blur, validation, and accessible descriptions. Form components provide
  submission and form-level feedback.
- `withForm` is for a genuinely reusable typed form section, not compulsory
  decomposition of a small form.
- Overlay controls, including selects, keep their native semantics and form
  lifecycle integration.
- Search and filter inputs use the same shared layer; URL publication through
  `nuqs` does not authorize a duplicated local draft state.

## Non-goals and not valuable now

- Replacing ShadCN/Base UI controls with a form library's visual controls.
- Supporting a second application form library or generic untyped form props.
- Hiding validation and pending state in custom local state.

## WebMCP parity

Credential and mutation forms remain human UI initiation points. Their
meaningful reads and actions are exposed through the feature's browser WebMCP
capabilities or explicitly exempted under the WebMCP guidance; form state is
not a separate agent contract.

## Agent-readable content

Forms do not create a separate Markdown projection. The result or source
content they expose follows the owning feature's Markdown classification.

## Success and open questions

- Static architecture checks reject form-layer bypasses and competing form
  libraries.
- Type and browser tests cover composed fields, defaults, validation, reset,
  submission, and selects in overlays.
- The canonical example remains current as the shared API evolves.

## Links

- [Form architecture](../architecture/forms.md)
- [TanStack Form](../technologies/tanstack-form.md)
- [Frontend organization](../architecture/frontend-organization.md)
- [Feature workflow](../guides/feature-workflow.md)
