# `@difinity-echo/observability-contracts`

Typed operational contracts shared by all four applications.

| Contract                    | Purpose                                                                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `service-health.v1`         | Liveness: the process is running (`status: "alive"`)                                                                                     |
| `service-readiness.v1`      | Readiness plus per-dependency state: `ready`, `reachable` (network only), `not-ready`, `not-configured`, `not-implemented`               |
| `correlation-id.v1`         | Opaque identifier propagated in the `x-correlation-id` header                                                                            |
| `operation-event.v1`        | Typed progress events (`RequestStarted`, `OperationStarted`, `OperationProgressed`, `OperationCompleted`, `RequestFailed`) — brief §13.3 |
| `failure-classification.v1` | Safe failure classes; raw causes never cross this contract                                                                               |

Helpers: `buildLiveness`, `buildReadiness` (a required dependency satisfies
readiness only when it is `ready`; `reachable` and `not-implemented` never
do), `CorrelationId.parse`, `DependencyStatus`, `DependencyKind`,
`observabilityRegistry`.

The package is pure: no I/O, randomness or clock access. Applications supply
time and identifiers through their own ports.

Regenerate types after editing a schema:
`pnpm --filter @difinity-echo/observability-contracts generate`.
