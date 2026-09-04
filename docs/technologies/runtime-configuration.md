# Runtime configuration

Configuration is a typed boundary. Use Varlock with `@t3-oss/env-nextjs` and
Zod schemas to separate public and server-only values. The checked-in schema and
example values describe required shape, never production secrets.

## Rules

- Read environment values only through the configuration module; do not scatter
  `process.env` throughout the application.
- Validate server and public values separately and fail builds/deployments when
  required configuration is absent or malformed.
- Keep secrets server-only, redact them from errors/logs, and rotate through the
  deployment platform rather than source control.
- Use an explicit development mail adapter and test configuration; production
  Resend credentials are never a local fallback.

## Decision matrix

| Value                                                  | Placement                                                  |
| ------------------------------------------------------ | ---------------------------------------------------------- |
| Browser-safe, intentionally public setting             | Public schema with `NEXT_PUBLIC_` naming.                  |
| Credential, database URL, signing secret, vendor token | Server schema only.                                        |
| Optional feature integration                           | Explicit optional schema and documented disabled behavior. |
| Test-only value                                        | Test environment/configuration, never production defaults. |

Update [preview risk](preview-risk.md) when a runtime choice changes deployment
or rollback behavior.
