# Security headers

## Starting policy

`next.config.ts` sends same-origin defaults, clickjacking protection,
content-type protection, a strict referrer policy, and a browser WebMCP
Permissions Policy. Add an external origin only for a reviewed feature that
requires it.

The starting CSP allows inline scripts and styles. This is the documented
Next.js compatibility baseline for applications that retain static rendering;
it is not a complete XSS defense. Never weaken output escaping, URL validation,
or trust-boundary parsing because this header exists.

## Nonce decision

Use a fresh nonce and `strict-dynamic` when the application handles especially
sensitive data, must meet a strict CSP compliance requirement, or accepts a
script-injection surface that makes `unsafe-inline` an unacceptable risk.

In Next.js, a nonce requires request-time generation in `proxy.ts`. It makes
every covered page dynamic, disables static optimization and ISR, prevents
ordinary CDN page caching, and is incompatible with Partial Prerendering.
Do not impose those costs on every application cloned from this template.

When the threshold is crossed:

1. Record the security requirement in the affected feature document and ADR.
2. Generate a cryptographically random nonce per request in `proxy.ts`.
3. Send the same CSP on the request and response so Next can nonce its scripts.
4. Allow `unsafe-eval` only in local development; remove script `unsafe-inline`.
5. Opt covered routes into dynamic rendering and test the built application.
6. Re-audit every new script, style, frame, image, and network origin.

Experimental SRI may preserve static rendering, but it is not the template
default until Next.js marks that path stable and it covers the application’s
actual script model.
