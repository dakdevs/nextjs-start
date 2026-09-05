# Brand-matched dither imagery

Every placeholder image in this starter is generated as a dither-style asset
that fits the product's current brand. A placeholder is part of the interface,
not an excuse for arbitrary stock imagery, remote images, gradients, or a
visually unrelated default.

## Rules

- Generate the asset for the feature and keep it in the repository with a
  meaningful filename. Do not use a random remote placeholder service.
- Start from semantic brand tokens and the current light/dark direction. The
  image should support surrounding content, not become a new source of product
  colors or type hierarchy.
- Derive any variable dither treatment from a stable, documented seed (for
  example the action title). The same input produces the same result across
  server render, hydration, test, and revisit.
- Use a local Dither Kit source wrapper for small UI texture/backdrops. Keep
  title-to-seed and palette selection in that wrapper; callers provide intent,
  not arbitrary visual parameters.
- Provide descriptive `alt` text when the image conveys content. Mark a purely
  decorative image empty-alt and never encode necessary text or state only in
  the image.
- Reserve dimensions/aspect ratio to prevent layout shift. Offer a static,
  non-animated representation under reduced motion.

## Workflow

1. Read the feature doc and current design tokens.
2. Name the image's job: content placeholder, workflow-card texture, or
   decorative context. If it lacks a job, omit it.
3. Generate a dither image with the current palette and a stable seed; preview
   it in light and dark themes at its actual size.
4. Commit the generated asset/source and record its seed rule where reusable.
5. Revisit it when the design language changes; update instead of accumulating
   unrelated visual styles.

## Completion check

The result is deterministic, branded, accessible, dimensioned, and subordinate
to the feature's content. A fresh agent can regenerate it from the documented
intent and seed rule.

## Links

[Design system](README.md) · [UI library selection](../reference/ui-library-selection.md) · [Motion guidance](motion.md) · [Evolution workflow](evolution.md)
