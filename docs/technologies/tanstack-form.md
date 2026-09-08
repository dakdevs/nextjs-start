# TanStack Form

`@tanstack/react-form` is the sole application form-behavior library. The
shared layer is intentionally based on TanStack Form's current React
[Form Composition guide](https://tanstack.com/form/latest/docs/framework/react/guides/form-composition).

## Shared API

The layer at `src/modules/forms/` creates its contexts once, then creates one
application hook with registered field and form components. Application code
uses:

```tsx
const form = useAppForm({ defaultValues, onSubmit })

return (
  <form.AppForm>
    <form.AppField name="displayName">
      {(field) => (
        <field.TextField
          label="Display name"
          autoComplete="name"
        />
      )}
    </form.AppField>
    <form.SubmitButton>Save changes</form.SubmitButton>
  </form.AppForm>
)
```

This is an illustrative shape, not a second abstraction to copy. The account
profile editor at `src/app/(app)/account/_modules/account-profile-editor.tsx`
is the canonical executable example. The [browser fixture](../../test/browser/form-fixture.tsx)
is the focused `withForm` and overlay-select reference.

## When composing

- Register shared fields for the configured ShadCN/Base UI controls rather than
  duplicating value/change/blur and accessible-error wiring per screen.
- Register form-level feedback and submit components; use targeted subscriptions
  for submission and validation feedback rather than subscribing to all state.
- Extract a typed section with `withForm` only when it has a real reusable
  composition boundary. Name its render function and carry inferred default
  value keys through it.
- Prefer `formOptions` and supported TanStack helper/types when they preserve
  inference. Never work around a mismatch with `any` or a type assertion.

## Guardrails

The architecture checker blocks direct `useForm`, form-hook factories,
namespace/dynamic/re-export bypasses, direct `FormApi` use, and declared
competing form packages. It deliberately permits type and helper imports such
as `formOptions` and `useStore` when a shared implementation needs them.

TanStack Form behavior and ShadCN/Base UI controls are paired. Native semantics
remain required, including an HTML form, intentional method, autocomplete,
labels, keyboard submit, and overlay select integration.

Search and filter inputs are application forms too. Use a registered `AppField`;
when the filter belongs in the URL, publish it through `nuqs` at the URL
synchronization boundary instead of retaining an additional React draft value.

## Submission failure

When a typed API outcome has already produced safe form-level feedback, its
owner throws `ReportedSubmissionError` after reporting it. This keeps TanStack
Form's submit outcome unsuccessful, retains values for retry, and prevents the
shared wrapper from replacing the useful feedback with a duplicate generic one.
Unknown thrown failures are logged with a UUID and shown only as “Something went
wrong” plus that ID; no payload or implementation detail reaches the person.

## Links

[Form architecture](../architecture/forms.md) · [Type flow](type-flow-tooling.md) · [UI and state](ui-and-state.md) · [Form Composition guide](https://tanstack.com/form/latest/docs/framework/react/guides/form-composition)
