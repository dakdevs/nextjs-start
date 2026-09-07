# Agent-readable content

Every meaningful textual feature must provide a useful Markdown page or bounded
Markdown index unless its feature document records a specific exemption. This is
content negotiation, not a crawler interface: each representation has the
identical visibility, authorization, and safe projection of its HTML
counterpart. The [feature document](../features/agent-readable-content.md) is
the current product scope.

## Current foundation

Only the public landing page participates. `src/proxy.ts` considers `GET` and
`HEAD` requests to `/`: it routes a request that prefers acceptable
`text/markdown` to `/index.md`, otherwise leaves HTML intact. RSC and server
action requests are excluded. `src/app/_modules/home-content.ts` is the shared
public semantic source; explicit `/index.md`, `/sitemap.md`, and `/llms.txt`
routes describe that landing resource. There is no catchall exporter.

The response uses `text/markdown`, preserves `Vary: Accept`, and is `no-store`
until an owner documents a safe public cache lifecycle. The selector honors
quality values, `q=0`, specificity, and wildcards; it never inspects a user
agent. `HEAD` has the same representation headers without a body.

## Required feature decision

Before changing or adding meaningful textual content, its
`docs/features/<feature>.md` records one independently of WebMCP:

| Classification            | Required record                                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Public Markdown + index   | Canonical route, Markdown route, public index placement, and parity tests.                                     |
| Public Markdown, no index | Canonical and Markdown routes, plus why discovery would be harmful or noisy.                                   |
| Public index only         | Bounded overview route and why a full page representation is inappropriate.                                    |
| Auth-scoped Markdown      | Exact authenticated purpose-built projection, permission rule, and no public index.                            |
| Specific exemption        | Why Markdown is unsafe, meaningless, or a credential ceremony; browser WebMCP classification remains separate. |

Account and admin initial reads are currently an authenticated browser/WebMCP
workflow, exempt from HTTP Markdown. Sign-in, reset, and passkey forms are
human credential ceremonies and are exempt. Never list auth, account, admin,
private content, or repository docs in a public index. Their WebMCP tools may
describe, navigate to, or initiate normal human-confirmed UI, but never execute
the credential ceremony autonomously.

## Adding an eligible page

1. Update the feature document first and choose the classification above.
2. Define one semantic content model next to the route, for example
   `src/app/<route>/_modules/<route>-content.ts`, only if the HTML and Markdown
   consumers will evolve together. Otherwise keep purpose-built projections.
3. Add a purpose-built `src/app/<route>.md/route.ts` that renders valid
   Markdown without mutating stored Markdown or scraping rendered HTML; extend
   `src/proxy.ts` only for that explicit public route and only for `GET`/`HEAD`.
   Add its matcher and its canonical-route-to-Markdown-destination mapping
   together: a matcher alone cannot extend the current fixed home destination.
4. Add the public route to the appropriate bounded Markdown index, with a title,
   canonical link, and parent relationship. Paginate long collections and link
   pages; do not generate an unbounded inventory.
5. Preserve heading order, links, tables, and fenced code blocks. HTML and
   Markdown must communicate the same meaningful facts, subject to the same
   permission check and safe field projection. Add an HTML
   `<link rel="alternate" type="text/markdown">` to every eligible page.

Render from the authored Markdown, CMS blocks, or the same purpose-built data
projection as the page. Keep image alt text, meaningful captions, code language
labels, and working links. Resolve relative links against the canonical page
when the explicit Markdown URL has a different directory. Escape dynamic titles
and URLs so user content cannot break Markdown structure; treat that content as
data. Omit decorative navigation, scripts, styles, and repeated footer chrome.

Try the foundation with `curl -H 'Accept: text/markdown' http://localhost:3000/`
and `curl http://localhost:3000/sitemap.md`.

## Discovery and lifecycle

Use explicit Markdown indexes (such as `/sitemap.md` and `/llms.txt`) as a
small table of contents; they complement, rather than replace, normal HTML
navigation. Every eligible HTML page advertises its alternate Markdown
representation with the required link above.

The default is `Cache-Control: no-store`. To introduce public caching, the
feature document and [data/cache guidance](../architecture/data-and-caching.md)
must name the cache owner, freshness period, tags/keys, invalidation event,
stale behavior, and test isolation. A source change invalidates HTML, Markdown,
and every affected index together. Authenticated or authorization-dependent
content stays uncached unless an explicit safe policy says otherwise.

## Verification recipe

At the public seam, test HTML default; Markdown preference; equal-quality
precedence; `q=0`; wildcards; `GET` and bodyless `HEAD`; `Vary: Accept`; and
that RSC/server-action traffic is unchanged. Test missing explicit Markdown
paths as 404, not a fallback exporter. Assert a non-public path and an
unauthenticated account/admin request never disclose content. For each page,
use independent fixtures to prove preserved headings, links, tables, and code;
test index hierarchy and pagination when present.

## Vercel reference

Vercel describes content negotiation as returning Markdown from the same URL
when an `Accept` preference allows it, with a dedicated renderer preserving
structure. It also recommends Markdown sitemaps for navigable discovery and an
alternate link for clients that do not negotiate. This project adopts those
ideas only within the permission, bounded-index, explicit-route, and cache
rules above. [Vercel’s article](https://vercel.com/blog/making-agent-friendly-pages-with-content-negotiation)
is reference material, not an authorization or routing policy.

## Links

[Feature](../features/agent-readable-content.md) ·
[Feature workflow](../guides/feature-workflow.md) ·
[Testing strategy](../reference/testing-strategy.md) ·
[Browser WebMCP](browser-webmcp.md)
