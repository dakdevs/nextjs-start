# Application form architecture

Application forms are a shared delivery boundary: TanStack Form owns behavior;
ShadCN/Base UI owns the visible controls. Use both layers together.

## Required composition

`src/modules/forms/contexts.ts` is the only place that calls
`createFormHookContexts`. `src/modules/forms/use-app-form.ts` is the only place
that calls `createFormHook`; it registers the shared field and form components
and exports `useAppForm` and `withForm`.

Application code composes a form through `useAppForm`, `form.AppField`, and
`form.AppForm`. It does not import TanStack's `useForm`, hook factories, or core
form APIs. The architecture check enforces that boundary and rejects named
competing form packages. An exception requires an explicit, narrowly scoped
change to that checker and its independent fixture test; it is not a comment
that disables the rule.

## Control and state rules

- Registered field components connect a configured ShadCN/Base UI control to
  field value, change, blur, accessible label/description, and validation.
- Registered form components provide semantic submission and form-level
  feedback. Subscribe only to the small state slice a component displays.
- TanStack Form owns values, validation, reset, and pending/submission state.
  Do not mirror them in `useState`, Jotai, or another form library.
- This includes search and filter controls. `nuqs` stores a published URL value;
  synchronize it at that boundary without keeping a second React draft value.
- Preserve inference from default values through field names and extracted
  sections. Do not use `any`, assertions, or loose generic form props.
- Keep an actual HTML `form`, intentional method, autocomplete, labels,
  keyboard submission, and focus behavior. Overlay selects must participate in
  the same field lifecycle.
- A typed callback that already shows safe feedback throws
  `ReportedSubmissionError`. TanStack therefore records an unsuccessful submit,
  preserves values for retry, and the wrapper avoids duplicate generic feedback.
  An unknown throw receives only the generic message and a fresh error ID.

## Composition decision

| Situation                   | Use                                                   |
| --------------------------- | ----------------------------------------------------- |
| Ordinary screen form        | One `useAppForm` with `AppField` and `AppForm`.       |
| Reused, typed field section | `withForm`; retain its exact default-value shape.     |
| Presentation-only state     | Local React state, separate from form behavior.       |
| Shared visual control       | Registered field component, backed by ShadCN/Base UI. |

Do not split a simple form merely to use `withForm`. The account profile editor
at `src/app/(app)/account/_modules/account-profile-editor.tsx` is the canonical
copyable `useAppForm` example; keep it current when the shared API changes. The
[form fixture](../../test/browser/form-fixture.tsx) demonstrates a typed
`withForm` section and an overlay select without adding production routes.

## Admin boundary

Chakra remains the admin workspace's layout and visual-system boundary. Admin
forms still use the shared TanStack Form plus ShadCN/Base UI control layer, so
their behavior, accessibility, and type flow match every other application
form.

## Evidence

Add type-level and browser coverage for composition, defaults, validation,
reset, submit behavior, and selects inside overlays. Keep the browser suite on
the happy path; test technical error details at the lowest useful seam.

## Links

[Application forms feature](../features/application-forms.md) · [TanStack Form](../technologies/tanstack-form.md) · [Frontend organization](frontend-organization.md) · [Testing](../reference/testing-strategy.md)
