# Search and answer-engine delivery

Apply this workflow whenever a feature adds, changes, removes, or moves public
content. SEO means helping search engines discover useful pages; GEO means
making truthful content understandable and attributable in generated answers.
Neither guarantees indexing, ranking, traffic, or citations.

## Decide from feature intent

Record in the owning feature: audience and question/job, canonical URL,
production visibility, indexing decision, Markdown classification, source of
claims, owner, freshness trigger, and the useful visitor action. Keep one
coherent intent per page; do not create a page for every keyword variation.

| Surface                                                         | Default decision                                                                                                                      |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Useful public product/content page                              | Eligible for indexing; unique metadata, crawlable links, canonical, XML sitemap entry, and appropriate Markdown access.               |
| Auth, recovery, account, admin, private or personalized content | Authentication and safe projections first; no public indexes. Apply `noindex` where reachable; robots rules are not access control.   |
| Search results, filters, sort variants                          | Keep unbounded combinations out of indexes. Index only deliberately authored, independently useful landing pages.                     |
| Preview, staging, unfinished product                            | Protect deployment and mark non-indexable. Check actual response headers; never rely solely on the hostname or platform assumption.   |
| Moved or removed content                                        | Relevant permanent redirect for a genuine replacement; otherwise correct 404/410. Update links, canonicals, and all indexes together. |

## Agent-owned work

1. Inspect the current route, feature document, content source, metadata,
   response headers, robots rules, XML and Markdown indexes, and internal links.
2. Research current official guidance for any unfamiliar page type or crawler.
   For content research, inspect actual audience queries and comparable results;
   never invent search volumes or competitor performance.
3. Apply [technical SEO](../technologies/search-engine-optimization.md) and
   [GEO](../technologies/generative-engine-optimization.md) to the smallest useful
   page. Keep the design system: no SEO filler, gratuitous subtitles, or extra
   type sizes. Content retains balanced wrapping.
4. Test source/rendered metadata, semantic content, status/redirects, public
   discovery, and privacy boundaries. Update docs with code and pass `bun run verify`.
5. For an authorized deployment, inspect the real URL, including HTML default,
   Markdown negotiation, canonical origin, headers, and crawler access. Local
   success cannot prove that a deployed firewall permits a crawler.

Ask only for missing product choices: the production domain, intended public
audience/languages, disputed factual claims, or a policy change to crawler or
training access. Do not ask whether ordinary title/description, semantic HTML,
safe canonical URLs, or privacy checks should be implemented.

## Launch and evaluation

With the user's authorized account access, verify the production property in
Google Search Console and Bing Webmaster Tools and submit the XML sitemap.
Do not register accounts, alter DNS, install analytics, or publish content
without appropriate authority. If access is absent, record the exact remaining
launch action without claiming indexing has been checked.

Use URL Inspection and crawl/index reports to diagnose eligibility. Track
impressions, qualified clicks, conversions, index coverage, and field experience
for the page's intended job. A `site:` query is a clue, not a complete index audit.
For AI visibility, keep a small, repeatable set of real audience questions;
record engine, date, locale, cited URL, and factual accuracy. Responses vary;
sampled citation counts are observations, not universal market share or causation.

Review after material content/route changes and after enough real data accumulates.
Do not schedule recurring monitoring without user authorization. Correct stale
claims rather than mechanically changing dates or expanding word count.

[Writing feature docs](writing-feature-docs.md) · [Protecting the product](protecting-the-product.md) · [Search verification](../reference/search-verification.md)
