# Difinity Echo Team Delivery Plan

**Status:** Agreed delivery breakdown  
**Audience:** Project team, technical leads, reviewers, and coding assistants  
**Companion document:** `docs/product-briefs/ECHO_IMPLEMENTATION_PRODUCT_BRIEFS.md`

## 1. Purpose

This document divides Difinity Echo implementation into three coordinated divisions and defines the shared workflow required to keep the team aligned.

The divisions own technical areas, but delivery remains vertical. Every milestone must cross the necessary divisions and finish with a working, testable demonstration. A disconnected connector, database, API, or screen is not a completed milestone.

## 2. Shared delivery principles

All divisions must follow these rules:

1. Use the project baseline registered in `AGENTS.md`.
2. Use `ECHO_IMPLEMENTATION_PRODUCT_BRIEFS.md` for product boundaries, component responsibilities, vertical milestones, acceptance criteria, and definition of done.
3. Build vertically rather than completing isolated horizontal layers.
4. Agree shared contracts before implementing dependent components.
5. Keep pull requests small, focused, and connected to a named milestone.
6. Preserve privacy, tenant isolation, four-cohort logic, natural-grain metrics, evidence traceability, and read decoupling.
7. Do not invent unresolved product rules. Surface them or propose an ADR.
8. Never represent synthetic or prototype results as customer evidence.
9. State which verification commands actually ran and which checks remain unverified.
10. Keep the repository bootable and demonstrable from a clean checkout.

## 3. Division 1 — Echo Edge and Integrations

### Mission

Own the complete path from an external engineering source to an authenticated canonical event accepted by the Core Data Platform.

### Responsibilities

- Echo Edge/local agent
- Cursor integration as the first committed AI source
- Local allowlist privacy processing
- Provider-neutral event normalisation
- Local Git provenance linking
- Encrypted and bounded offline buffering
- Secure enrollment and event delivery
- Jira Cloud connector
- GitHub source-control connector
- GitHub Actions and Deployments connector
- Sentry Cloud connector
- Provider administration APIs when scheduled
- Connector health, freshness, and coverage events
- Privacy, schema, retry, and adapter contract tests

### Owned path

```text
Cursor / Jira / GitHub / GitHub Deployments / Sentry metadata
  -> source adapter
  -> local privacy boundary where applicable
  -> canonical normalisation
  -> provenance and idempotency
  -> authenticated cloud admission
```

### Boundaries

Division 1 owns source-specific DTOs and adapters. It does not own authoritative metrics, final AI-cohort decisions, evidence aggregation, or user-facing analytical calculations.

Endpoint collectors must not write directly to Kafka, ClickHouse, PostgreSQL, or object storage.

### Primary coordination

Coordinate with Division 2 on canonical schemas, admission, enrollment, acknowledgements, idempotency, compatibility, and health contracts.

Coordinate with Division 3 on enrollment UX, connector health presentation, recovery guidance, and demonstrations.

## 4. Division 2 — Core Data and Analytics Platform

### Mission

Own the authoritative path from authenticated event admission to tenant-safe evidence, cohort, metric, health, and query results.

### Responsibilities

- Regional ingestion/admission API
- Authentication and tenant derivation
- Schema validation, replay protection, and rate limiting
- Kafka event log, consumers, retry, and replay
- Canonicalisation, deduplication, and enrichment
- Identity resolution
- Evidence-graph construction
- Four AI evidence cohorts
- ClickHouse analytical storage
- S3-compatible canonical archive
- PostgreSQL control plane
- Natural-grain metric engine
- Attributed-versus-touched calculations
- Data-health calculations
- Tenant-aware Query API
- Replay, recomputation, and recovery
- Cross-tenant, metric, contract, and integration tests

### Owned path

```text
Authenticated canonical events
  -> durable tenant-partitioned event log
  -> canonical archive and analytical projection
  -> evidence graph and cohort classification
  -> natural-grain metrics and data health
  -> tenant-aware Query API
```

### Boundaries

Division 2 owns authoritative analytical calculations. Application middleware and frontend code must not reproduce those calculations independently.

The Query API returns typed domain/query models, not database rows or storage-specific types.

### Primary coordination

Coordinate with Division 1 on admitted event contracts and evidence requirements.

Coordinate with Division 3 on Query API contracts, error semantics, evidence/maturity fields, query limits, and recomputation status.

## 5. Division 3 — Application, Frontend, and Developer Experience

### Mission

Own the complete path from the tenant-aware Query API to a secure, understandable, evidence-aware user experience, including the clean-checkout development workflow.

### Responsibilities

- Application middleware
- Browser/SSO authentication integration
- Immutable actor and tenant context
- Capability-based authorisation and RBAC
- Request validation, query bounds, orchestration, and response shaping
- Rate limiting, audit logging, correlation IDs, and safe diagnostics
- Overview
- Compare
- Explore
- Live Trace
- Data Health
- Data Policy and Configuration
- Persistent filter/navigation context
- Typed per-domain frontend clients
- Loading, empty, error, stale, immature, and insufficient-evidence states
- Accessibility and responsive behaviour
- Root monorepo commands
- `scripts/bootstrap.sh`
- `scripts/verify.sh`
- `scripts/demo.sh`
- Local infrastructure composition
- End-to-end and clean-checkout smoke tests

### Owned path

```text
Tenant-aware Query API
  -> authenticated and authorised middleware
  -> stable frontend-facing contracts
  -> typed feature clients
  -> evidence-aware Echo pages
  -> repeatable end-to-end demonstration
```

### Boundaries

Browsers must never directly query Kafka, ClickHouse, PostgreSQL, or object storage. Middleware must use the tenant-aware Query API.

Frontend and middleware must not calculate authoritative metrics or treat frontend context as proof of authority.

### Primary coordination

Coordinate with Division 2 on every Query API, evidence, metric, health, and configuration contract.

Coordinate with Division 1 on collector enrollment, connector health, policy presentation, and recovery workflows.

## 6. Shared contract ownership

| Contract | Primary owner | Required reviewers |
| --- | --- | --- |
| Canonical event schema | Division 2 | Divisions 1 and 3 |
| Local privacy allowlist | Division 1 | Division 2 and security reviewer |
| Admission and enrollment | Division 2 | Division 1 |
| Idempotency and acknowledgement | Division 2 | Division 1 |
| Query API | Division 2 | Division 3 |
| Middleware/frontend API | Division 3 | Division 2 |
| Evidence and cohort semantics | Division 2 | All divisions |
| Data-health model | Division 2 | Divisions 1 and 3 |
| Bootstrap and demonstration | Division 3 | All divisions |
| End-to-end milestone acceptance | Rotating milestone owner | All divisions |

No shared contract should change without review from every affected division.

## 7. Standard team workflow

### Step 1 — Select a vertical milestone

Use the milestone sequence from the implementation brief:

1. Monorepo and one-command skeleton
2. First private canonical event
3. Work-to-deployment evidence trace
4. Four-cohort classification
5. First valid comparison
6. Production-quality linkage
7. Configurable organisational slice
8. Hardening and reproducible evaluation

Only one or two milestones should be active at the same time.

### Step 2 — Run a milestone kickoff

The three division representatives agree on:

- user-observable demonstration;
- participating services and components;
- input and output contracts;
- evidence, privacy, and tenant requirements;
- error and incomplete-evidence behaviour;
- acceptance criteria;
- test ownership;
- open decisions;
- one owner for each shared contract.

Record this in a milestone Markdown file or a ClickUp epic.

### Step 3 — Define contracts first

Before dependent implementation begins, agree:

- canonical event shape and version;
- idempotency key and acknowledgement;
- tenant context;
- error and absence semantics;
- evidence and maturity states;
- Query API response;
- health events;
- compatibility expectations.

Use contract fixtures so divisions can develop concurrently without creating dishonest mocks.

### Step 4 — Create thin work items

Every work item needs:

- one observable outcome;
- owning division;
- named milestone;
- inputs and outputs;
- dependencies;
- explicit exclusions;
- acceptance criteria;
- verification commands;
- required demonstration evidence.

Avoid horizontal tasks such as “build the Kafka layer” or “finish the frontend.” Prefer work such as:

> Given an admitted Cursor event, persist it idempotently and expose its freshness through Data Health.

### Step 5 — Implement inward-out

Where applicable:

1. Domain values, invariants, and contract types
2. Ports/interfaces
3. Application services/use cases
4. Adapters and boundary mapping
5. Composition/wiring
6. Presentation
7. Tests at each relevant layer

Add or update architecture and contract tests before feature implementation when introducing a new boundary.

### Step 6 — Use focused branches and pull requests

Suggested branch names:

```text
milestone-2/edge-cursor-normalisation
milestone-2/platform-event-admission
milestone-2/app-ingestion-health
```

Every pull request should state:

- milestone and work item;
- user-visible contribution;
- contracts changed;
- architectural boundaries affected;
- verification commands actually run;
- screenshots, trace identifiers, or demonstration evidence;
- known limitations and follow-ups.

Do not mix unrelated restructuring into milestone work.

### Step 7 — Integrate continuously

Recommended flow:

```text
feature branch
  -> reviewed pull request
  -> milestone integration branch
  -> end-to-end verification
  -> main
```

A small team may merge focused pull requests directly into `main` if `main` always remains bootable and demonstrable.

### Step 8 — Run shared verification

The target repository commands are:

```bash
./scripts/bootstrap.sh
./scripts/verify.sh
./scripts/demo.sh
```

`verify.sh` should eventually cover:

- formatting;
- linting;
- type checking;
- architecture-boundary tests;
- unit tests;
- contract tests;
- integration tests;
- privacy fixtures;
- cross-tenant negative tests;
- builds for every application.

Authors must identify checks that were not run.

### Step 9 — Demonstrate the milestone

Begin from a clean checkout. Show:

1. Input event or user action
2. Movement through component boundaries
3. Final user-visible result
4. Supporting evidence trace
5. Data-health state
6. One important failure case
7. Tenant and privacy enforcement

A screenshot or presentation without a working path is not completion.

### Step 10 — Record consequential decisions

Use an ADR for decisions about runtime boundaries, event partitioning, schema compatibility, DAG behaviour, identity, allocation, retry/replay, tenant isolation, or metric maturity.

### Step 11 — Hold a weekly cross-division review

Use this agenda:

1. Current demonstrable state
2. Contract changes
3. Open decisions
4. Privacy and security risks
5. Broken integration points
6. Next vertical slice
7. Documentation drift

Review running software or test evidence rather than relying only on status reports.

## 8. Documents to share with the team

### Mandatory coding-assistant pack

Every team member and coding assistant needs:

1. `AGENTS.md`
2. `docs/product-briefs/ECHO_IMPLEMENTATION_PRODUCT_BRIEFS.md`
3. `docs/product-briefs/ECHO_TEAM_DELIVERY_PLAN.md`
4. `docs/reference/Difinity-Echo-Consolidated-Product-and-Architecture.md`
5. `docs/reference/Difinity-Architecture-and-Coding-Standard-v3.md`

### FYP and architecture reference pack

6. `docs/reference/Difinity-Echo-Consolidated-Report.pdf`
7. `docs/reference/Whiteboard-01.jpg`
8. `docs/reference/Whiteboard-02.jpg`
9. `docs/reference/Whiteboard-03.jpg`

### Frontend addition

10. `DESIGN.md`

All of these documents are stored in this repository (reference documents under `docs/reference/`), so sharing the repository shares the complete pack with paths that resolve for coding assistants.

## 9. Common coding-assistant preamble

The following baseline prompt is assumed before any division prompt:

```text
Before starting any Difinity Echo task, read AGENTS.md and follow its source precedence. Then read docs/product-briefs/ECHO_IMPLEMENTATION_PRODUCT_BRIEFS.md and docs/product-briefs/ECHO_TEAM_DELIVERY_PLAN.md.

Use the supporting product, coding-standard, FYP, whiteboard, and design documents when their subject is relevant. Identify the selected vertical milestone, affected components, contracts, acceptance criteria, and unresolved decisions before implementation.

Do not invent unresolved business rules. Preserve local privacy, tenant isolation, four-cohort logic, natural-grain metrics, evidence traceability, and no direct browser/database access. Build the smallest end-to-end demonstrable change. Report commands actually run, unverified checks, contract changes, limitations, and risks. Never present synthetic or prototype results as customer evidence.
```

## 10. Division 1 coding-assistant prompt

```text
You are responsible for Division 1: Echo Edge and Integrations.

The shared project baseline has already been read. Own the complete path from an external engineering source to an authenticated canonical event accepted by the Core Data Platform.

Primary scope:
- Echo Edge/local agent
- Cursor as the first committed AI source
- Local allowlist privacy processing
- Provider-neutral event normalisation
- Local Git provenance
- Encrypted bounded offline buffering
- Secure enrollment and delivery
- Jira, GitHub, GitHub Actions/Deployments, and Sentry connectors
- Connector health and coverage events
- Privacy, schema, retry, and adapter contract tests

Non-negotiable constraints:
- Reject prohibited content before outbound queue or disk persistence.
- Never transmit prompts, responses, source code, raw diffs, unrestricted paths, raw commands, secrets, screenshots, keystrokes, or transcripts.
- Do not trust tenant identity from payloads; cloud admission derives it from authenticated enrollment.
- Keep vendor DTOs and terminology inside adapters.
- Produce versioned canonical events with stable IDs, policy/schema versions, provenance, and correlation identifiers.
- Do not calculate authoritative metrics, final cohorts, or business outcomes locally.
- Do not write directly to cloud storage or Kafka from endpoint collectors.

Work on the team-selected vertical milestone. If none is selected, begin with the First Private Canonical Event milestone: take a synthetic or Cursor-derived metadata event through local privacy validation, normalisation, provenance, buffering, authenticated admission, durable acceptance, and visible Data Health status.

Coordinate contract changes with Division 2 and operator-facing changes with Division 3. Inspect existing code, tests, schemas, and ADRs before editing. State the end-to-end path and open decisions before implementation.

Test allowed/prohibited fixtures, schema mismatch, duplicates, ordering, offline restart, bounded buffering, retry/idempotency, invalid enrollment, provenance mismatch, and safe diagnostics.

At completion report the delivered path, files/contracts changed, privacy and tenancy checks, commands actually run, unrun checks, demonstration steps, limitations, risks, and open decisions.

Complete one demonstrable source-to-platform path before expanding horizontally.
```

## 11. Division 2 coding-assistant prompt

```text
You are responsible for Division 2: Core Data and Analytics Platform.

The shared project baseline has already been read. Own the authoritative path from authenticated event admission to tenant-safe evidence, cohort, metric, health, and query results.

Primary scope:
- Admission API, authentication, and tenant derivation
- Schema validation, rate limiting, and replay protection
- Kafka durability, consumption, retry, and replay
- Canonicalisation, deduplication, enrichment, and identity resolution
- Evidence graph and four AI cohorts
- ClickHouse, S3-compatible archive, and PostgreSQL control plane
- Natural-grain metrics and attributed-versus-touched calculations
- Data Health and tenant-aware Query API
- Replay, recomputation, recovery, and cross-tenant testing

Non-negotiable constraints:
- Derive tenant identity from authenticated credentials.
- Attach tenant context to every fact, relationship, aggregate, cache entry, archive object, and query.
- Unknown AI status must never become no-AI-observed.
- Use capture-complete no-AI-observed work as the valid comparison cohort.
- Calculate metrics at their declared natural grain and perform valid roll-ups.
- Expose sample, denominator, window, maturity, evidence health, and limitations.
- Keep attributed and touched semantics separate.
- Bind quality signals to deployments/release windows, not developers.
- Return typed query contracts, not database rows or storage types.
- Do not permit direct browser access to data stores.

Work on the team-selected vertical milestone. If none is selected, support the First Private Canonical Event milestone through authenticated admission, durable storage, idempotent processing, archive/projection, Data Health query, and middleware consumption.

Coordinate admitted-event contracts with Division 1 and Query API contracts with Division 3. Before implementation, state the natural grain, eligibility, deduplication, window, maturity, evidence, tenant policy, and open decisions.

Test authentication, cross-tenant access, duplicate/replay behavior, late events, quarantine, identity conflicts, all four cohorts, unknown exclusion, aggregation, suppression, allocation reconciliation, maturity, store failure, recovery, and contract compatibility.

At completion report the analytical path, domain/event/query/storage changes, migration and replay impact, verification commands, unrun checks, demonstration steps, limitations, risks, and open decisions.

Do not build isolated stores or processing modules without connecting them to a demonstrable query result.
```

## 12. Division 3 coding-assistant prompt

```text
You are responsible for Division 3: Application Middleware, Frontend, and Developer Experience.

The shared project baseline has already been read. Own the path from the tenant-aware Query API to a secure evidence-aware user experience, plus the clean-checkout development workflow.

Primary scope:
- Application middleware
- Authentication, immutable actor/tenant context, authorisation, and RBAC
- Request validation, query bounds, orchestration, rate limits, audit, and safe diagnostics
- Overview, Compare, Explore, Live Trace, Data Health, and Data Policy/Configuration
- Persistent filters and typed frontend clients
- Loading, empty, error, stale, immature, and insufficient-evidence states
- Accessibility and responsive behaviour
- Monorepo bootstrap, verify, demo, local composition, and end-to-end tests

Non-negotiable constraints:
- No direct browser access to Kafka, ClickHouse, PostgreSQL, or object storage.
- Middleware uses the tenant-aware Query API and reauthorises protected operations.
- Do not calculate authoritative metrics in controllers or components.
- Components consume typed domain/view models rather than DTOs or raw transport responses.
- Preserve Feature-Sliced Design boundaries.
- Persist shared analytical filters where expected.
- Expose evidence, sample, window, maturity, and limitation states.
- Never display unknown evidence as zero, empty, or no-AI.
- Do not add developer rankings, composite productivity scores, or unsupported narratives.
- Distinguish saved configuration from completed recomputation.
- Keep clean-checkout tooling repeatable and secret-free.

Work on the team-selected vertical milestone. If none is selected, begin with the Monorepo and One-Command Skeleton milestone, then expose the first admitted event through Data Health.

Coordinate Query API and evidence contracts with Division 2 and enrollment/health workflows with Division 1. Inspect the existing UI, boundaries, clients, tests, DESIGN.md, and pinned Next.js documentation before editing.

Test authentication and authorisation, tenant denial, query bounds, typed mapping, absence versus failure, UI state transitions, stale responses, persistent filters, accessibility, no direct database access, bootstrap idempotency, readiness, and the end-to-end demonstration.

At completion report the delivered user journey, files and contracts changed, authorisation/evidence states verified, commands actually run, unrun checks, clean-checkout demonstration, screenshots or trace IDs, limitations, risks, and open decisions.

Do not complete milestone pages with disconnected mock behavior. Honest contract fakes are temporary and must be explicitly identified.
```

## 13. Immediate execution breakdown

### Shared first action

All divisions jointly complete Milestone 0 before independently expanding their areas:

- agree monorepo target structure;
- decide application runtimes and local orchestration through an ADR;
- establish versioned contracts package;
- implement health endpoints/contracts;
- create `bootstrap.sh`, `verify.sh`, and `demo.sh` skeletons;
- establish architecture tests and CI gates;
- confirm clean-checkout startup.

### Division 1 first work package

1. Define the privacy allowlist and negative fixtures.
2. Define the initial Cursor adapter boundary.
3. Produce one canonical synthetic/Cursor event.
4. Add local buffering and safe health state.
5. Integrate authenticated admission with Division 2.

### Division 2 first work package

1. Define canonical event and acknowledgement contracts with Division 1.
2. Implement authenticated tenant admission.
3. Persist one event durably and idempotently.
4. Project ingestion/freshness state for queries.
5. Expose the initial tenant-aware Data Health query.

### Division 3 first work package

1. Establish the monorepo/root developer commands.
2. Implement health/readiness aggregation in middleware.
3. Connect Data Health to the initial typed middleware contract.
4. Display source status, freshness, and safe failure states.
5. Implement the clean-checkout milestone demonstration.

### First integrated definition of done

From a clean checkout, the team can run one bootstrap command, submit an allowlisted synthetic or Cursor event, observe authenticated durable acceptance, and view tenant-safe ingestion freshness in Data Health. A prohibited-content fixture is rejected locally, and a cross-tenant read is rejected by the platform.
