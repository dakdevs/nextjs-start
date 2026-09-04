# oRPC

oRPC is the contract-first BFF transport. It is not a universal CRUD layer and
it does not erase domain boundaries. Its best value is making the exact consumer
contract, runtime input validation, and inferred output visible in one place.

## Operation contract

Every operation has one consumer intention, explicit input and output schemas,
an authorization base, a single domain use case, and a deliberately shaped
repository projection. Name the operation after what the consumer achieves, not
after a generic table.

## Reuse test

| Question                                                                   | Decision                       |
| -------------------------------------------------------------------------- | ------------------------------ |
| Do all consumers share intent, auth, fields, and foreseeable changes?      | Reuse one operation.           |
| Does a page/table/filter/workflow need a distinct shape or evolution path? | Add a new operation.           |
| Does an optional input introduce a second job?                             | Split the operation.           |
| Does WebMCP need the same exact semantics and safety model?                | It may share the operation.    |
| Does WebMCP differ in intent, authorization, or output?                    | Give it a dedicated operation. |

Do not add a mode flag merely to avoid a new file. Reuse is correct only while
every client will benefit from every change; otherwise sharing becomes coupling.

## Links

[BFF architecture](../architecture/bff-orpc.md) · [Type flow](type-flow-tooling.md) · [WebMCP](browser-webmcp.md)
