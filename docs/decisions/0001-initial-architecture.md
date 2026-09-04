# ADR 0001: initial architecture

**Status:** accepted · **Date:** 2026-09-04

## Context

The template must be a production-oriented single-account application that stays
easy for people and agents to extend without generic, multipurpose backend
seams or undocumented product drift.

## Decision

Use a Next.js App Router single repository with Bun, Postgres/Drizzle, Better
Auth, contract-first oRPC, Effect 4 RC, Vercel Queues/Workflows, and browser-only
WebMCP. Keep BFF operations purpose-built. Keep domain logic independent of
delivery/framework details. Use direct queue publishing by default and optional
transactional outbox only for critical atomic database/event invariants.

Use Tailwind and ShadCN Base UI with local-first UI composition. The shipped
light default uses a warm neutral canvas with tonal surfaces and filled controls
for hierarchy, not a border-only system. Treat feature, design, architecture,
and technology documents as current truth and gate required updates in verification.

## Consequences

The starter accepts managed preview/beta risk for Effect/oRPC/WebMCP/Queues and
controls it through exact pins, thin adapters, contract tests, and documented
upgrade review. It favors explicit operation files over generic reuse and
requires a WebMCP classification for meaningful user-facing capabilities.

## Reversal signal

Revisit when a stable integration removes a material adapter burden, Vercel or
browser support changes, or the single-account model no longer fits product
value. Update the affected current-truth page and add a superseding ADR.
