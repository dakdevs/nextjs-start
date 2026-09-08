# Source guide

Start with [`build-product`](../.agents/skills/build-product/SKILL.md) and read
the guides selected for the task before changing source.

Read [the architecture map](../docs/architecture/README.md) and the owning
feature document before changing behavior. Keep domain logic independent of
Next, oRPC, Drizzle, Vercel, and WebMCP delivery details. Update docs according
to [change impact](../docs/reference/change-impact.md).

Application forms use only `~/modules/forms`' `useAppForm`, `AppField`, and
`AppForm`. Do not bypass it with direct TanStack Form APIs or another form
library; see [form architecture](../docs/architecture/forms.md).

After creating or materially changing UI, run the read-only
[`find-animation-opportunities`](../.agents/skills/find-animation-opportunities/SKILL.md)
scout. Its report may recommend no changes; implement motion only when it is
within the user's UI task.
