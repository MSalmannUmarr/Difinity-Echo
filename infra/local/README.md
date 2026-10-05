# Local infrastructure (development only)

`compose.yaml` starts the four purpose-specific stores from the confirmed Echo
architecture so that applications can be developed against real local
dependencies. **Milestone 0 runs no business flow against them.** The Core Data
Platform only probes them for readiness (see its README).

| Service          | Role in Echo (confirmed decision)      | Image (pinned tag)                         | Host port (127.0.0.1)               | Health check                   |
| ---------------- | -------------------------------------- | ------------------------------------------ | ----------------------------------- | ------------------------------ |
| `kafka`          | Durable event log and decoupling layer | `apache/kafka:4.0.0` (KRaft, single node)  | `59092`                             | `kafka-broker-api-versions.sh` |
| `clickhouse`     | Hot analytical store                   | `clickhouse/clickhouse-server:25.3`        | `58123` (HTTP)                      | `GET /ping`                    |
| `postgres`       | Mutable control plane                  | `postgres:17.4-alpine`                     | `55432`                             | `pg_isready`                   |
| `object-storage` | S3-compatible canonical archive        | `minio/minio:RELEASE.2025-04-22T22-12-26Z` | `59000` (S3 API), `59001` (console) | `mc ready local`               |

All ports bind to `127.0.0.1` only and can be changed in `infra/local/.env`.
Data lives in named Docker volumes (`kafka-data`, `clickhouse-data`,
`postgres-data`, `object-storage-data`).

## Configuration and credentials

- `.env.example` is committed and contains placeholders only.
- `scripts/bootstrap.sh` creates `infra/local/.env` (git-ignored) and replaces
  every `__GENERATED__` value with a random, local-only secret. It never
  overwrites an existing `.env`.
- These credentials are for a developer machine. They must never be reused in
  any shared, staging, production or customer environment.

## Resource expectations

Plan for roughly **3–4 GB RAM** and **2 CPU cores** available to Docker while
all four services run (Kafka is capped at a 512 MB heap; ClickHouse is the
largest consumer). Disk use starts small and grows with local data.

## Commands

```bash
./scripts/bootstrap.sh                                   # creates .env, starts and waits for health
docker compose -f infra/local/compose.yaml --env-file infra/local/.env ps
./scripts/teardown.sh                                    # stops containers, keeps volumes
./scripts/teardown.sh --delete-local-data                # also removes this project's named volumes
```

## Open decisions and limitations

- **Image verification:** the tags above were pinned but could not be pulled
  in the authoring environment (container registries were blocked by egress
  policy). The first successful bootstrap on a team machine should confirm
  each tag and record image digests (`docker compose images`) in a follow-up.
- **S3-compatible implementation:** MinIO changed its community distribution
  model in late 2025 (prebuilt community images are no longer published for
  new releases). The pinned tag is an existing release. The team should decide
  whether to keep MinIO, adopt another S3-compatible server, or use LocalStack
  for local development. This is recorded rather than guessed.
- **Not production infrastructure:** no Kubernetes, Helm, Terraform or cloud
  resources are defined here. Production and customer-cloud deployment are
  out of scope for Milestone 0 (see `infra/modules` and `infra/environments`).
- **Tenant isolation, TLS and authentication** between services are not
  configured locally yet; they are introduced with the admission and Query API
  milestones.
