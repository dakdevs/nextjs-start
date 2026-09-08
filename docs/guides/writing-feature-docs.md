# Writing feature documents

Feature documents are durable product memory, not implementation diaries. Create
or update `docs/features/<feature>.md` before code changes; keep it as the
current truth when code changes.

## Required shape

Use the headings in the existing feature pages: status/owner, problem and value,
goals, non-goals/not valuable, users/entry points, core happy path, invariants,
agent-readable content, WebMCP parity, success/open questions, and links.

## How to write

- State the user outcome first, then the rule that protects it.
- Describe observable behavior, not file names or a hoped-for implementation.
- Include what is explicitly not valuable so nearby scope creep can be rejected.
- Make the happy path a short sequence a human can recognize and test.
- When a feature specifies UI copy hierarchy, describe the information it must
  communicate; do not prescribe ornamental eyebrows or subtitles without a
  distinct orientation, status, or context purpose.
- Record an unresolved question only when its answer changes product behavior.
- Classify every meaningful textual result separately as public Markdown plus
  index, public Markdown without index, index-only overview, authenticated
  scoped Markdown, or a specific exemption; link the
  [agent-readable guide](../technologies/agent-readable-content.md).
- For every page, record its metadata/discovery contract: accurate title and
  description, canonical and indexability decision, brand-matched share-image
  choice, and JSON-LD rationale where structured data applies. Private pages
  still need truthful metadata, but never public discovery.
- Record each affected route's rendering/cache contract: static or dynamic
  reason, freshness requirement, invalidation path, and nearest async/Suspense
  boundary. Prefer synchronous page and layout shells unless they await data.
- Link parent architecture and sibling features that constrain the feature.

## Updating rules

Small clarifications edit the feature document in place. A material reversal,
tradeoff, or long-lived architectural choice gets a linked ADR in
`docs/decisions/`; update the feature page to point at it. Update design-system
truth when the feature changes reusable visual language.

## Agent interview rule

Ask one concise question only when a choice materially changes value, user
recovery, authorization, irreversible effects, or design language. Offer the
recommended default and its tradeoff. Do not ask for details derivable from the
feature’s stated outcome or existing docs.

## Completion check

The document lets a fresh agent explain the value, build the happy path, reject
non-goals, classify WebMCP access, and know which supporting docs to update.

## Canonical template

```md
# Feature: <name>

**Status:** proposed | current | retired · **Owner:** <team> · **Last reviewed:** YYYY-MM-DD

## Problem and value

<Who needs what outcome, and why it matters.>

## Goals

- <observable result>

## Non-goals and not valuable now

- <scope explicitly rejected>

## Users and entry points

<person, permission, route, and triggering situation>

## Core happy path

1. <observable user step>

## Invariants and decisions

- <durable rule and linked architecture/ADR>

## WebMCP parity

<tool, shared/dedicated decision, safety annotation, or specific exemption>

## Agent-readable content

<Markdown/index classification, exact visibility and projection, or specific exemption;
this is independent of WebMCP>

## Page metadata and discovery

<For each page: title/description, canonical, index/noindex, share image, and
JSON-LD rationale if applicable. Private pages remain outside public discovery.>

## Rendering and cache contract

<Static or dynamic reason, freshness requirement, invalidation path, and nearest
async/Suspense boundary.>

## Success and open questions

<measurable outcome; only product-changing unresolved questions>

## Links

<parents, siblings, tests, and ADRs>
```
