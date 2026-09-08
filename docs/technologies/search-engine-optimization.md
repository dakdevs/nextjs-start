# Search engine optimization

Use the [search delivery workflow](../guides/search-discovery-workflow.md) for
every public-content change. This page is implementation guidance, not a claim
that all described SEO features already exist in the starter.

## Page and content contract

Write for a real audience need. Use a descriptive main heading, logical heading
order, meaningful link text, useful image alternatives, and navigable parent/
sibling relationships. Important public facts must be available as semantic
text, not only canvas, images, or an interaction-gated client fetch. Prefer
server-rendered content through the existing App Router boundary.

Give each eligible page an accurate, distinct title and description. Keep them
concise; fixed character counts are editorial hints, not ranking guarantees.
Do not add meta keywords, keyword-density targets, minimum word counts, or
unsupported claims to satisfy a checklist. [Google's starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

## Next.js implementation

- Read the installed Next.js metadata, robots, sitemap, and JSON-LD guides first.
  Use `metadata` or `generateMetadata` in the owning server page/layout, not
  client effects that rewrite the document head.
- Define `metadataBase` from the validated, trusted production origin. Never
  derive canonical hosts from an untrusted request header. Put each page's
  canonical in its own metadata; a root-layout `/` canonical must not leak to
  every route through inheritance.
- Reuse the page's semantic content for metadata only where both consumers
  evolve together. Keep private fields out of metadata and social previews.
- Add real Open Graph/social image assets when available; never reference a
  nonexistent image or manufacture company identity.
- Use `src/app/robots.ts` and `src/app/sitemap.ts` when implementing crawl
  discovery. XML sitemap entries are absolute, canonical, public, indexable
  URLs returning useful 200 responses. Do not enumerate every filesystem route.
- `lastModified` reflects a genuine content update, not the build/request time.
  Split large sitemaps using the installed `generateSitemaps` API when needed.
- For translations, use distinct URLs and reciprocal language alternates only
  for real equivalent translations; canonicalize within the matching language.

[Next metadata](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) · [Next sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)

## URLs and visibility

Canonical signals, internal links, and XML sitemap URLs must agree. Use a
permanent redirect for a genuinely replaced URL. Give pagination useful URLs
and crawlable links; do not canonicalize distinct pages to page one. Classify
filter/sort URLs deliberately rather than generating infinite crawl spaces.
Explicit Markdown representations can use an HTTP `Link` canonical pointing
to equivalent HTML; preserve the HTML alternate and `Vary: Accept` behavior.
[Canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

For reachable non-indexable HTML, use robots metadata; for non-HTML resources,
use `X-Robots-Tag` when applicable. A crawler must be able to fetch a response
to see `noindex`; combining a robots disallow with `noindex` does not guarantee
removal. Private data always requires authorization. Do not put sensitive URLs
in public robots rules or sitemaps as a supposed security measure.
[Indexing controls](https://developers.google.com/search/docs/crawling-indexing/block-indexing)

## Structured data

Use JSON-LD only for a supported type matching visible, true content. Article,
Product, Organization, and BreadcrumbList have different applicability and
required properties; research the exact type before implementing. Do not add
fake ratings, hidden FAQs, invented authors, prices, or business addresses.
Serialize safely, escaping `<` as `\u003c` before embedding JSON in a script;
test hostile user-provided text. Validate with Schema.org and, when eligible,
Google's Rich Results Test. Valid schema does not promise a rich result.
[Structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) · [Next JSON-LD](https://nextjs.org/docs/app/guides/json-ld)

## Experience and abuse prevention

Measure field Core Web Vitals at the 75th percentile: good LCP ≤2.5 seconds,
INP ≤200 milliseconds, and CLS ≤0.1. Use lab traces to diagnose, not as a
substitute for real-user evidence. Preserve responsive layout, stable image
dimensions, font loading, keyboard access, and restrained shipped JavaScript.
[Web Vitals](https://web.dev/articles/vitals)

Reject cloaking, doorway pages, scraped/scaled content with no added value,
hidden keyword text, and purchased/spam links. Mark sponsored or user-generated
links appropriately; do not label every useful editorial citation `nofollow`.
[Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies)

## Links

[GEO](generative-engine-optimization.md) · [Agent-readable content](agent-readable-content.md) · [Search verification](../reference/search-verification.md)
