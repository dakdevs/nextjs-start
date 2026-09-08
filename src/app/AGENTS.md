# App routes guide

Routes compose UI and delivery adapters; business behavior belongs in purpose-
built domain operations. Put route-only UI in adjacent `_modules/`. Read
[frontend organization](../../docs/architecture/frontend-organization.md) and
[BFF contracts](../../docs/architecture/bff-orpc.md) before adding data access.

Route forms compose `useAppForm`, `form.AppField`, and `form.AppForm` from
`~/modules/forms`; preserve native form method, autocomplete, labels, and
keyboard submission. See [application forms](../../docs/architecture/forms.md).

After route UI work, run the read-only
[`find-animation-opportunities`](../../.agents/skills/find-animation-opportunities/SKILL.md)
scout. Keep any accepted motion within the route task and the
[motion language](../../docs/design-system/motion.md).

Every route follows the [page metadata and social-image guide](../../docs/technologies/page-metadata-and-social-images.md): define safe metadata, canonical/indexing behavior, and a brand-matched fallback without disclosing private data. Add JSON-LD only for visible factual content.

Classify rendering and freshness under [Next.js rendering and caching](../../docs/technologies/next-rendering-and-caching.md). Keep page and layout shells synchronous unless they truly await; make any cache/invalidation contract explicit.

For public routes, follow the [search delivery workflow](../../docs/guides/search-discovery-workflow.md). Never expose private route data for discovery.
