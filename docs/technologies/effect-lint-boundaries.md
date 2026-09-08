# Effect lint boundaries

Use the full shared Oxlint presets and promote warnings to errors. The approved
exceptions in [the boundary manifest](../../oxlint.config.ts)
are explicit file-and-rule pairs, not a blanket Effect exclusion. They preserve
host contracts without moving Effect into every browser callback or test.

## Non-negotiable rules

- Keep `arrow-body-style: always` and `curly: all` as errors everywhere.
- Keep Effect correctness diagnostics enabled, including floating effects,
  missing context/error requirements, and unsafe error-channel types.
- Production Effect services, repositories, and queue adapters keep their full
  policy. Test files within those directories are test-runner boundaries.
- Do not disable all rules matching `effecttsgo/`, relax whole application
  directories, or suppress an unexplained finding inline.

## Approved boundary matrix

| Rule                                        | Reason and scope                                                                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `async-function`                            | Named Next, Better Auth, oRPC, UI submission, Workflow, test, and CLI boundaries return Promises to their host. Backend Effect services are not exempt. |
| `missing-pipeable-signature`                | Named framework-owned signatures and plain auth/tooling helpers are not public pipeable Effect combinators.                                             |
| `process-env`                               | Environment validation and named framework/test startup files ingest host configuration. Business logic consumes validated configuration.               |
| `node-builtin-import`                       | Named host tooling/tests and the development mailbox use filesystem, path, and process APIs.                                                            |
| `crypto-random-uuid`                        | Named request, auth, browser-error, mailbox, and test boundaries synchronously generate correlation IDs with host cryptography.                         |
| `global-date`                               | Named UI, auth, and persistence/workflow boundaries exchange native Dates; test fixtures use known timestamps.                                          |
| `new-promise`                               | Three named tests observe deferred submission or child-process completion. This is not permission to wrap ordinary backend I/O manually.                |
| `extends-native-error`                      | Only the form layer's already-reported submission error participates in the existing native Error lifecycle.                                            |
| `global-console`                            | Only the two browser error-reporting boundaries log sanitized details with a correlation ID.                                                            |
| `global-fetch`                              | Only the browser form fixture exercises a native HTTP seam.                                                                                             |
| `require-await`, `typescript/require-await` | Only the audit Workflow module: its compiler requires async step declarations, including a pure step.                                                   |

All Effect rule names above carry the `effecttsgo/` prefix except `require-await`.
The manifest contains the exact filenames. The sole bounded glob is the oRPC
catch-all route under `src/app/rpc/`, whose bracketed route name is glob syntax.

## Change and review workflow

1. Inspect the diagnostic and the host's required contract. Fix normal code
   issues first; never add redundant work just to evade a detector.
2. Check whether the code belongs inside a real Effect service. If it does,
   implement the idiomatic service instead of expanding an exception.
3. A new exception requires explicit approval, a named boundary, the exact rule,
   a rationale in this matrix, and a review trigger. No brace exceptions exist.
4. Remove or narrow entries when files move, a host contract changes, a detector
   is corrected, or a dependency update makes the native boundary unnecessary.
5. Run the brace/boundary policy tests and `bun run verify`. Do not publish with
   warnings, unexplained suppressions, or a reduced React Doctor score.

## Links

[Tooling policy](type-flow-tooling.md) · [Effect services](../architecture/effect-services.md)
· [Decision record](../decisions/0006-effect-host-boundaries.md)
