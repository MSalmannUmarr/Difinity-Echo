# Difinity Echo Implementation Product Briefs

**Status:** Implementation baseline  
**Audience:** Product owners, architects, engineers, reviewers, and coding assistants  
**Applies to:** Echo Edge, Core Data Platform, Application Middleware, Frontend, shared contracts, monorepo tooling, and vertical delivery milestones  
**Purpose:** Provide a standard, prompt-ready framework for implementing Difinity Echo consistently from a single GitHub monorepo.

---

## 1. How to use this document

This document is both a product brief and a reusable coding-assistant context package. Before starting a milestone or work item:

1. Read the common product rules and system boundaries in sections 2-8.
2. Read the relevant component brief in sections 9-12.
3. Select one vertical milestone from section 14.
4. Fill in the task prompt template in section 16.
5. Implement the smallest end-to-end change that proves the milestone.
6. Run the verification gates in section 15 and report anything not run.

This document does not override a direct user request. It does not turn examples, future phases, or unresolved questions into settled requirements. If a task conflicts with a confirmed constraint, stop and surface the conflict before implementation.

### Requirement language

- **MUST / MUST NOT:** mandatory project constraint.
- **SHOULD:** expected implementation unless an Architecture Decision Record (ADR) explains the deviation.
- **MAY:** optional implementation choice.
- **CONFIRMED:** accepted product or architecture direction.
- **WORKING DIRECTION:** preferred but still subject to validation.
- **OPEN DECISION:** do not silently decide; record or escalate it.

---

## 2. Product definition

Difinity Echo is a continuous AI engineering analytics platform for CTOs, VP Engineering, Heads of Engineering, platform leaders, and selected engineering stakeholders.

Echo connects AI-tool activity and spend with engineering work, delivery performance, software quality, support demand, and product or customer outcomes. Its purpose is to make the evidence behind engineering-AI investment visible and inspectable.

The defensible question Echo answers is:

> Within a defined engineering scope, evidence policy, and observation window, how did AI-linked work differ from comparable capture-complete work in delivery speed, review effort, quality, support demand, expenditure, and product outcomes?

Echo is not:

- a developer-ranking or employee-surveillance product;
- a generic activity, cost, or observability dashboard;
- a replacement for engineering systems of record;
- proof that correlation is causation;
- a single productivity, ROI, or “magic” score;
- a claim that prototype data represents customer outcomes.

### Core product properties

1. **Traceability:** every aggregate can be traced to eligible evidence.
2. **Comparability:** AI-linked work is compared only with a valid comparator.
3. **Evidence awareness:** unknown or incomplete evidence remains explicit.
4. **Analytical validity:** metrics are calculated at their natural grain and rolled up correctly.
5. **Privacy:** useful metadata is collected without sending source content by default.

---

## 3. Delivery mandate

### 3.1 Monorepo

The GitHub repository MUST contain independently buildable barebone applications for:

- **Echo Edge / Local Agent** — developer-machine collection, local privacy enforcement, normalisation, provenance linking, and durable buffering.
- **Core Data Platform** — admission, streaming, processing, canonical evidence, storage, correlation, cohorts, metrics, and query services.
- **Application Middleware** — authenticated user-facing backend, authorisation, tenant resolution, policy enforcement, orchestration, and response shaping.
- **Frontend** — Echo web application and the six primary product surfaces.

The monorepo SHOULD also contain:

- versioned shared contracts and schemas;
- infrastructure and local-development composition;
- architecture tests and contract fixtures;
- synthetic demonstration data;
- component briefs and ADRs;
- one root bootstrap script.

Recommended target zones:

```text
repo/
  apps/
    edge-agent/
    data-platform/
    app-middleware/
    web/
  packages/
    contracts/
    test-fixtures/
    observability-contracts/
  infra/
    local/
    modules/
    environments/
  scripts/
    bootstrap.sh
    verify.sh
    demo.sh
  docs/
    ddd/
    adr/
    product-briefs/
  tests/
    architecture/
    contracts/
    end-to-end/
```

This is a target structure, not permission for an unrelated repository rewrite. Migrate incrementally through vertical milestones.

### 3.2 One-command local bootstrap

From a clean GitHub checkout, one Bash script MUST:

1. validate required tool versions;
2. create local configuration from safe examples without committing secrets;
3. install locked dependencies;
4. build all applications and packages;
5. start required local infrastructure and services;
6. apply idempotent schemas or migrations;
7. seed deterministic synthetic demonstration data;
8. wait for health/readiness checks rather than sleeping blindly;
9. print service URLs and the next demonstration command;
10. fail with a clear phase, cause, and recovery action;
11. be safe to run repeatedly.

The script MUST NOT embed production credentials, silently weaken privacy/security controls, or claim success before all required health checks pass.

Target invocation:

```bash
./scripts/bootstrap.sh
```

The exact container/runtime mechanism is an implementation decision, but the developer experience above is the contract.

### 3.3 Vertical delivery

Build vertically, not horizontally. A milestone is complete only when a user-observable path crosses the necessary components and can be demonstrated.

A vertical slice normally includes:

```text
source or synthetic event
  -> local privacy/normalisation where applicable
  -> authenticated admission
  -> durable event stream
  -> processing and persistence
  -> evidence/cohort/metric calculation
  -> tenant-aware query
  -> middleware response
  -> frontend presentation
  -> trace/data-health evidence
```

A collection-only connector, disconnected database schema, backend-only endpoint, or static screen is not an end-to-end milestone.

---

## 4. Canonical domain and evidence model

Echo maintains stable canonical facts while allowing customers to configure how facts are organised.

### 4.1 Canonical facts

- AI session
- developer interaction
- AI usage event
- AI cost event
- accepted edit or change set
- commit
- pull request
- work item
- build
- artifact
- deployment or release
- quality signal
- support signal
- product or customer outcome measurement

The evidence model is a many-to-many graph, not a rigid pipeline:

```text
AI activity -> accepted edit/change set -> commit -> pull request
pull request <-> work item
work item <-> product / initiative / configured entity
commit -> build -> artifact -> production deployment
deployment -> quality / support / outcome observation windows
cost and contribution evidence attach at their valid points
```

A work item is a side-link to code and delivery evidence, not a causal stage between AI activity and code. Quality signals bind to deployments or mature release windows, never directly to individual developers.

### 4.2 Customer-configured dimensional graph

Echo MUST NOT hardcode a single Company → Organisation → Team → Initiative → Epic → Ticket hierarchy.

Initial dimension-family templates are:

- Organisation: company, division, department, tribe, squad, team
- Work: portfolio, programme, initiative, workstream, epic, feature, ticket
- Product: product, application, service, component, repository
- Financial: cost centre, budget, contract, vendor
- People: role, location, employment type, individual

Relationships may be many-to-many and effective-dated. Initial relationship semantics include contains, owns, contributes to, belongs to, delivers, operates, funded by, and affects.

Each relationship SHOULD retain source, role, effective period, mapping method, evidence state, rule version, and optional allocation weight. The platform MUST detect cycles where forbidden, orphan entities, unresolved mappings, conflicting ownership, contradictory relationships, and allocation weights that do not reconcile.

Full multi-parent DAG behaviour, minimum v1 dimensions, versioning rules, and default ownership/allocation policies remain open decisions unless recorded in an ADR.

### 4.3 AI evidence cohorts

Every eligible work item or shipped change MUST preserve one of four states:

1. **AI-linked work:** direct or manually confirmed evidence connects AI activity to a shipped change.
2. **AI-exposed only:** AI activity occurred nearby, but contribution to the shipped change was not established.
3. **No AI observed, capture-complete:** collection was healthy and no qualifying AI contribution was found; this is the valid comparison cohort.
4. **AI status unknown:** collection, identity, or linkage was incomplete; exclude from direct AI-versus-non-AI comparison.

Unknown MUST never silently become non-AI.

Every classification MUST be traceable to evidence, rule version, and relevant coverage/health state.

---

## 5. Measurement contract

Every metric MUST declare:

- natural grain;
- eligible population;
- numerator/denominator or mergeable distribution;
- selected AI cohort and comparison cohort;
- reporting and observation windows;
- permitted group-by dimensions;
- deduplication key;
- allocation treatment;
- minimum sample threshold;
- maturity requirement;
- evidence state and limitations.

Examples of natural grains:

| Metric family | Natural grain |
| --- | --- |
| Session duration and interaction intensity | AI session |
| AI spend | Cost event |
| Review duration and review rework | Pull request |
| Work cycle time | Work item |
| Change failure and rollback | Deployment |
| Escaped defects and incidents | Mature release window |
| Support rate | Release/feature-exposed customer cohort |
| Product/customer outcome | Declared product, feature, initiative, or exposure unit |

Roll-up rules:

- recompute rates from underlying numerators and denominators;
- recompute medians and percentiles from eligible observations or mergeable sketches;
- never average child medians;
- never average child AI-versus-non-AI differences;
- deduplicate totals from underlying fact identifiers;
- suppress insufficient or incomplete cohorts;
- expose sample size, denominator, observation window, maturity, and evidence health;
- recompute comparisons at the selected scope.

### Ownership and allocation

Every analytical view MUST distinguish owned work, contributed work, all involvement, and selected-dimension intersection where relevant.

- **Attributed** measures fractionally allocate facts or spend so totals reconcile.
- **Touched** measures show the full fact against each related entity and are non-additive.

Echo MUST label touched measures as non-additive and MUST NOT silently choose an allocation policy.

---

## 6. Privacy, security, and tenancy invariants

### 6.1 Local privacy boundary

Sanitisation MUST occur on the endpoint before outbound queue or disk persistence. Only allowlisted metadata may leave the device.

Default prohibited outbound data:

- prompts and responses;
- reasoning or thought content;
- source code and raw diffs;
- raw file paths;
- raw branch names beyond a locally extracted work key;
- raw commands;
- tool arguments and results;
- raw error-message text;
- secrets and environment-variable values;
- clipboard data, screenshots, keystrokes, and full transcripts.

No vendor-native content-bearing payload may be forwarded directly to Echo Cloud.

### 6.2 Cloud admission and tenant isolation

- Admission MUST authenticate the enrolled agent or external connector.
- Tenant identity MUST be derived from authenticated enrollment or connector credentials, never trusted from an arbitrary payload field.
- Tenant context MUST be attached to every fact, relationship, aggregate, cache entry, and archived object.
- Rate limits, replay protection, schema validation, and admission policy MUST apply before durable acceptance.
- Cross-tenant negative tests are mandatory.

### 6.3 Read isolation

- Browsers and clients MUST NOT query ClickHouse, PostgreSQL, Kafka, or object storage directly.
- Application middleware MUST call a tenant-aware Query API.
- Query services MUST enforce tenant-aware joins and evidence policy.
- Database row policies are defence in depth, not the sole isolation boundary.
- PostgreSQL control-plane storage SHOULD be private and reachable only by authorised services and limited administration paths.

### 6.4 Identity and authority

Resolve authenticated identity at the boundary and pass an immutable typed actor/tenant context. Frontend context is not proof of authority. The backend MUST authenticate and authorise every protected operation and revalidate tenant ownership.

---

## 7. System architecture and data flow

### 7.1 Reference flow

```text
AI tools / provider APIs / engineering systems
  -> vendor adapters and source connectors
  -> local allowlist privacy processing where endpoint data is involved
  -> canonical event normalisation
  -> Git and identity provenance
  -> authenticated regional admission API
  -> Kafka durable tenant-partitioned event log
  -> processing, enrichment, deduplication, identity resolution, correlation
  -> ClickHouse hot analytics
  -> S3-compatible canonical archive
  -> PostgreSQL mutable control plane
  -> evidence graph and natural-grain metric engine
  -> tenant-aware Query API
  -> application middleware
  -> Echo web application
```

### 7.2 Storage responsibilities

**Kafka**

- durable event log and spike buffer;
- tenant-separated topics or equivalent partitioning policy;
- replay, decoupling, burst absorption, and failure isolation.

**ClickHouse**

- normalised and enriched analytical facts;
- high-cardinality traces, cohorts, distributions, percentiles, and roll-ups;
- hot queryable data with tenant-aware policies.

**S3-compatible archive**

- immutable canonical Parquet or equivalent qualified files;
- partitioning by tenant/date/type;
- historical replay, recomputation, audit support, and tenant-term retention.

**PostgreSQL control plane**

- tenants, users, roles, and RBAC;
- connector configuration and enrollment;
- identity mappings;
- policy, retention, hierarchy/DAG configuration, job state, and audit metadata.

PostgreSQL is not the primary event warehouse. ClickHouse is not accessed directly by browsers or general users.

### 7.3 Freshness

Echo processes continuously and may use near-real-time data, but second-level freshness is not the core promise. Every source and metric SHOULD expose event watermark, source freshness, maturity, late-event behaviour, and observation window.

---

## 8. Initial scope and integration priorities

The whiteboards identify the committed FYP vertical slice as:

- Cursor for AI coding activity;
- Jira Cloud for work tracking;
- GitHub for source control;
- GitHub Actions and Deployments for build/release evidence;
- Sentry Cloud for production quality signals.

The broader written product baseline also identifies Claude Code, OpenAI Codex, GitHub Copilot, and Cursor as first-class intended AI collection products. For implementation planning, treat Cursor as the initial committed demonstration path and the remaining AI tools as additional adapters unless the milestone owner explicitly changes scope.

Phase 2 or enterprise extensions include:

- additional AI collectors: Claude Code, Codex, Copilot;
- Linear and Bitbucket;
- Zendesk or Intercom;
- Amplitude or PostHog;
- HRIS, CODEOWNERS, service catalogues, cost centres, and financial inputs.

Provider administration APIs complement endpoint collection with usage, seats, model configuration, token, and billing data.

---

## 9. Product brief — Echo Edge / Local Agent

### 9.1 Mission

Collect, sanitise, normalise, correlate, and reliably transmit content-free AI engineering telemetry from a developer machine without allowing prohibited content to cross the local trust boundary.

### 9.2 Primary users and operators

- developers whose approved tooling emits events;
- platform/security administrators configuring policy and enrollment;
- integration engineers developing vendor adapters;
- support operators diagnosing collector health without reading source content.

### 9.3 Responsibilities

1. **Vendor Adapter** — accept supported IDE hooks, CLI hooks, OpenTelemetry, or administration events and translate vendor-specific structures.
2. **Local Allowlist Privacy Processor** — remove or reject prohibited content before any outbound persistence.
3. **Session and Event Normaliser** — map accepted fields to a versioned provider-neutral canonical event schema.
4. **Local Git Provenance Linker** — attach repository, commit, pull-request, and locally extracted work-key references without sending raw diffs or unrestricted paths.
5. **Encrypted Durable Buffer** — survive offline periods and transient admission failures with bounded storage and explicit retention.
6. **Secure Sender** — authenticate to regional admission, retry safely, preserve idempotency, and expose delivery progress.
7. **Local Health** — expose version, policy version, schema version, queue depth, last successful send, rejected-event counts, and safe failure classification.

### 9.4 Inputs

- supported tool hooks and local events;
- locally available Git metadata;
- signed enrollment and endpoint policy;
- provider/adapter configuration;
- clock and stable event/idempotency identifiers.

### 9.5 Outputs

- versioned canonical metadata events;
- health and coverage events;
- safe policy rejection summaries;
- delivery acknowledgements and retry state.

### 9.6 Required metadata examples

- pseudonymous customer-controlled identity;
- provider, tool, model, and agent identifiers;
- session/turn identifiers and timestamps;
- duration, token, and cost metadata where available;
- tool category, outcome, and duration;
- permission mode and decision metadata;
- repository, commit, pull-request, and extracted work-key references;
- collector, schema, and policy versions;
- link method, confidence, and rule version.

### 9.7 Non-goals

- analysing or transmitting prompts, responses, source code, or full transcripts;
- deciding final AI contribution or business outcomes locally;
- directly writing cloud databases or Kafka;
- exposing reusable cloud credentials to plugins or untrusted child processes;
- ranking developer performance.

### 9.8 Key failure modes

- privacy filter bypass;
- duplicate or reordered events;
- partial/corrupt buffer writes;
- stale enrollment or policy;
- clock skew;
- Git identity mismatch;
- offline queue exhaustion;
- incompatible schema version;
- a vendor update changing its event shape.

### 9.9 Acceptance criteria

- prohibited-content fixtures are blocked before durable outbound storage;
- allowlisted events round-trip through schema validation;
- retries do not duplicate logical events;
- offline events survive restart and later deliver in a bounded manner;
- invalid/stale credentials cannot assign another tenant;
- health output contains no raw sensitive content;
- at least one committed source produces a demonstrable event that reaches the UI through the complete platform.

---

## 10. Product brief — Core Data Platform

### 10.1 Mission

Admit tenant-authenticated events, preserve a replayable canonical record, transform heterogeneous evidence into a traceable graph, classify the four AI cohorts, compute valid natural-grain metrics, and serve tenant-safe analytical queries.

### 10.2 Logical capabilities

1. **Regional Admission API**
   - authenticate mTLS/API enrollment or approved connector credentials;
   - derive tenant context;
   - validate schema and policy version;
   - apply rate limits and replay protection;
   - acknowledge durable acceptance with correlation identifiers.
2. **Kafka Event Log**
   - retain immutable admitted events;
   - partition safely by tenant and event semantics;
   - support replay and consumer isolation.
3. **Processing and Normalisation**
   - run source adapters for cloud-originated systems;
   - canonicalise, deduplicate, enrich, and resolve identities;
   - build evidence nodes and edges;
   - classify AI cohorts with versioned rules;
   - quarantine unparseable or policy-invalid data.
4. **Storage Writers**
   - write analytical facts to ClickHouse;
   - write canonical archive objects to S3-compatible storage;
   - maintain control-plane state in PostgreSQL.
5. **Metric Engine**
   - enforce declared natural grain, eligibility, windows, maturity, deduplication, thresholds, and allocation;
   - calculate attributed and touched views without mixing semantics;
   - expose supporting numerators, denominators, samples, and evidence health.
6. **Tenant-Aware Query API**
   - serve Overview, Compare, Explore, Live Trace, and Data Health needs;
   - return typed domain/query models rather than database rows;
   - prevent direct database coupling in middleware or clients.

### 10.3 Evidence states

Edges and classifications SHOULD distinguish direct, confirmed, inferred, conflicted, missing, and unknown evidence as appropriate. Each computed result SHOULD expose the rule/version and source facts needed to explain it.

### 10.4 Non-goals

- user-interface rendering;
- browser authentication flows;
- forwarding database-native result sets to clients;
- treating PostgreSQL as the event warehouse;
- claiming causal impact from lineage alone;
- silently imputing missing evidence.

### 10.5 Key failure modes

- cross-tenant joins or cache leakage;
- event duplication and replay producing double-counted facts;
- late events invalidating mature-looking results;
- identity collisions;
- invalid graph cycles or unreconciled allocations;
- incorrect percentile/rate roll-ups;
- ClickHouse unavailable while canonical events continue arriving;
- archive/write divergence;
- poison messages preventing consumer progress.

### 10.6 Acceptance criteria

- admitted events are authenticated, tenant-stamped, durable, and replayable;
- the same logical event remains idempotent across retries/replay;
- canonical archive and analytical projections can be reconciled;
- cohort classification never maps unknown to non-AI;
- metric contract tests prove valid roll-ups and sample suppression;
- cross-tenant negative tests cover writes, joins, caches, queries, and archive keys;
- a trace can walk from a selected work/deployment record to its source evidence;
- storage degradation exposes health and recoverability rather than silent loss.

---

## 11. Product brief — Application Middleware

### 11.1 Mission

Provide the secure backend for Echo user interactions, enforcing authentication, authorisation, tenant and policy context, query validation, rate limits, orchestration, and stable frontend-facing response contracts.

### 11.2 Responsibilities

- browser/SSO authentication integration;
- typed immutable actor and tenant context;
- role/capability-based authorisation;
- tenant resolution and ownership validation;
- request validation and safe query bounds;
- policy enforcement, including individual-visibility restrictions;
- orchestration across Query API and permitted control-plane operations;
- response shaping and compatibility/versioning;
- audit logging, correlation IDs, rate limiting, and safe diagnostics;
- structured progress for long-running recomputation or connector operations.

### 11.3 Access model

Typical personas shown in the application reference are:

- CTO — broad analytical access;
- VP Engineering — broad analytical access;
- Engineering Manager — normally scoped access;
- Platform Lead — normally scoped analytical and operational access;
- Echo Administrator — configuration and policy access.

These are typical roles, not a final authorisation matrix. Permissions MUST be capability-based and recorded as project policy rather than inferred only from job titles.

### 11.4 API surface by product area

- Overview query orchestration;
- cohort comparison queries;
- dynamic exploration/roll-up queries;
- evidence trace lookup;
- data-health and connector-health queries;
- policy, connector, mapping, and configuration commands;
- recomputation/job status where configuration affects analytics.

### 11.5 Non-goals

- direct SQL or database access from the browser;
- embedding business metric calculations in controllers;
- trusting frontend filters as authorisation boundaries;
- returning stack traces, raw causes, credentials, or sensitive payloads;
- becoming a second analytical store or duplicating the metric engine.

### 11.6 Key failure modes

- stale actor/tenant context;
- over-broad role permissions;
- unbounded analytical queries;
- cache keys missing tenant or policy scope;
- direct storage dependencies leaking into handlers;
- mapping a network failure to an empty successful result;
- older asynchronous responses overwriting newer user state;
- audit logs capturing restricted query data.

### 11.7 Acceptance criteria

- protected calls authenticate and authorise on every operation;
- forbidden cross-tenant and cross-role requests fail safely;
- client-visible responses are typed, versioned, and storage-agnostic;
- failures distinguish successful absence, expected domain failure, and unexpected defect;
- requests carry correlation IDs through Query API and diagnostics;
- rate/query bounds are tested;
- no route directly accesses ClickHouse from browser-facing code;
- the frontend can complete a vertical milestone using only middleware contracts.

---

## 12. Product brief — Echo Frontend

### 12.1 Mission

Help engineering leaders identify what changed, assess whether observed differences are credible, locate where they occur, inspect the underlying evidence, understand data quality, and correct policies or mappings.

### 12.2 Shared navigation context

The following context SHOULD persist across analytical pages:

- time window;
- View by/grouping dimension;
- selected entity;
- application/repository;
- AI tool/provider;
- work type;
- evidence state.

Filters apply to analytical views without becoming authorisation claims.

### 12.3 Product surfaces

#### Overview — “What changed?”

- Default landing page.
- Audience: CTO, VP Engineering, engineering leadership.
- Primary grain: configurable organisation/work/product dimension.
- Shows a consolidated comparison matrix, spend, coverage, delivery, quality, customer outcome where valid, and evidence health.
- Uses attributed measures by default for additive executive views.
- Opens a metric in Compare, drills into Explore, or opens a sample in Live Trace.
- Does not generate an unsupported executive narrative or composite score.

#### Compare — “Is the difference real?”

- Audience: VP Engineering and engineering managers.
- Shows AI-linked versus capture-complete no-AI-observed distributions.
- Exposes sample size, variance/uncertainty, exact difference, time trend, matching method, scope, evidence strength, and maturity.
- Supports cohort filtering and opening an underlying sample in Live Trace.

#### Explore — “Where is it happening?”

- Audience: engineering leadership and managers.
- Supports dynamic roll-ups across the configured organisational graph.
- Enables organisation, team, initiative, product, service, repository, and cost-centre slices where configured.
- Makes owned/contributed and attributed/touched semantics explicit.
- Drills into Live Trace and checks affected data in Data Health.

#### Live Trace — “Why was this classified this way?”

- Audience: engineering managers and platform leads.
- Looks up a ticket, commit, pull request, deployment, or related record.
- Presents the evidence graph, timeline, provenance, link method/confidence, properties, cohort classification, and rule version.
- Supports root-cause investigation for quality incidents without attributing an incident directly to a developer.
- Routes mapping/evidence defects to Data Policy or Data Health.

#### Data Health — “Can we trust this evidence?”

- Audience: platform leads, Echo administrators, engineering operations.
- Shows connector state, event freshness/latency, source completeness, AI-status coverage, identity resolution, linkage coverage, cost reconciliation, mapping health, allocation reconciliation, quarantine, and maturity windows.
- Allows investigation of an issue and navigation to the affected analytical view.

#### Data Policy and Configuration — “How should Echo behave?”

- Audience: Echo administrators, platform administrators, security/governance.
- Manages collector policies, identity visibility, retention, hierarchy/DAG mappings, ownership and allocation rules, connectors, corrections/disputes, and audit history.
- Changes that affect evidence or metrics MUST expose validation and recomputation state.
- Returns to Overview only after the user can distinguish saved configuration from recomputed analytical results.

### 12.4 Typical user journey

```text
Overview: identify change
  -> Compare: validate significance and evidence
  -> Explore: locate affected scope
  -> Live Trace: inspect evidence
  -> Data Health: verify data quality
  -> Data Policy: fix or adjust mappings/policy
  -> Overview: inspect recomputed result
```

This is a typical path, not a forced wizard.

### 12.5 Frontend architecture

- Use the repository's Feature-Sliced Design profile.
- Each bounded-context feature owns `data`, `domain`, and `presentation` layers.
- Presentation uses injected typed per-context clients.
- Components do not import DTOs, raw HTTP clients, or storage representations.
- Shared core remains pure; shared design code does not import feature internals.
- UI state distinguishes idle, loading, success, empty, and error.
- Prevent stale responses, updates after disposal, and hidden network failures.
- Meet applicable WCAG AA, keyboard, semantic, focus, responsive, and localisation requirements.

### 12.6 Non-goals

- local recomputation of authoritative metrics;
- direct storage access;
- employee ranking;
- hiding sample/evidence limitations behind polished charts;
- treating a missing result as zero or “no AI.”

### 12.7 Acceptance criteria

- all six product surfaces use typed middleware clients;
- shared filters persist through expected navigation;
- every analytical result exposes evidence/maturity state;
- empty, loading, failure, stale-response, and insufficient-sample states are testable;
- keyboard and screen-reader semantics cover critical journeys;
- no direct DB/query-store request is made by client code;
- one vertical milestone is demonstrable from event ingestion to rendered evidence.

---

## 13. Cross-component contracts

### 13.1 Contract ownership

- External wire shapes belong to adapters.
- Canonical event schemas belong to versioned shared contracts.
- Domain and port boundaries use validated domain types, not raw DTOs.
- Frontend-facing APIs expose stable view/query contracts, not ClickHouse/PostgreSQL rows.
- Schema compatibility, idempotency, optional fields, and absence/failure semantics MUST be tested.

### 13.2 Error semantics

Expected failures use typed result/error contracts. Distinguish:

- successful absence;
- invalid request;
- unauthenticated or unauthorised;
- not found;
- insufficient evidence/sample;
- stale or immature data;
- dependency unavailable;
- rate limited;
- schema/policy incompatibility;
- unexpected defect.

Do not return `null`, an empty collection, or zero to conceal an operational or evidence failure.

### 13.3 Observability

Long-running operations expose request ID, current phase, actor, target service, elapsed time, deadline, and safe failure classification. Events SHOULD use typed names such as `RequestStarted`, `OperationStarted`, `OperationCompleted`, and `RequestFailed`.

Logs and diagnostics MUST be tenant-scoped, redacted, access-controlled, and free of raw secrets or prohibited endpoint content.

### 13.4 Idempotency and replay

Events, archive writes, analytical projections, configuration commands, and recomputation jobs require stable idempotency semantics appropriate to their boundary. Replaying Kafka or S3 data MUST NOT double-count facts or business effects.

---

## 14. Recommended vertical milestones

Each milestone ends with a repeatable demonstration and includes tests, docs, and observable health.

### Milestone 0 — Monorepo and one-command skeleton

**Demonstration:** clone the repository, run `./scripts/bootstrap.sh`, open the web application, and see health for all four applications and local dependencies.

Deliver:

- independently buildable edge, data platform, middleware, and web skeletons;
- locked dependencies and reproducible commands;
- local infrastructure composition;
- typed health contracts;
- root architecture tests;
- deterministic synthetic seed;
- bootstrap, verify, demo, and teardown instructions.

Do not count static placeholders as later product milestones.

### Milestone 1 — First private canonical event

**Demonstration:** a synthetic or Cursor-derived allowlisted event passes local privacy validation, authenticated admission, Kafka, archive/analytical persistence, middleware, and a frontend ingestion-health view.

Prove:

- prohibited content is rejected locally;
- tenant identity is derived at admission;
- event is durable and idempotent;
- source freshness and last-ingested state are visible.

### Milestone 2 — Work-to-deployment evidence trace

**Demonstration:** a Jira work item links to a GitHub pull request/commit and a GitHub deployment; Live Trace shows nodes, edges, provenance, and missing/conflicted evidence.

Prove:

- work item is a side-link, not a forced causal stage;
- link method, confidence, and rule version are visible;
- replay does not duplicate graph nodes/edges;
- cross-tenant trace lookup fails safely.

### Milestone 3 — Four-cohort classification

**Demonstration:** seeded examples for all four AI evidence cohorts appear in Live Trace and Data Health, with unknown excluded from direct comparison.

Prove:

- classification rule version and supporting evidence are inspectable;
- incomplete capture cannot produce “no AI observed”;
- coverage and unknown rates are visible.

### Milestone 4 — First valid comparison

**Demonstration:** Overview and Compare show one natural-grain metric—recommended initial example: work-item cycle time—between AI-linked and capture-complete no-AI-observed cohorts.

Prove:

- eligible population, samples, window, grain, maturity, and evidence health;
- correct aggregation and small-sample suppression;
- drill-down from comparison to evidence samples.

### Milestone 5 — Production quality linkage

**Demonstration:** Sentry quality signals attach to a GitHub deployment/release window, affect a quality comparison, and can be inspected through Live Trace.

Prove:

- quality is linked to deployment/release exposure, not directly to a developer;
- open versus mature windows are distinct;
- late quality events update results reproducibly.

### Milestone 6 — Configurable organisational slice

**Demonstration:** configure a minimal organisation/product graph, map work to it, select `View by`, and see Overview/Explore recompute with explicit ownership and allocation semantics.

Prove:

- mapping validation and audit history;
- cycle/orphan/conflict handling;
- attributed totals reconcile;
- touched measures are labelled non-additive;
- recomputation status is visible.

### Milestone 7 — Hardening and reproducible evaluation

**Demonstration:** run the full synthetic evaluation pack, replay canonical data, reproduce metrics, and show failure/recovery for a temporarily unavailable analytical store.

Prove:

- privacy fixtures;
- cross-tenant tests;
- correlation accuracy;
- metric reproducibility;
- recovery and replay;
- explicit performance conditions and measured results;
- documented limitations and unresolved decisions.

---

## 15. Definition of done and verification gates

A work item is done only when all applicable items are satisfied:

### Product and evidence

- outcome and user-visible behaviour match the selected vertical milestone;
- confirmed constraints are preserved;
- evidence state, sample, window, and maturity remain visible;
- no prototype result is described as a real customer outcome.

### Architecture

- domain code is framework/infrastructure-free;
- dependencies point inward;
- external concepts are translated by adapters/ACLs;
- ports use domain-language types and explicit result semantics;
- frontend features do not import each other's internals;
- browser-facing code has no direct analytical/control-store access;
- architecture checks include failing fixtures for prohibited imports.

### Security and privacy

- local allowlist boundary is covered by negative fixtures;
- authentication, authorisation, tenant ownership, revocation, and cross-tenant cases are tested;
- secrets and prohibited content are absent from logs, errors, events, and fixtures;
- queries, retries, retention, and buffers are bounded.

### Correctness and reliability

- smart constructors/invariants and expected failures are tested;
- duplicate, retry, timeout, cancellation, replay, and partial-dependency failures are tested where relevant;
- fakes obey production contract semantics;
- migrations and bootstrap are repeatable;
- observability reports phase and recovery action.

### User experience

- loading, empty, insufficient evidence, stale, error, and success states are distinct;
- stale responses cannot replace newer state;
- keyboard, focus, semantic labels, and responsive behaviour are verified;
- traceability from aggregate to evidence is demonstrable.

### Required reporting

The coding assistant or engineer MUST state:

- files/components changed;
- user-visible outcome;
- contracts or migrations changed;
- verification commands actually run and their results;
- tests or checks not run;
- open decisions, limitations, and follow-up risks.

Never claim a command passed if it was not run.

---

## 16. Prompt template for any coding assistant

Copy this template into Claude, Codex, or another coding assistant and replace bracketed fields.

```markdown
You are implementing Difinity Echo in its GitHub monorepo.

Read and follow:
- `AGENTS.md`
- `docs/product-briefs/ECHO_IMPLEMENTATION_PRODUCT_BRIEFS.md`
- relevant repository DDD documents, contracts, ADRs, and tests
- relevant framework documentation pinned in this repository

Task type: [feature / defect / refactor / architecture / test / documentation]
Component(s): [Echo Edge / Core Data Platform / Application Middleware / Frontend / Shared Contracts / Infra]
Vertical milestone: [Milestone number and title]
User-visible outcome: [What a user/operator can demonstrate after completion]

In scope:
- [Concrete behaviour 1]
- [Concrete behaviour 2]
- [Concrete behaviour 3]

Out of scope:
- [Explicit exclusion 1]
- [Explicit exclusion 2]

Required inputs/contracts:
- [Existing source, event, API, schema, or fixture]

Required outputs/contracts:
- [New or changed typed result, event, API, UI state, or evidence]

Acceptance criteria:
1. [Observable criterion]
2. [Evidence/privacy/tenant criterion]
3. [Failure-state criterion]
4. [Test/verification criterion]
5. The end-to-end demonstration remains runnable from a clean checkout.

Non-negotiable constraints:
- Build a vertical, demonstrable slice; do not create disconnected horizontal scaffolding.
- Preserve local allowlist privacy and never transmit prohibited content.
- Unknown AI status must never become non-AI.
- Preserve natural-grain metrics and valid roll-ups.
- Derive tenant context from authenticated boundaries and test cross-tenant denial.
- No browser/client direct database access.
- Use domain types, boundary DTO mapping, explicit Result errors, and tested architecture boundaries.
- Do not invent unresolved business rules. Identify an open decision or create an ADR proposal.
- Keep changes focused and preserve existing contracts unless the task explicitly changes them.

Implementation workflow:
1. Inspect relevant domain docs, contracts, current code, and tests.
2. Restate the affected end-to-end path and identify open decisions.
3. Add or update architecture/contract tests before feature code where a boundary changes.
4. Implement inward-out: domain values/invariants, ports, services, adapters, wiring, presentation.
5. Add tests at the narrowest correct layer plus the milestone demonstration.
6. Run applicable format, lint, typecheck, architecture, unit, integration, contract, build, and end-to-end commands.
7. Report outcomes, commands actually run, anything unverified, and remaining risks.

Do not treat examples or phase labels as proof of implemented functionality. Do not report synthetic or prototype results as customer evidence.
```

---

## 17. Work-item template

Use this structure when generating ClickUp or similar engineering tasks from a component brief.

```markdown
Title: [Component] — [User-observable capability]

Milestone:
[Vertical milestone]

Outcome:
[One demonstrable end-to-end result]

Context:
[Why the result matters and which evidence/product rule it supports]

Scope:
- [Implementation item]
- [Contract/test item]
- [Observability/demo item]

Out of scope:
- [Explicit exclusion]

Dependencies:
- [Contract, source, service, decision, or prerequisite]

Acceptance criteria:
- Given [state], when [action], then [observable result].
- Given [failure/unknown state], when [action], then [safe explicit result].
- Cross-tenant and privacy boundaries remain enforced.
- The vertical demonstration runs from the documented clean-checkout flow.

Verification:
- [Exact repository command]
- [Exact demonstration steps]

Evidence to attach:
- test output;
- screenshot or trace identifier;
- changed contract/ADR link;
- known limitation or follow-up.
```

---

## 18. Open decisions register

Do not bury these decisions inside implementation details:

- exact language/runtime and package boundaries for the three new backend/agent applications;
- local orchestration mechanism used by `bootstrap.sh`;
- minimum dimension families and relationship types for v1;
- permitted DAG behaviour, versioning, and cycle rules;
- default ownership, contribution, and cost-allocation policy;
- whether non-financial facts may be fractionally allocated;
- primary Overview metric for each analytical family;
- minimum coverage/sample/maturity before comparisons appear;
- identity pseudonymity and individual-view restrictions;
- formal throughput, latency, retention, and recovery targets;
- production-shaped ClickHouse benchmark thresholds;
- commercially offered isolation/deployment tiers;
- first real design-partner integration stack.

Resolve consequential choices with an ADR containing context, decision, alternatives, consequences, affected contracts, verification, and any narrow exception.

---

## 19. Source baseline

This implementation brief consolidates the project references registered in `AGENTS.md`:

- Difinity Echo consolidated product and architecture brief;
- Difinity Architecture & Coding Standard v3;
- Difinity Echo consolidated FYP report;
- Whiteboard 01 — system and integration architecture;
- Whiteboard 02 — pages and domain-data routing;
- Whiteboard 03 — application page-to-page interaction.

Where sources differ, preserve the written product/coding rules, the PDF's FYP-specific constraints, and the whiteboards' architectural intent. Surface unresolved conflict instead of choosing silently.
