# Difinity Echo

Echo is Difinity's continuous **AI engineering analytics platform**. It connects
AI-tool activity and spend with engineering work, delivery performance,
software quality, support demand and product outcomes, so engineering leaders
can ask a defensible question:

> Within a defined engineering scope, evidence policy and observation window,
> how did AI-linked work differ from comparable capture-complete work in
> delivery speed, review effort, quality, support demand, expenditure and
> product outcomes?

Echo is **not** a developer-ranking or surveillance tool, a single
productivity/ROI score, or proof that correlation is causation. Its core
properties are traceability, comparability, evidence awareness, analytical
validity and privacy (metadata only; prompts and code never leave the
developer machine). See the
[consolidated product brief](docs/reference/Difinity-Echo-Consolidated-Product-and-Architecture.md).

## Current implementation status — Milestone 0

| Component               | Path                                                                   | Status                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Echo Web application    | [`apps/web`](apps/web)                                                 | **Working prototype** (Next.js). Six pages with **illustrative mock data — not customer results**.                               |
| Echo Edge (local agent) | [`apps/edge-agent`](apps/edge-agent)                                   | **Skeleton**: health/readiness only. No collection or privacy processing yet.                                                    |
| Core Data Platform      | [`apps/data-platform`](apps/data-platform)                             | **Skeleton**: health/readiness and infrastructure reachability probes only. No admission, Kafka, storage or query flows yet.     |
| Application Middleware  | [`apps/app-middleware`](apps/app-middleware)                           | **Skeleton**: health/readiness via the Query API, actor context, fail-closed authentication boundary. No user-facing routes yet. |
| Contracts               | [`packages/contracts`](packages/contracts)                             | Foundation: error codes, safe errors; **v0 drafts** of canonical event envelope, admission acknowledgement, query envelopes.     |
| Observability contracts | [`packages/observability-contracts`](packages/observability-contracts) | Health, readiness, correlation id, operation events, failure classification (v1).                                                |
| Test fixtures           | [`packages/test-fixtures`](packages/test-fixtures)                     | Synthetic valid/invalid, prohibited-content, tenant-isolation and health fixtures.                                               |
| Local infrastructure    | [`infra/local`](infra/local)                                           | Docker Compose: Kafka, ClickHouse, PostgreSQL, MinIO (S3-compatible). Defined; no business data.                                 |

Nothing in this repository ingests real events, computes metrics or produces
customer evidence yet. That starts with Milestone 1 (first private canonical event).

## The three divisions

Delivery is vertical (every milestone crosses divisions), but ownership is split
([team delivery plan](docs/product-briefs/ECHO_TEAM_DELIVERY_PLAN.md)):

1. **Echo Edge and Integrations** — `apps/edge-agent`, connectors (Cursor, Jira, GitHub, GitHub Actions/Deployments, Sentry), local privacy allowlist, provenance, buffering, admission client.
2. **Core Data and Analytics Platform** — `apps/data-platform`: admission, Kafka, processing, evidence graph, four AI cohorts, ClickHouse/S3/PostgreSQL, metrics, tenant-aware Query API.
3. **Application, Frontend and Developer Experience** — `apps/app-middleware`, `apps/web`, root scripts, local infrastructure and end-to-end tests.

## Repository structure

```text
apps/
  edge-agent/            Echo Edge (TypeScript/Node.js, ports and adapters)
  data-platform/         Core Data Platform (TypeScript/Node.js, ports and adapters)
  app-middleware/        Application Middleware (TypeScript/Node.js, ports and adapters)
  web/                   Echo web application (Next.js, Feature-Sliced Design)
packages/
  contracts/             JSON Schemas + generated types + runtime validation
  observability-contracts/  health, readiness, correlation, progress, failure classes
  test-fixtures/         safe synthetic contract fixtures
infra/
  local/                 Docker Compose for local development (dev-only credentials)
  modules/, environments/   reserved for IaC (not defined yet)
scripts/                 bootstrap.sh, verify.sh, demo.sh, teardown.sh
docs/
  product-briefs/        implementation briefs, team delivery plan, ClickUp backlog
  reference/             product/architecture brief, coding standard, FYP report, whiteboards
  adr/                   architecture decision records
  ddd/                   DDD documentation set (required before business logic)
tests/
  architecture/          executable dependency rules + positive/negative fixtures
  contracts/             schemas vs shared fixtures
  end-to-end/            running-stack health checks (used by demo.sh)
```

## Component boundaries

- Applications are independently buildable and deployable and **never import
  each other's code**. They integrate through versioned contracts
  (`packages/*`), HTTP APIs and events.
- Browser → **Web** → **Application Middleware** → **tenant-aware Query API**
  (Core Data Platform). No browser, web or middleware code accesses Kafka,
  ClickHouse, PostgreSQL or object storage.
- **Echo Edge** sanitises locally before any outbound persistence and reaches
  the cloud only through authenticated admission; it never writes to Kafka or
  databases.
- Tenant identity is derived from authenticated credentials, never from payload fields.
- Backend `core` code is framework- and infrastructure-free; configuration is
  parsed once; expected failures are `Result` values.

These rules are enforced by `tests/architecture` (see
[ADR 0001](docs/adr/0001-typescript-node-pnpm-monorepo.md)). The full rules are
in the [Difinity Architecture & Coding Standard](docs/reference/Difinity-Architecture-and-Coding-Standard-v3.md).

## Prerequisites

| Tool                       | Version             | Notes                                                         |
| -------------------------- | ------------------- | ------------------------------------------------------------- |
| Node.js                    | **24.19.0** exactly | `.nvmrc` / `.node-version`; e.g. `nvm install && nvm use`     |
| pnpm                       | **11.19.0** exactly | `corepack enable && corepack prepare pnpm@11.19.0 --activate` |
| Docker + Docker Compose v2 | recent              | ~3–4 GB RAM for local infrastructure                          |
| Bash, curl, git            | any recent          | macOS, Linux or WSL2                                          |

## Clean-checkout setup

```bash
git clone https://github.com/MSalmannUmarr/Difinity-Echo.git
cd Difinity-Echo
./scripts/bootstrap.sh
```

`bootstrap.sh` validates tool versions, creates git-ignored local
configuration from the `.env.example` files (generating random
development-only infrastructure credentials), installs from the lockfile,
builds every workspace, starts the infrastructure with Docker health checks,
starts the four applications and waits for their health endpoints. It is safe
to re-run. Options: `--restart`, `--skip-infra` (applications only; reported
explicitly).

| Service                | URL                                |
| ---------------------- | ---------------------------------- |
| Web                    | http://127.0.0.1:3000              |
| Application Middleware | http://127.0.0.1:4000/health/ready |
| Core Data Platform     | http://127.0.0.1:4100/health/ready |
| Echo Edge              | http://127.0.0.1:4200/health/ready |

Stop everything with `./scripts/teardown.sh` (add `--delete-local-data` to
remove local volumes).

## Development commands

```bash
pnpm install --frozen-lockfile
pnpm --filter @difinity-echo/web dev          # frontend dev server
pnpm --filter @difinity-echo/<app>... build   # build one application with its packages
pnpm build                                    # build everything
pnpm lint | pnpm typecheck | pnpm test
pnpm test:architecture | pnpm test:contracts
pnpm format                                   # Prettier (apps/web is excluded, see ADR 0002)
pnpm --filter @difinity-echo/contracts generate   # after editing a JSON Schema
```

## Verification

```bash
./scripts/verify.sh
```

Runs formatting check, generated-contract drift check, lint, package builds,
type checking, architecture tests, unit tests, contract tests, application
builds and Compose validation. Any mandatory failure exits non-zero.

## Demonstration (Milestone 0)

```bash
./scripts/bootstrap.sh && ./scripts/demo.sh
```

Shows Docker health of each infrastructure service, liveness and readiness of
every application (including which boundaries are `not-implemented`), that the
web application is reachable, and runs the end-to-end health tests. It
fabricates no product or customer result.

## Documentation

- [AGENTS.md](AGENTS.md) — baseline and rules for humans and coding assistants
- [Implementation product briefs](docs/product-briefs/ECHO_IMPLEMENTATION_PRODUCT_BRIEFS.md) — components, contracts, milestones, definition of done
- [Team delivery plan](docs/product-briefs/ECHO_TEAM_DELIVERY_PLAN.md) — divisions, workflow, contract ownership
- [ClickUp backlog](docs/product-briefs/ECHO_CLICKUP_BACKLOG.md) — milestone work items
- [Consolidated product and architecture brief](docs/reference/Difinity-Echo-Consolidated-Product-and-Architecture.md)
- [Architecture & Coding Standard v3](docs/reference/Difinity-Architecture-and-Coding-Standard-v3.md)
- [Consolidated FYP report (PDF)](docs/reference/Difinity-Echo-Consolidated-Report.pdf) and whiteboards: [01 system](docs/reference/Whiteboard-01.jpg), [02 pages ↔ domains](docs/reference/Whiteboard-02.jpg), [03 page flow](docs/reference/Whiteboard-03.jpg)
- [DESIGN.md](DESIGN.md) — frontend visual design reference
- [Architecture decision records](docs/adr/README.md)
