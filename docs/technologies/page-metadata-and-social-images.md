# Page metadata and social images

Every page receives deliberate metadata as part of feature delivery. Metadata is
not a public-only finishing step: private routes need safe titles, descriptions,
robots, canonicals, and a share-image fallback that reveal neither user data nor
the existence of a private record. Public pages receive accurate, useful social
metadata by default; JSON-LD is added only when it truthfully describes a real
entity or content visible on that page.

This guidance describes the target standard. It does not mean every route or
image route already exists.

## Page decision matrix

| Page kind                                 | Title and description                                  | Indexing and canonical                                                                             | Social image and JSON-LD                                                         |
| ----------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Public canonical content                  | Unique, factual, audience-facing                       | Normally `index, follow`; canonical public URL                                                     | Unique image where content benefits from sharing; factual schema when applicable |
| Public utility, error, or transient state | Clear purpose, never invented claims                   | Deliberately choose index/noindex; canonical stable route when one exists                          | Safe brand fallback; schema usually unnecessary                                  |
| Internal search or transient filter view  | Describe the base capability, never private query text | Normally `noindex`; canonical only a genuinely equivalent stable URL                               | Safe fallback; no private query, result, or account data                         |
| Public paginated collection               | Describe the collection and current page               | Choose indexing deliberately; self-canonical distinct pages, never collapse them all onto page one | Public collection image; schema only for visible factual content                 |
| Authenticated or private page             | Useful but generic enough for a browser tab            | Normally `noindex, nofollow`; only set a canonical if it is safe and meaningful                    | Safe generic brand fallback; no private JSON-LD                                  |

Record an exception and rationale in the feature document. Never allow a title,
description, canonical, image URL, alt text, schema payload, cache key, or
invalidation tag to disclose a private field, opaque identifier, search text, or
authorization-dependent existence.

## Implementation workflow

1. Inventory every route changed by a feature, including private and error
   states. Decide each row of the matrix before writing UI.
2. Put global defaults—site name, title template/default, trusted
   `metadataBase`, fallback social image, and broad robots policy—in the root
   server layout. `metadataBase` comes from a trusted deployment configuration,
   never a request `Host` header or user input.
3. Use a typed static `export const metadata: Metadata` when facts are known at
   build time. Use server-only `generateMetadata` only for route parameters,
   trusted content data, or parent metadata; await dynamic `params` before use.
   A route cannot export both.
4. Share the same purpose-built read for the page and its dynamic metadata when
   both need the same record. Prefer Next request memoization or React `cache`
   rather than a second fetch. Do not make metadata personalized merely because
   the page is authenticated.
5. Remember that segment metadata merges shallowly. Setting `openGraph` or
   `robots` replaces that nested parent object; explicitly preserve needed
   fields through a shared constant or `ResolvingMetadata` rather than silently
   dropping them.
6. Build public canonical URLs from the trusted base and stable route identity.
   Do not canonicalize a private route to a public page merely to fill a field.
7. Test rendered head output and the image response before calling the feature
   complete. See the verification checklist below.

File-based metadata has priority over object/generated metadata. Favor it for
images so Next emits image URL, type, dimensions, and associated tags together.

## Social-image contract

A root `opengraph-image` supplies the safe brand fallback. Place a more-specific
static `opengraph-image.(png|jpg|jpeg|gif)` beside a route only when every share
of that route benefits from it; add its `opengraph-image.alt.txt`. Add a matching
`twitter-image` only when the share treatment genuinely differs. Static files
are bounded by Next's provider limits (8 MB OG, 5 MB Twitter).

For content-specific images, colocate `opengraph-image.tsx` and import
`ImageResponse` from `next/og`. Export `alt`, `size` as `1200 × 630`, and
`contentType` (`image/png`); pass the same size to `ImageResponse`. Dynamic
image `params` are promises and must be awaited. Use only trusted, public,
purpose-built data—not page query strings, cookies, viewer identity, or private
fields.

`ImageResponse` uses Satori/Resvg, not the browser. Use supported JSX/CSS with
flexbox and explicit layout; do not assume Tailwind, CSS grid, or arbitrary CSS
works. `next/font` does not automatically supply an image font: load a known
local `.ttf`, `.otf`, or `.woff` asset once at module scope and pass its data in
the `fonts` option. Keep JSX, CSS, fonts, and images within the 500 KB bundle
limit; measure the built route and reduce assets or fetch safe public assets at
runtime if necessary. See [social-image design](../design-system/social-images.md).

Metadata image routes are cached by default. Define a deterministic public
identity for any dynamic image and align its cache/revalidation policy with its
source record. On source changes, invalidate the page metadata and image
together. Never vary an image response or cache entry on secrets, cookies,
private fields, raw query text, or an unbounded request value.

## JSON-LD truth contract

Use a native `<script type="application/ld+json">` in the server page or layout
when structured data helps identify factual visible content (for example, an
organization, an event, a product, or an article). Do not use `next/script` for
JSON-LD. Keep it a projection of the page's actual safe content: no fabricated
organization facts, ratings, reviews, availability, authors, dates, or claims.
Private and account-specific pages normally have no JSON-LD.

Serialize dynamic values safely: `JSON.stringify(jsonLd).replace(/</g,
'\\u003c')`. Type an eligible schema with `schema-dts` when that package is
introduced, but types do not make unverified facts acceptable. Validate public
schemas with an appropriate structured-data validator in addition to tests.

## Verification checklist

- Assert title, description, robots, canonical, Open Graph/Twitter image URL,
  and image alt for each changed route class; use independent fixtures for
  dynamic public records.
- Assert private and query routes have their chosen noindex/canonical behavior
  and leak no record, query, or viewer data in rendered head or image URLs.
- Render generated image routes: verify `200`, `image/png`, `1200 × 630`, alt,
  safe fallback behavior, and a representative long title. Inspect the image
  visually at its native size.
- Check cache/revalidation behavior with a source update fixture; verify that
  an image cannot be retrieved from another viewer's or query's cache key.
- Assert JSON-LD matches visible fixture facts, escapes `<`, and is absent when
  the matrix says it is unnecessary. Validate public schema before release.

## Links

[Social-image design](../design-system/social-images.md) ·
[Design system](../design-system/README.md) ·
[Feature workflow](../guides/feature-workflow.md) ·
[Agent-readable content](agent-readable-content.md)

[Next metadata](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) ·
[Next image conventions](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image) ·
[Next JSON-LD](https://nextjs.org/docs/app/guides/json-ld) · [SEO](search-engine-optimization.md)
