# Errors and observability

An error crosses three different concerns: a typed domain result, a safe
user-facing outcome, and a structured operational record. Keep those concerns
connected by a correlation ID, not by exposing internals.

## Boundary flow

`external failure → tagged Effect/domain error → edge classification → user response + one structured log`

Expected failures retain a small safe message and code. Unknown failures receive
a generated UUID; display “Something went wrong” plus that ID and log the cause
once with the same ID. This is intentionally boring and searchable.

## Required log fields

- `errorId` for unexpected failure; `requestId`/trace context when available.
- operation/capability/worker name, route, authenticated actor identifier only
  when safe, and vendor status or retry attempt when relevant.
- Error class, cause, elapsed time, and stable event name.

Never log passwords, session material, tokens, full request bodies, raw vendor
responses containing personal data, or opaque passkey payloads.

## Decision matrix

| Situation                                    | Response                                                        |
| -------------------------------------------- | --------------------------------------------------------------- |
| Schema validation or known domain constraint | Explain the exact safe correction.                              |
| Missing session or permission                | Give a safe sign-in/access outcome; no protected detail.        |
| Retriable adapter failure                    | Retry only under the adapter policy, then surface safe failure. |
| Unknown, unsafe, or unexpected failure       | Generic message and UUID; structured log once.                  |

## Links

[Error-handling guide](../guides/error-handling.md) · [Effect services](effect-services.md) · [Type flow and tooling](../technologies/type-flow-tooling.md)
