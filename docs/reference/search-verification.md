# Search verification

Use alongside the [search delivery workflow](../guides/search-discovery-workflow.md).
Tests prove implementation behavior, not ranking or citation outcomes.

## Required evidence by change

| Change                | Independent proof                                                                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New public page       | Real response has useful HTML text, one clear main heading, accurate distinct title/description, trusted absolute canonical, and incoming navigation link. |
| Metadata inheritance  | A second route's canonical and title are its own; no accidental home canonical or private data in social tags.                                             |
| robots/noindex        | Production and preview policies match intended visibility. Inspect response metadata/headers and robots separately; disallow is not proof of de-indexing.  |
| Sitemap               | Exact expected public canonical fixture URLs, no account/auth/admin/token/preview/query URLs, valid XML, real modification dates if supplied.              |
| Markdown              | GET/HEAD negotiation, alternate and canonical relationships, `Vary: Accept`, equivalent facts, and identical permission boundary.                          |
| Structured data       | Valid JSON, actual eligible type, visible factual values, no placeholders; hostile `</script>`-style content cannot escape serialization.                  |
| Move/removal          | Correct redirect target or 404/410, no redirect loop/soft-404; navigation and all indexes updated.                                                         |
| Rendering/performance | Desktop/mobile accessibility happy path; content without interaction; measured layout/font/image behavior and field metrics when available.                |

Use lower-level boundary tests for bad hosts, malformed data, private routes,
and serialization. Keep the browser journey focused on a person discovering,
reading, and taking the intended action. Do not add hundreds of SEO snapshots
or a test that computes expected metadata with the production helper itself.

## Pre-launch checks

- Confirm the real canonical domain and destination before changing DNS or
  publishing. Keep unclaimed administrator bootstrap and previews protected.
- Request the public HTML URL normally and with the documented Markdown Accept
  header; compare semantic facts and inspect headers, status, and links.
- Check the actual production robots response, XML sitemap, page metadata, and
  CDN/firewall handling. Do not test crawler identity using a user-agent alone
  and conclude that IP-based filtering is correct.
- Validate applicable structured data with the official tools. A passing
  validator does not guarantee eligibility for every rich result.
- Use authorized Search Console/Bing access for index inspection and sitemap
  submission. Record not-run checks when access or deployment is unavailable.

## Handoff

Report implemented eligibility controls, tests run, intended indexed surfaces,
remaining launch actions, and measurement limits. Never say “indexed,” “ranking
improved,” “AI-ready everywhere,” or “100% SEO” based only on local tests.

[Technical SEO](../technologies/search-engine-optimization.md) · [GEO](../technologies/generative-engine-optimization.md) · [Testing strategy](testing-strategy.md)
