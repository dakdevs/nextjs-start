# Social-image design

Social images are a compact expression of the product's real visual language,
not a miniature landing page. This is a starting direction only; no social-image
implementation is implied by this document.

## Default composition

Design for a `1200 × 630` landscape image with the current system's light,
warm-neutral canvas. Establish hierarchy through one or two restrained tonal
surfaces and a single purposeful filled accent—not a field of borders, cards, or
decorative chrome. Keep generous whitespace and a clear focal area so the image
remains legible in small share previews.

Show the route's honest title and, only when useful, a short factual context
line. A real, existing product mark may appear as a quiet anchor; do not invent
a logo, wordmark, customer mark, screenshot, or product capability. A generic
brand fallback must say nothing about private content or a viewer.

## Typography contract

Use the existing four semantic roles, including in image-rendering code:

| Role           | Social-image use                                              |
| -------------- | ------------------------------------------------------------- |
| `text-ui`      | Small product name or factual category                        |
| `text-body`    | One short supporting fact when it improves orientation        |
| `text-title`   | Standard share-image title                                    |
| `text-display` | Rare principal title, used instead of—not beside—`text-title` |

No fifth size, route-local scale, or arbitrary type hierarchy is allowed. In
`ImageResponse` styles, map those roles to the documented values rather than
introducing ad-hoc numeric sizes. Favor the centrally chosen product sans; when
rendering an image, explicitly load the same licensed local font asset because
browser `next/font` setup is not automatically available there.

Browser content keeps `text-wrap: balance` under the typography directive.
Satori is not a browser and must not be assumed to support that behavior. Give
the image title a bounded copy length, reserved flexible space, intentional
line-height, and a tested flex layout; render the final image to verify wrapping
instead of relying on unsupported CSS or manual line breaks.

## ImageResponse constraints

Use explicit inline styles and supported flexbox layout. Do not assume Tailwind
utilities, CSS grid, every browser property, remote font availability, or an
unverified asset format works in Satori. Ensure contrast at thumbnail scale,
keep text away from edges, and make the exported metadata `alt` describe the
meaningful visual (not merely "social image").

Keep the composition simple enough to fit the platform's 500 KB image-route
bundle constraint, including fonts and assets. A real local logo is optional;
if it makes the composition heavy or unclear, omit it. Never put secrets,
personal data, raw search text, or private identifiers into the pixels, alt, or
image URL.

## Evolving the language

When a feature needs a new social-image pattern, first ask whether the existing
tonal surfaces, accent, and four roles express its true share context. If not,
update the design-system decision and this document with the repeated product
need, visual intent, accessibility implications, and a representative image
test. Do not add a one-off flourish solely to make a preview look different.

## Links

[Page metadata and social images](../technologies/page-metadata-and-social-images.md) ·
[Typography](typography.md) · [Design system](README.md) ·
[Design-system evolution](evolution.md)
