# Feature: agent-readable content

**Status:** current · **Owner:** application team · **Last reviewed:** 2026-09-07

## Problem and value

Agents need the same public text a visitor can read without paying to parse page
chrome. A public Markdown representation and a small discovery index make the
landing content findable and compact while ordinary browser navigation remains
HTML.

## Goals

- Serve the public landing page as Markdown from the canonical URL when the
  request negotiates `text/markdown`; retain HTML as the default.
- Publish explicit `/index.md`, `/sitemap.md`, and `/llms.txt` discovery pages
  for the public landing content only.
- Require every future meaningful textual feature to classify its Markdown and
  index treatment separately from [Browser WebMCP](../architecture/webmcp.md).
- Keep Markdown and HTML semantically equivalent, permission-equivalent, and
  derived from the same source when all consumers benefit from shared evolution.

## Non-goals and not valuable now

- A catchall Markdown exporter, whole-site conversion, user-agent detection,
  Markdown rewriting/mutation, or content-provider setup.
- Publishing account, admin, auth, private, or repository documentation in the
  public index; crawling or bypassing authorization through a text format.
- Replacing authenticated browser WebMCP reads/actions with HTTP Markdown.

## Users and entry points

Visitors and agents may request `/` with `Accept: text/markdown`; HTML remains
the response when Markdown is unacceptable or loses to HTML by quality value.
They may also request `/index.md`, `/sitemap.md`, or `/llms.txt` directly.
Authenticated account and admin views remain browser-only initial reads with
their existing authenticated WebMCP capabilities. Sign-in, reset, and passkey
forms are credential ceremonies, not Markdown resources.

## Core happy path

1. A browser requests `/` and receives the existing HTML landing page.
2. An agent requests `/` with a preferred acceptable `text/markdown` media type.
3. It receives the equivalent public landing text with Markdown content type,
   `Vary: Accept`, and conservative no-store caching.
4. It follows the public Markdown index to the available landing resource.

## Invariants and decisions

- Only `GET` and `HEAD` public landing requests negotiate Markdown; RSC and
  server-action traffic never does. Quality values, `q=0`, and wildcards decide
  preference correctly, without user-agent sniffing.
- Markdown preserves headings, links, tables, and fenced code; indexes preserve
  a bounded hierarchy and paginate rather than emit unbounded lists.
- A representation has the same permission and safe projection as its HTML
  counterpart. Auth-scoped Markdown requires an explicit feature decision and
  an authenticated purpose-built projection; otherwise record the exemption.
- The app preserves `Vary: Accept`; content is no-store until a public cache
  owner, freshness, invalidation, and stale behavior are documented.
- Every changed meaningful text source updates all of its representations. Do
  not share a source merely for reuse when consumer evolution differs.

## Agent-readable content

The landing page is public Markdown plus a bounded public index. It exposes only
the public home projection through negotiated `/` and explicit `/index.md`,
`/sitemap.md`, and `/llms.txt`. Account/admin initial reads are authenticated
browser workflows and auth pages are credential ceremonies, each with the
specific exemption stated above; neither enters a public index.

## WebMCP parity

Public Markdown is a read representation, not a browser tool. Account and admin
reads/actions retain authenticated browser WebMCP parity; their initial HTTP
Markdown representation is explicitly exempt. Auth forms are human-confirmed
credential ceremonies and are exempt from Markdown exposure and autonomous
WebMCP execution; a WebMCP tool may still describe, navigate to, or initiate the
normal human-confirmed UI.

## Success and open questions

Success is that an agent can discover and read only the public landing content
at predictable URLs, while an unauthenticated request never gains account,
admin, auth, private, or repository text. Future features must record one of:
full Markdown plus index, Markdown without index, index-only overview,
authenticated scoped Markdown, or a specific exemption and reason. No open
product question.

## Links

[Agent-readable technology guide](../technologies/agent-readable-content.md) ·
[Feature workflow](../guides/feature-workflow.md) ·
[Data and caching](../architecture/data-and-caching.md) ·
[Authentication](authentication.md) · [Admin operations](admin-operations.md)
