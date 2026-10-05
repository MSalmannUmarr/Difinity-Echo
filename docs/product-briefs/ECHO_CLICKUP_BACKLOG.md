# Difinity Echo ClickUp Backlog

**Status:** Initial implementation backlog  
**Planning model:** Vertical milestones with three parallel delivery divisions  
**Source documents:** `AGENTS.md`, `ECHO_IMPLEMENTATION_PRODUCT_BRIEFS.md`, and `ECHO_TEAM_DELIVERY_PLAN.md`

## 1. Recommended ClickUp structure

```text
Space: Difinity Echo FYP

Folder: 00 — Project Governance
  List: Decisions and ADRs
  List: Risks and Open Questions

Folder: 01 — Vertical Delivery
  List: M0 — Monorepo Skeleton
  List: M1 — First Private Canonical Event
  List: M2 — Work-to-Deployment Trace
  List: M3 — Four-Cohort Classification
  List: M4 — First Valid Comparison
  List: M5 — Production Quality Linkage
  List: M6 — Configurable Organisational Slice
  List: M7 — Hardening and Evaluation

Folder: 02 — Operational Follow-up
  List: Defects
  List: Technical Debt
  List: Documentation Drift
```

Do not create permanent lists for each technical division. Use a `Division` custom field so each milestone remains visibly end-to-end.

## 2. Recommended custom fields

| Field | Type | Values |
| --- | --- | --- |
| Division | Dropdown | Shared; Edge & Integrations; Core Data Platform; Application & Frontend |
| Milestone | Dropdown | M0-M7 |
| Work type | Dropdown | Feature; Contract; Test; Infrastructure; Documentation; ADR; Defect |
| Contract impact | Dropdown | None; Backward compatible; Breaking; New contract |
| Evidence state | Dropdown | Not applicable; Synthetic; Prototype; Customer validated |
| Risk | Dropdown | Low; Medium; High; Critical |
| Demo required | Checkbox | Yes/No |
| Blocked by decision | Checkbox | Yes/No |
| Verification evidence | URL or text | PR, CI, trace, screenshot, or report |

Suggested task statuses:

```text
Backlog
Ready
In Progress
Contract Review
Code Review
Integration Test
Demo Ready
Done
Blocked
```

## 3. Task description template

Use this template for every engineering task:

```markdown
## Outcome
[One user- or operator-observable result]

## Context
[Why this result matters and which product/evidence rule it supports]

## In scope
- [Concrete implementation item]
- [Contract or test item]
- [Observability or demonstration item]

## Out of scope
- [Explicit exclusion]

## Inputs and dependencies
- [Contract, fixture, decision, service, or prerequisite]

## Acceptance criteria
- Given [state], when [action], then [observable result].
- Given [failure or incomplete state], when [action], then [safe explicit result].
- Privacy and tenant boundaries remain enforced.
- The milestone demonstration remains runnable from a clean checkout.

## Verification
- [Exact repository command]
- [Exact demonstration steps]

## Evidence to attach
- Pull request and CI run
- Test output
- Screenshot or trace identifier where useful
- Contract or ADR link
- Known limitation or follow-up
```

---

# M0 — Monorepo and One-Command Skeleton

## M0-01 — Approve runtime and monorepo architecture ADR

**Division:** Shared  
**Type:** ADR  
**Dependencies:** None

### Outcome

The team has one approved decision for application runtimes, monorepo zones, package management, local orchestration, and contract formats.

### Acceptance criteria

- Records TypeScript/Node.js as the default application language.
- Records SQL, Bash, and Docker Compose responsibilities.
- Defines the four independently buildable applications.
- Defines language-neutral contract ownership and runtime validation.
- Defines conditions for introducing another language.
- Includes alternatives and consequences.
- All three divisions approve the ADR.

## M0-02 — Establish target monorepo application zones

**Division:** Application & Frontend  
**Type:** Infrastructure  
**Dependencies:** M0-01

### Outcome

The repository exposes clear zones for Edge, data platform, middleware, web, shared contracts, infrastructure, scripts, and tests without breaking the existing frontend.

### Acceptance criteria

- Target directories are created or an incremental migration plan is documented.
- Each application has an independent package/build boundary.
- No application imports another application's implementation.
- Existing frontend remains runnable.
- Architecture tests recognize the selected roots.

## M0-03 — Create canonical contracts package skeleton

**Division:** Core Data Platform  
**Type:** Contract  
**Dependencies:** M0-01, M0-02

### Outcome

All divisions can consume one versioned package for canonical schemas, acknowledgements, health models, error codes, and test fixtures.

### Acceptance criteria

- Contains schema-first definitions and generated or derived TypeScript types.
- Provides runtime validation.
- Excludes database rows, controllers, concrete adapters, and UI code.
- Contains positive and negative fixture examples.
- Has compatibility and contract tests.

## M0-04 — Create health and readiness contract

**Division:** Shared  
**Type:** Contract  
**Dependencies:** M0-03

### Outcome

Every application reports consistent liveness, readiness, version, and safe dependency state.

### Acceptance criteria

- Distinguishes liveness from readiness.
- Includes service and contract version.
- Includes safe dependency state without secrets.
- Uses typed failure classifications.
- Is consumed by all four application skeletons.

## M0-05 — Scaffold Echo Edge application

**Division:** Edge & Integrations  
**Type:** Feature  
**Dependencies:** M0-02, M0-04

### Outcome

Echo Edge builds, tests, starts, and reports health as an independent TypeScript/Node.js application.

### Acceptance criteria

- Has typed configuration parsed at startup.
- Has no cloud database dependency.
- Includes adapter, privacy, normalisation, buffer, and sender boundaries.
- Reports health using the shared contract.
- Unit and architecture tests pass.

## M0-06 — Scaffold Core Data Platform application

**Division:** Core Data Platform  
**Type:** Feature  
**Dependencies:** M0-02, M0-04

### Outcome

The platform service builds, tests, starts, and reports health independently.

### Acceptance criteria

- Establishes core, ports, adapters, and composition boundaries.
- Provides placeholder admission and query ports without fake business claims.
- Reports dependency readiness safely.
- Unit and architecture tests pass.

## M0-07 — Scaffold Application Middleware

**Division:** Application & Frontend  
**Type:** Feature  
**Dependencies:** M0-02, M0-04

### Outcome

Middleware builds, tests, starts, and reports health independently.

### Acceptance criteria

- Establishes actor/tenant-context boundary.
- Establishes Query API client port.
- Has typed error mapping.
- Does not directly access analytical databases.
- Unit and architecture tests pass.

## M0-08 — Integrate existing frontend into monorepo plan

**Division:** Application & Frontend  
**Type:** Infrastructure  
**Dependencies:** M0-02

### Outcome

The existing Next.js application remains functional and has a documented migration path to the target `apps/web` zone.

### Acceptance criteria

- No unrelated UI rewrite is included.
- Current routes and tests remain operational.
- Feature-Sliced Design boundaries remain enforced.
- The build uses repository-pinned Node and pnpm versions.

## M0-09 — Implement local infrastructure composition

**Division:** Application & Frontend  
**Type:** Infrastructure  
**Dependencies:** M0-01

### Outcome

Kafka, ClickHouse, PostgreSQL, and S3-compatible local storage can start with safe development configuration.

### Acceptance criteria

- Services have pinned images or versions.
- Volumes and ports are documented.
- Health checks are present.
- Default credentials are development-only and not reused as production examples.
- Teardown does not delete unrelated data.

## M0-10 — Implement root bootstrap script

**Division:** Application & Frontend  
**Type:** Infrastructure  
**Dependencies:** M0-05, M0-06, M0-07, M0-08, M0-09

### Outcome

A clean checkout becomes a running local stack through `./scripts/bootstrap.sh`.

### Acceptance criteria

- Validates required tool versions.
- Installs locked dependencies.
- Creates safe local configuration.
- Starts dependencies and applications.
- Uses readiness checks rather than blind sleeps.
- Applies idempotent schemas/migrations.
- Can run repeatedly.
- Prints service URLs and next steps.

## M0-11 — Implement shared verification command

**Division:** Shared  
**Type:** Test  
**Dependencies:** M0-05, M0-06, M0-07, M0-08

### Outcome

`./scripts/verify.sh` runs the agreed repository-wide quality gates.

### Acceptance criteria

- Runs formatting check, lint, typecheck, architecture tests, unit tests, contract tests, and builds.
- Fails when any mandatory gate fails.
- Reports which phase failed.
- Runs consistently locally and in CI.

## M0-12 — Demonstrate clean-checkout skeleton

**Division:** Shared  
**Type:** Test  
**Dependencies:** M0-10, M0-11

### Outcome

All four applications and infrastructure start from a clean checkout and expose readiness.

### Acceptance criteria

- Bootstrap succeeds from documented prerequisites.
- Frontend displays aggregate service health.
- Verification passes.
- Evidence is attached to the task.

---

# M1 — First Private Canonical Event

## M1-01 — Define initial canonical event schema

**Division:** Core Data Platform  
**Type:** Contract  
**Dependencies:** M0-03

### Acceptance criteria

- Defines event ID, type, version, source, occurrence time, pseudonymous actor, session, repository reference, collector version, policy version, and allowlisted metadata.
- Does not trust payload tenant identity.
- Defines idempotency and compatibility behavior.
- Includes valid, invalid, duplicate, and prohibited-content fixtures.
- Reviewed by all divisions.

## M1-02 — Define and test local privacy allowlist

**Division:** Edge & Integrations  
**Type:** Contract  
**Dependencies:** M1-01

### Acceptance criteria

- Explicitly allows required metadata.
- Rejects prompts, responses, code, diffs, raw paths, raw commands, secrets, screenshots, keystrokes, and transcripts.
- Runs before outbound queue or disk persistence.
- Negative fixtures prove prohibited fields cannot pass.
- Safe rejection counters contain no prohibited values.

## M1-03 — Implement initial Cursor adapter

**Division:** Edge & Integrations  
**Type:** Feature  
**Dependencies:** M1-01, M1-02

### Acceptance criteria

- Converts an approved Cursor or synthetic source event into the canonical event.
- Keeps vendor DTOs inside the adapter.
- Handles malformed and unsupported versions explicitly.
- Attaches schema, collector, and policy versions.
- Does not claim final AI contribution.

## M1-04 — Implement safe Git provenance linking

**Division:** Edge & Integrations  
**Type:** Feature  
**Dependencies:** M1-03

### Acceptance criteria

- Attaches safe repository/commit/work-key references where available.
- Does not send diffs, source, unrestricted paths, or raw branch names.
- Represents absent and conflicting provenance explicitly.
- Tests repository mismatch and unavailable Git state.

## M1-05 — Implement encrypted bounded local buffer

**Division:** Edge & Integrations  
**Type:** Feature  
**Dependencies:** M1-02, M1-03

### Acceptance criteria

- Stores only privacy-approved canonical events.
- Survives process restart.
- Has explicit capacity and retention behavior.
- Preserves idempotency identifiers.
- Reports safe queue health.

## M1-06 — Define enrollment and admission contract

**Division:** Core Data Platform  
**Type:** Contract  
**Dependencies:** M1-01

### Acceptance criteria

- Defines credential/enrollment authentication.
- Derives tenant context server-side.
- Defines schema validation, acknowledgement, correlation ID, and safe errors.
- Defines replay and rate-limit behavior.
- Reviewed by Division 1.

## M1-07 — Implement authenticated admission API

**Division:** Core Data Platform  
**Type:** Feature  
**Dependencies:** M1-06

### Acceptance criteria

- Validates authentication, schema, policy, and replay.
- Derives and attaches tenant context.
- Rejects cross-tenant payload claims.
- Returns typed acknowledgement or safe error.
- Records safe correlation diagnostics.

## M1-08 — Implement durable idempotent event publication

**Division:** Core Data Platform  
**Type:** Feature  
**Dependencies:** M1-07, M0-09

### Acceptance criteria

- Accepted events are durably published to the local Kafka path.
- Logical duplicates do not create duplicate accepted facts.
- Tenant partitioning policy is tested.
- Failure before durable acceptance does not return success.

## M1-09 — Archive and project ingestion state

**Division:** Core Data Platform  
**Type:** Feature  
**Dependencies:** M1-08

### Acceptance criteria

- Canonical event is archived under a tenant-safe key.
- Minimal analytical projection is written idempotently.
- Archive and projection status can be reconciled.
- Processing failure is visible and replayable.

## M1-10 — Define Data Health ingestion contract

**Division:** Core Data Platform  
**Type:** Contract  
**Dependencies:** M1-09

### Acceptance criteria

- Exposes source, status, watermark, freshness, last acceptance, safe failure class, and coverage state.
- Distinguishes empty source from failed source.
- Contains no database-specific types.
- Reviewed by Division 3.

## M1-11 — Implement tenant-aware ingestion-health query

**Division:** Core Data Platform  
**Type:** Feature  
**Dependencies:** M1-10

### Acceptance criteria

- Returns only the authenticated tenant's data.
- Cross-tenant tests fail safely.
- Applies bounded query behavior.
- Operational failure is not returned as an empty success.

## M1-12 — Integrate middleware Data Health endpoint

**Division:** Application & Frontend  
**Type:** Feature  
**Dependencies:** M1-10, M1-11

### Acceptance criteria

- Resolves immutable actor/tenant context.
- Authenticates and authorises every request.
- Calls the Query API rather than a database.
- Maps typed errors without losing classification.
- Carries correlation identifiers.

## M1-13 — Implement Data Health ingestion UI

**Division:** Application & Frontend  
**Type:** Feature  
**Dependencies:** M1-12

### Acceptance criteria

- Shows source status, freshness, and coverage.
- Distinguishes loading, empty, success, stale, and failure.
- Does not expose raw diagnostic causes.
- Supports keyboard and accessible status semantics.

## M1-14 — Integrate Edge with real admission

**Division:** Edge & Integrations  
**Type:** Feature  
**Dependencies:** M1-05, M1-07, M1-08

### Acceptance criteria

- Replaces contract fake with the real admission client.
- Retries transient failures without duplicate logical events.
- Invalid or expired enrollment fails safely.
- Delivery acknowledgement updates local buffer state.

## M1-15 — Build first vertical demonstration

**Division:** Shared  
**Type:** Test  
**Dependencies:** M1-09, M1-13, M1-14

### Acceptance criteria

- `demo.sh` submits a safe synthetic or Cursor event.
- Event passes local privacy processing and authenticated admission.
- Event becomes durable and visible in Data Health.
- Prohibited-content fixture is rejected locally.
- Cross-tenant read is rejected.
- Test and demonstration evidence is attached.

---

# M2 — Work-to-Deployment Evidence Trace

## M2-01 — Define evidence node and edge contracts

**Division:** Core Data Platform  
**Type:** Contract

### Acceptance criteria

- Defines work item, commit, pull request, build, artifact, and deployment nodes.
- Defines provenance, link method, confidence, evidence state, and rule version.
- Represents direct, confirmed, inferred, conflicted, missing, and unknown states.
- Does not model the work item as a forced causal stage.

## M2-02 — Implement Jira work-item connector

**Division:** Edge & Integrations  
**Type:** Feature  
**Dependencies:** M2-01

## M2-03 — Implement GitHub commit and pull-request connector

**Division:** Edge & Integrations  
**Type:** Feature  
**Dependencies:** M2-01

## M2-04 — Implement GitHub Actions and Deployments connector

**Division:** Edge & Integrations  
**Type:** Feature  
**Dependencies:** M2-01

## M2-05 — Build idempotent evidence graph projection

**Division:** Core Data Platform  
**Type:** Feature  
**Dependencies:** M2-02, M2-03, M2-04

## M2-06 — Implement tenant-aware trace query

**Division:** Core Data Platform  
**Type:** Feature  
**Dependencies:** M2-05

## M2-07 — Implement middleware trace endpoint

**Division:** Application & Frontend  
**Type:** Feature  
**Dependencies:** M2-06

## M2-08 — Implement Live Trace evidence graph and timeline

**Division:** Application & Frontend  
**Type:** Feature  
**Dependencies:** M2-07

## M2-09 — Demonstrate ticket-to-deployment trace

**Division:** Shared  
**Type:** Test  
**Dependencies:** M2-08

### Milestone acceptance

- A Jira work item links to GitHub change and deployment evidence.
- Every edge exposes provenance and evidence state.
- Replay does not duplicate graph facts.
- Missing or conflicting evidence remains visible.
- Cross-tenant trace lookup fails.

---

# M3 — Four-Cohort Classification

## M3-01 — Define cohort-classification contract and rule versioning

**Division:** Core Data Platform  
**Type:** Contract

## M3-02 — Produce capture-health and coverage evidence

**Division:** Edge & Integrations  
**Type:** Feature  
**Dependencies:** M3-01

## M3-03 — Implement four-cohort classification service

**Division:** Core Data Platform  
**Type:** Feature  
**Dependencies:** M3-01, M3-02

## M3-04 — Add cohort and evidence health to trace queries

**Division:** Core Data Platform  
**Type:** Feature  
**Dependencies:** M3-03

## M3-05 — Present cohort classification in Live Trace

**Division:** Application & Frontend  
**Type:** Feature  
**Dependencies:** M3-04

## M3-06 — Present unknown and coverage rates in Data Health

**Division:** Application & Frontend  
**Type:** Feature  
**Dependencies:** M3-04

## M3-07 — Demonstrate all four cohorts

**Division:** Shared  
**Type:** Test  
**Dependencies:** M3-05, M3-06

### Milestone acceptance

- Seeded records demonstrate AI-linked, AI-exposed only, capture-complete no-AI-observed, and unknown.
- Unknown is excluded from direct comparison.
- Each classification exposes evidence and rule version.
- Coverage limitations are visible.

---

# M4 — First Valid Comparison

## M4-01 — Approve first metric definition

**Division:** Shared  
**Type:** ADR

### Recommended decision

Use work-item cycle time as the initial comparison metric unless the team records another justified choice.

## M4-02 — Define metric contract and fixtures

**Division:** Core Data Platform  
**Type:** Contract  
**Dependencies:** M4-01

## M4-03 — Implement natural-grain metric calculation

**Division:** Core Data Platform  
**Type:** Feature  
**Dependencies:** M4-02

## M4-04 — Implement valid roll-up and suppression rules

**Division:** Core Data Platform  
**Type:** Feature  
**Dependencies:** M4-03

## M4-05 — Implement comparison Query API

**Division:** Core Data Platform  
**Type:** Feature  
**Dependencies:** M4-04

## M4-06 — Implement Overview primary comparison

**Division:** Application & Frontend  
**Type:** Feature  
**Dependencies:** M4-05

## M4-07 — Implement Compare distributions and limitations

**Division:** Application & Frontend  
**Type:** Feature  
**Dependencies:** M4-05

## M4-08 — Connect comparison samples to Live Trace

**Division:** Application & Frontend  
**Type:** Feature  
**Dependencies:** M4-06, M4-07

## M4-09 — Demonstrate first defensible comparison

**Division:** Shared  
**Type:** Test  
**Dependencies:** M4-08

### Milestone acceptance

- Comparison uses AI-linked and capture-complete no-AI-observed cohorts.
- Shows sample, eligible population, window, maturity, evidence, and limitations.
- Unknown work is excluded.
- Roll-up and small-sample tests pass.
- User can drill from the aggregate to evidence.

---

# M5 — Production Quality Linkage

## M5-01 — Define quality signal and release-window contracts

**Division:** Core Data Platform  
**Type:** Contract

## M5-02 — Implement Sentry quality connector

**Division:** Edge & Integrations  
**Type:** Feature  
**Dependencies:** M5-01

## M5-03 — Correlate quality signals to deployments

**Division:** Core Data Platform  
**Type:** Feature  
**Dependencies:** M5-02

## M5-04 — Implement open and mature quality windows

**Division:** Core Data Platform  
**Type:** Feature  
**Dependencies:** M5-03

## M5-05 — Add quality metric to Overview and Compare

**Division:** Application & Frontend  
**Type:** Feature  
**Dependencies:** M5-04

## M5-06 — Add quality evidence to Live Trace

**Division:** Application & Frontend  
**Type:** Feature  
**Dependencies:** M5-04

## M5-07 — Demonstrate deployment-linked quality

**Division:** Shared  
**Type:** Test  
**Dependencies:** M5-05, M5-06

### Milestone acceptance

- Quality signals attach to deployments/release windows, not developers.
- Open and mature windows are distinct.
- Late signals update reproducibly.
- Aggregate quality results trace to evidence.

---

# M6 — Configurable Organisational Slice

## M6-01 — Approve minimum v1 graph and allocation policies

**Division:** Shared  
**Type:** ADR

## M6-02 — Define dimension, relationship, mapping, and allocation contracts

**Division:** Core Data Platform  
**Type:** Contract  
**Dependencies:** M6-01

## M6-03 — Implement control-plane graph persistence

**Division:** Core Data Platform  
**Type:** Feature  
**Dependencies:** M6-02

## M6-04 — Implement cycle, orphan, conflict, and allocation validation

**Division:** Core Data Platform  
**Type:** Feature  
**Dependencies:** M6-03

## M6-05 — Implement attributed and touched query semantics

**Division:** Core Data Platform  
**Type:** Feature  
**Dependencies:** M6-04

## M6-06 — Implement configuration middleware commands and audit

**Division:** Application & Frontend  
**Type:** Feature  
**Dependencies:** M6-03, M6-04

## M6-07 — Implement Data Policy graph and mapping interface

**Division:** Application & Frontend  
**Type:** Feature  
**Dependencies:** M6-06

## M6-08 — Implement Overview `View by` and Explore roll-ups

**Division:** Application & Frontend  
**Type:** Feature  
**Dependencies:** M6-05

## M6-09 — Expose recomputation progress and completion

**Division:** Core Data Platform  
**Type:** Feature  
**Dependencies:** M6-05, M6-06

## M6-10 — Demonstrate configurable organisational slice

**Division:** Shared  
**Type:** Test  
**Dependencies:** M6-07, M6-08, M6-09

### Milestone acceptance

- Minimal graph can be configured and validated.
- Attributed totals reconcile.
- Touched results are labelled non-additive.
- Mapping history is auditable.
- Saved configuration and completed recomputation remain distinct.

---

# M7 — Hardening and Reproducible Evaluation

## M7-01 — Build complete privacy regression pack

**Division:** Edge & Integrations  
**Type:** Test

## M7-02 — Build complete cross-tenant regression pack

**Division:** Core Data Platform  
**Type:** Test

## M7-03 — Build correlation-accuracy evaluation pack

**Division:** Core Data Platform  
**Type:** Test

## M7-04 — Build metric-reproducibility evaluation pack

**Division:** Core Data Platform  
**Type:** Test

## M7-05 — Test archive replay and projection recovery

**Division:** Core Data Platform  
**Type:** Test

## M7-06 — Test UI accessibility and critical journeys

**Division:** Application & Frontend  
**Type:** Test

## M7-07 — Benchmark production-shaped analytical workload

**Division:** Core Data Platform  
**Type:** Test

## M7-08 — Validate clean-checkout setup on supported environments

**Division:** Application & Frontend  
**Type:** Test

## M7-09 — Document limitations and unresolved decisions

**Division:** Shared  
**Type:** Documentation

## M7-10 — Run final reproducible FYP demonstration

**Division:** Shared  
**Type:** Test  
**Dependencies:** M7-01 through M7-09

### Milestone acceptance

- Privacy, tenancy, correlation, metrics, replay, accessibility, and clean-checkout evidence is collected.
- Performance claims include workload and measurement conditions.
- Limitations remain explicit.
- Synthetic results are labelled correctly.
- The final demonstration can be repeated from documented inputs.

---

## 4. Governance and recurring tasks

Create these recurring ClickUp tasks:

### Weekly cross-division integration review

**Recurrence:** Weekly  
**Owner:** Rotating

Checklist:

- Demonstrate current vertical path.
- Review shared contract changes.
- Review open decisions and blockers.
- Review privacy and tenant risks.
- Review failed integration points.
- Select next thin slice.
- Check documentation drift.

### Milestone contract review

**Recurrence:** At the start of each milestone  
**Owner:** Milestone lead

Checklist:

- Confirm input/output contracts.
- Confirm versioning and compatibility.
- Confirm tenant and evidence semantics.
- Confirm failure and absence behavior.
- Confirm contract fixtures.
- Obtain required division approvals.

### Milestone clean-checkout demonstration

**Recurrence:** At the end of each milestone  
**Owner:** Division 3 coordinates; all divisions participate

Checklist:

- Start from clean checkout.
- Run bootstrap and verification.
- Show source/input.
- Show boundary transitions.
- Show user-visible result.
- Show trace and health.
- Show one failure case.
- Show tenant/privacy enforcement.
- Attach evidence.

## 5. Initial assignment sequence

All three people start with M0 together, then work in parallel:

### Person 1 — Edge and Integrations

```text
M0-01 review
-> M0-05
-> M1-02
-> M1-03
-> M1-04
-> M1-05
-> M1-14
```

### Person 2 — Core Data Platform

```text
M0-01 review
-> M0-03
-> M0-06
-> M1-01
-> M1-06
-> M1-07
-> M1-08
-> M1-09
-> M1-10
-> M1-11
```

### Person 3 — Application, Frontend, and Developer Experience

```text
M0-01 review
-> M0-02
-> M0-07
-> M0-08
-> M0-09
-> M0-10
-> M1-12
-> M1-13
```

The team jointly owns M0-04, M0-11, M0-12, and M1-15.
