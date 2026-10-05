# ADR 0001 — TypeScript/Node.js pnpm monorepo with contract-first application boundaries

- **Status:** Proposed — awaiting approval by all three divisions (ClickUp M0-01)
- **Date:** 2026-10-05
- **Deciders:** Division 1 (Edge & Integrations), Division 2 (Core Data Platform), Division 3 (Application & Frontend)
- **Resolves:** Open decisions "exact language/runtime and package boundaries for the three new backend/agent applications" and "local orchestration mechanism used by `bootstrap.sh`" ([implementation brief §18](../product-briefs/ECHO_IMPLEMENTATION_PRODUCT_BRIEFS.md#18-open-decisions-register)), as directed by the project owner for Milestone 0.

## Context

The implementation brief (§3.1) requires one GitHub monorepo containing four
independently buildable applications — Echo Edge, the Core Data Platform,
Application Middleware and the Web application — plus versioned shared
contracts, local infrastructure, architecture tests and a one-command
bootstrap. The existing frontend is a Next.js/React/TypeScript application
managed with pnpm.

The confirmed architecture fixes the platform technologies (Kafka, ClickHouse,
S3-compatible archive, PostgreSQL) but did not fix the application language,
the package strategy, or how local infrastructure is orchestrated. The team is
three people working in parallel divisions, so a single toolchain lowers the
cost of review, shared contracts and onboarding. The Difinity Architecture &
Coding Standard (§§6–8) requires enforced boundaries, typed configuration,
explicit `Result` failures and executable architecture tests regardless of
language.

## Decision

1. **Language and runtime.** All applications are written in **TypeScript** on
   **Node.js 24.19.0** (pinned in `.nvmrc`, `.node-version` and `engines`).
   - **SQL** is used for PostgreSQL and ClickHouse schemas and migrations.
   - **Bash** is used for repository automation (`scripts/`).
   - **Docker Compose YAML** defines local infrastructure (`infra/local`).
   - **JSON Schema** (draft 2020-12) defines language-neutral contracts.
     OpenAPI and AsyncAPI documents may be added for HTTP APIs and event
     channels; they must reference the same JSON Schemas rather than duplicate them.
2. **Workspace strategy.** One **pnpm 11.19.0** workspace (`apps/*`,
   `packages/*`), one lockfile, `engineStrict` enabled. Each workspace owns its
   `package.json`, `tsconfig`, build, test and lint scripts and can be built
   alone with `pnpm --filter <name>... build`.
3. **Application boundaries.**
   - `apps/edge-agent` — developer-machine collector. Never depends on Kafka or
     database clients; reaches the cloud only through authenticated admission.
   - `apps/data-platform` — the only application whose adapters may depend on
     Kafka, ClickHouse, PostgreSQL and object-storage clients.
   - `apps/app-middleware` — user-facing backend; reaches data only through the
     tenant-aware Query API.
   - `apps/web` — Next.js application; talks only to the middleware.
     Backend applications use ports and adapters (`src/core` pure,
     `src/app` adapters/config/container/main). The web application keeps the
     Feature-Sliced Design profile.
4. **Contract-first integration.** Applications never import another
   application's implementation. They share only versioned packages:
   - `packages/contracts` — canonical JSON Schemas, schema-derived TypeScript
     types (generated, drift-checked) and Ajv runtime validation returning `Result`.
   - `packages/observability-contracts` — health, readiness, correlation,
     operation-progress and failure-classification contracts.
   - `packages/test-fixtures` — synthetic positive/negative contract fixtures.
     Contract packages contain no database models, controllers, adapters, UI or
     I/O. Contract changes follow the ownership table in the team delivery plan §6.
5. **Local orchestration.** Docker Compose starts local infrastructure with
   pinned images, health checks and named volumes. Applications run as host
   Node.js processes started by `scripts/bootstrap.sh`, which waits on health
   endpoints rather than sleeping. Containerising the applications is deferred
   until a deployment ADR requires OCI images.
6. **Enforcement.** `tests/architecture` parses every production source file
   and package manifest and fails `scripts/verify.sh` on: cross-application
   imports, impure core, adapter-to-wiring imports, concrete adapters outside
   the composition root, environment access outside `app/main`, data-store
   clients outside Data Platform adapters, impure contract packages and
   Feature-Sliced Design violations. Each rule has a failing fixture.

## Conditions for introducing another language

Another application language (for example Python, Go, Rust, Java/Kotlin or
C++) may be introduced only through a new, approved ADR that demonstrates all of:

1. a concrete requirement TypeScript/Node.js cannot meet acceptably, shown with
   a measured benchmark or a missing capability (for example a required
   vendor SDK, a CPU-bound workload with an agreed performance budget, or a
   platform constraint on developer machines);
2. that the component remains a separately buildable and deployable unit that
   integrates only through the published JSON Schema/OpenAPI/AsyncAPI contracts;
3. equivalent enforcement in that language: typed configuration, `Result`-style
   expected failures, architecture/import-boundary tests with negative fixtures,
   and contract tests against `packages/test-fixtures`;
4. integration into `scripts/bootstrap.sh`, `scripts/verify.sh` and CI;
5. an owner in the responsible division and agreement from the other two.

## Alternatives considered

| Alternative                                              | Why it was not selected                                                                                                                                                                         |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Python for Data Platform processing                      | Strong data ecosystem, but splits the toolchain, contract tooling and review skills across a three-person team before any measured need exists. Remains available through the conditions above. |
| Go or Rust for Echo Edge                                 | Attractive for small static binaries on developer machines. No packaging or footprint requirement has been measured yet; revisit when Edge distribution is designed.                            |
| Separate repositories per application                    | Stronger isolation, but contract changes would need multi-repository releases. The brief requires one monorepo; isolation is enforced with packages and architecture tests instead.             |
| Nx/Turborepo task runner                                 | Useful caching, but pnpm workspaces are sufficient at this size. Can be added later without changing boundaries.                                                                                |
| TypeScript-first contracts (e.g. Zod as source of truth) | Convenient, but not language-neutral. JSON Schema keeps contracts consumable by any future runtime.                                                                                             |
| Running applications in Compose                          | More production-like, but slower inner loop and no deployment model yet.                                                                                                                        |

## Consequences

- One toolchain, one lockfile and one set of standards for every application and contract.
- Application independence depends on discipline that is now executable (architecture tests, manifest checks), not on repository separation.
- Shared packages must be built before dependent applications type-check; `scripts/verify.sh` orders this.
- JSON Schema drift is caught by a generated-type check; reviewers review schema changes, not generated code.
- Local infrastructure requires Docker with roughly 3–4 GB of memory.
- A future non-TypeScript component carries a documented, deliberate cost.

## Contracts and verification

- `./scripts/verify.sh` — formatting, generated-type drift, lint, build, type check, architecture tests, unit tests, contract tests, builds and Compose validation.
- `tests/architecture/architecture.test.ts` — positive and negative fixtures for every rule.
- `tests/contracts/fixtures.contract.test.ts` — every published schema against shared synthetic fixtures.

## Exceptions

None.
