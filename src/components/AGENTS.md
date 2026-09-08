# Components guide

`shadcn/` is generated primitive territory. Other components are tiny reusable
primitives; reusable compositions belong in `src/modules/`, and route-only code
belongs under route `_modules/`. Follow [the design system](../../docs/design-system/README.md).

Shared form controls are registered by `src/modules/forms/` and pair configured
ShadCN/Base UI controls with TanStack Form lifecycle/accessibility behavior.
Do not create an independent form-state abstraction here.
