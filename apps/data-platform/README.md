# Core Data Platform (`@difinity-echo/data-platform`)

**Owner:** Division 2 — Core Data Platform ·
**Brief:** [implementation brief §10](../../docs/product-briefs/ECHO_IMPLEMENTATION_PRODUCT_BRIEFS.md#10-product-brief--core-data-platform)

Admits tenant-authenticated events, keeps a replayable canonical record,
builds the evidence graph, classifies the four AI cohorts, computes
natural-grain metrics and serves the **tenant-aware Query API**.

## Status: Milestone 0 skeleton

Implemented: typed configuration, health and readiness endpoints, and
**reachability probes** for local Kafka, ClickHouse, PostgreSQL and object
storage. No business flow uses those stores yet, so they are reported as
optional dependencies:

- ClickHouse (`/ping`) and object storage (`/minio/health/live`) report `ready`
  only when their own health endpoint answers 2xx;
- Kafka and PostgreSQL report `reachable` when a TCP connection succeeds —
  no protocol, authentication or schema state is verified;
- an unset endpoint reports `not-configured`.

**Not implemented:** admission, Kafka publication/consumption, processing,
evidence and cohorts, metric engine, persistence adapters, archive writes and
query operations. Readiness lists them as `not-implemented`.

## Boundaries

| Boundary                         | Responsibility                                                                                                         | Milestone |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------- |
| Authenticated admission          | Authenticate enrollment, derive tenant, validate schema/policy, rate-limit, replay protection, durable acknowledgement | M1-06/07  |
| Event publication and processing | Durable tenant-partitioned Kafka log, idempotent consumers, quarantine                                                 | M1-08     |
| Evidence and cohort domain       | Evidence graph, four cohorts (unknown never becomes non-AI)                                                            | M2–M3     |
| Metric domain                    | Natural-grain metrics, valid roll-ups, attributed vs touched                                                           | M4+       |
| Persistence adapters             | ClickHouse projections, S3-compatible archive, PostgreSQL control plane                                                | M1-09+    |
| Tenant-aware Query API           | Typed query contracts, never database rows                                                                             | M1-10/11  |
| Health/readiness                 | Implemented                                                                                                            | M0        |

Only this application's **adapters** may depend on data-store clients; the
architecture tests reject them anywhere else in the repository.

## Commands

```bash
pnpm --filter @difinity-echo/data-platform... build
pnpm --filter @difinity-echo/data-platform test
pnpm --filter @difinity-echo/data-platform start   # http://127.0.0.1:4100/health/ready
```

Configuration: [`.env.example`](.env.example). Infrastructure endpoints are
optional; absent values are reported as `not-configured`, never as ready.
