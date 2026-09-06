# Better Auth, passkeys, and Resend

Better Auth owns email/password credentials, sessions, verification, recovery,
roles, and passkey integration. Resend is the production email adapter. The
starter is intentionally single-account: do not imply teams, SSO, tenants, or
invitation flows through naming or schema choices.

## User journey

1. A visitor signs up, verifies email, and signs in with password.
2. After login, the UI calmly prompts them to add a passkey.
3. The passkey uses the browser ceremony and becomes a second sign-in method.
4. The user may dismiss the prompt and continue with their password.
5. A time-limited emailed reset recovers password access.

Passkeys are not an unattended agent capability or a forced second factor. Keep
security-sensitive ceremonies in normal browser UI with human confirmation.

## Email adapter rules

Email is capability-driven, not baseline provisioning. When product discovery
identifies a mail journey, use the linked project's Vercel CLI to discover and
add the Resend Marketplace integration before implementing that journey. Pull
its environment values into ignored files without printing secret values. If
the CLI opens an account-claim step, pause for the user to complete it.

| Situation                              | Behavior                                                                         |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| Local development                      | Write to ignored `.next/development-emails`; log only an opaque message ID.      |
| Production delivery                    | Call Resend through an Effect service with timeout and structured logs.          |
| Transient, idempotent delivery attempt | Retry under the shared three-attempt policy.                                     |
| Vendor accepts idempotency key         | Supply a stable key for retryable send intent.                                   |
| Unsafe failure                         | Return generic safe feedback with error ID; never reveal token/provider payload. |

The Resend SDK does not accept an abort signal. Effect's timeout bounds the
caller's wait, while the stable idempotency key makes late vendor acceptance
safe.

## Links

[Authentication architecture](../architecture/authentication-authorization.md) · [Vercel platform services](vercel-platform-services.md) · [Effect 4](effect-4.md) · [Authentication feature](../features/authentication.md)
