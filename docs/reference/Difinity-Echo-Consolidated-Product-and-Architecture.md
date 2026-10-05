---
id: 01M1CPJ0CRMD266NP6DJ6JESYA
captured: 2026-08-31T10:23:52Z
via: mcp:capture_to_raw
content_sha256: 88709284f26100cf7a7556574b8754be37febadaec8ac154821d57b10f33aa02
---

# Difinity Echo - Consolidated product and architecture meeting brief

Date: 2026-08-31
Status: Current consolidated working brief
Audience: Difinity product, engineering and prospective design-partner discussions
Purpose: Provide one meeting-ready view of what Echo is, how it works, what has been decided and what remains unresolved.

> This document consolidates the current Echo product definition, measurement model, information architecture, connector scope, collection/privacy design and cloud architecture. It is a working source for discussion, not evidence of a production product or validated customer results.

## 1. Product definition

Echo is Difinity's continuous AI engineering analytics platform.

It connects AI usage and spend with engineering work, delivery performance, software quality, support demand and product outcomes. It is intended for CTOs, VP Engineering and Heads of Engineering who need to understand whether AI-assisted engineering work is performing differently from comparable work where no AI contribution was observed.

ROI is the marketing promise. The product is an analytics platform that makes the underlying spend, delivery, quality and outcome evidence visible.

### Approved messaging

**Primary headline**

> See how AI changes delivery speed, software quality and product outcomes.

**Supporting message**

> Every AI-assisted change leaves an echo across engineering. Echo shows where it improves delivery, where it creates rework and what reaches the customer.

**ROI promise**

> Make the real ROI of engineering AI visible.

### Relationship to Difinity Hub and Flow

- **Difinity Hub** is the governance and configuration layer.
- **Difinity Flow** is the runtime gateway and enforcement layer.
- **Echo** is the continuous analytics layer.

Echo should work as a standalone product. Hub and Flow events can enrich Echo when those products are present.

## 2. Primary buyer and user problem

The primary buyer is a CTO, VP Engineering or Head of Engineering responsible for AI adoption, engineering performance, delivery and quality.

The core problem is not whether developers are using AI. Most organisations can obtain basic adoption or token statistics from providers.

The harder questions are:

- What are we spending on AI?
- Where is AI being used?
- Is AI-linked work moving through engineering differently from comparable non-AI work?
- Is faster delivery accompanied by more review effort, defects, incidents or customer support demand?
- Which products, initiatives, applications or organisational units account for the spend and outcomes?
- Can the underlying records be inspected and trusted?
- Where is the evidence incomplete?

## 3. What Echo is and is not

### Echo is

- A continuous AI engineering analytics platform
- A comparison system for AI-linked and capture-complete no-AI-observed work
- A configurable analytical layer across engineering systems of record
- A traceable evidence graph behind every aggregate metric
- A data-health system for coverage, freshness, identity and linkage quality
- A quality-adjusted view of engineering performance
- A platform that can run as SaaS, customer cloud or private infrastructure

### Echo is not

- A board-meeting or investment-approval tool
- A one-off ROI review
- A consultancy report
- A generic cost dashboard
- A generic observability platform
- A replacement for Jira, Linear, GitHub, Bitbucket, Sentry, Zendesk, Intercom, Amplitude or PostHog
- A developer-ranking or employee-surveillance product
- A system that calls activity counts productivity
- A system that treats lineage as proof of causality
- A product that reduces engineering performance to one magic score

## 4. The three-layer product problem

Echo must solve three separate layers.

### Layer 1: Capture and organise

Capture a stable set of canonical evidence facts, then organise them through customer-configured dimensions and relationships.

### Layer 2: Aggregate and compare

Compute every metric at its valid natural grain and recompute roll-ups from eligible underlying facts.

### Layer 3: Summarise

Present a compact comparison of investment, adoption, delivery, quality, customer outcomes and evidence without producing a separate dashboard for every metric or hiding everything behind a composite score.

## 5. Canonical evidence model

Customers can configure how information is organised, but they do not redefine Echo's core facts.

Canonical facts include:

- AI session
- developer interaction
- AI usage and cost event
- accepted edit or change set
- commit
- pull request
- work item
- build and artifact
- deployment or release
- quality signal
- support signal
- product or customer outcome measurement

The evidence chain is many-to-many rather than a single linear pipeline:

    AI activity -> accepted edit or change set -> commit -> pull request
    pull request <-> work item
    work item <-> product, initiative or other configured entity
    commit -> build -> artifact -> production deployment
    deployment -> quality, support and product outcome windows
    cost and contribution evidence attach at their valid points

A work item is a side-link to code and delivery evidence. It is not a causal stage between AI activity and code.

## 6. Customer-configured dimensional graph

Echo must not hardcode:

    Company -> Organisation -> Team -> Initiative -> Epic -> Ticket

Different companies organise people, work, products and budgets differently. Initiatives can span organisations, organisations can contribute to multiple initiatives, and teams may own tickets, epics, initiatives, services or products.

### Initial dimension families

| Dimension family | Example customer-defined levels |
|---|---|
| Organisation | Company, business unit, division, department, tribe, squad, team |
| Work | Portfolio, program, initiative, workstream, epic, feature, ticket |
| Product | Product, application, service, component, repository |
| Financial | Cost centre, budget, contract, vendor |
| People | Role, location, employment type, individual |

These are templates, not mandatory names or levels.

### Example customer configurations

**Customer A**

- Company -> Engineering organisation -> Team
- Portfolio -> Initiative -> Epic -> Ticket
- Team owns tickets

**Customer B**

- Company -> Division -> Tribe -> Squad
- Program -> Workstream -> Initiative
- Squad owns initiatives

**Customer C**

- Company -> Product group -> Team
- Product -> Service -> Component
- Team owns services
- Tickets map directly to products

### Relationship semantics

Cross-hierarchy relationships are explicit, many-to-many where required and effective-dated.

Initial relationship types:

- contains
- owns
- contributes to
- belongs to
- delivers
- operates
- funded by
- affects

Each relationship records its source, role, effective period, mapping method, evidence state, rule version and optional allocation weight.

### Configuration experience

Echo should provide templates and import/mapping workflows rather than a blank graph builder.

Likely configuration sources:

- HRIS or directory data
- Jira or Linear
- GitHub or Bitbucket
- service catalogues and CODEOWNERS
- financial and procurement systems
- manual overrides with audit history

The product must detect cycles, orphan entities, unresolved mappings, conflicting ownership and allocation weights that do not reconcile.

## 7. Measurement and aggregation contract

### AI evidence cohorts

Echo keeps four cohorts distinct:

1. **AI-linked work**: direct or manually confirmed evidence connects AI activity to a shipped change.
2. **AI-exposed only**: an AI session occurred near the work, but contribution was not established.
3. **No AI observed, capture-complete**: telemetry was healthy and no qualifying AI contribution was observed. This is the valid comparator.
4. **AI status unknown**: collection or linkage was incomplete. Excluded from comparisons.

Unknown work must never be silently treated as non-AI work.

### Natural metric grains

| Metric family | Natural unit |
|---|---|
| Session duration, interaction intensity and tool use | AI session |
| AI spend | Cost event |
| Review time and review rework | Pull request |
| Work cycle time | Work item |
| Change failure and rollback rate | Deployment |
| Escaped defects and incidents | Mature release window |
| Support rate | Feature or release-exposed customer cohort |
| Product or customer outcome | Declared feature, product, initiative or exposure unit |

### Required metric definition

Every metric declares:

- natural grain
- eligible population
- numerator and denominator or mergeable distribution
- selected AI cohort
- comparison cohort
- reporting and observation windows
- permitted group-by dimensions
- deduplication key
- allocation treatment
- minimum sample threshold
- maturity requirement
- evidence state and limitations

### Roll-up rules

- Recompute rates from underlying numerators and denominators.
- Recompute medians and percentiles from eligible observations or mergeable distribution sketches.
- Never average child-level medians.
- Never average child-level AI-versus-non-AI differences.
- Deduplicate company totals from underlying fact IDs.
- Suppress small or incomplete cohorts.
- Recompute comparisons at the selected organisational, work or product scope.
- Always expose denominator, window, maturity and evidence health.

## 8. Ownership, contribution and overlapping work

Every analytical view needs explicit scope semantics:

- owned work
- contributed work
- all involvement
- intersection of selected dimensions

Examples:

- View by Organisation shows each organisation across work it owns or contributes to.
- Filter to Payments and View by Initiative shows initiatives Payments contributes to.
- Select an initiative and group by Team to show participating teams.
- Select both an organisation and initiative to show their intersection.

### Attributed versus touched

**Attributed measures** fractionally allocate spend or facts so totals reconcile.

**Touched measures** show the full event or spend against every related entity. They are useful for investigation but are non-additive.

Potential allocation policies:

- primary owner
- explicit percentage
- proportional contribution
- equal split
- unallocated

Echo must never silently choose an allocation policy. The default executive view should use attributed measures. Touched measures must be labelled non-additive.

## 9. Dashboard information architecture

The current HTML is an illustrative design prototype. Its existing KPI strip and aligned time-series view are not the final product information architecture.

### 9.1 Overview

The default page provides a configurable **View by** selector:

- Organisation
- Team
- Initiative
- Product
- Application or service
- Cost centre
- any other tenant-defined level

Filters remain independent:

- time window
- any configured hierarchy level
- application or repository
- AI tool or provider
- work type
- evidence state

### Consolidated comparison matrix

The overview should use one comparison matrix rather than a separate full table for every metric.

Recommended columns:

| Column | Overview treatment |
|---|---|
| Entity | Current group-by member |
| AI spend | Attributed spend |
| AI coverage | Eligible work with qualifying AI-linked contribution |
| Delivery | Compact AI-linked versus no-AI-observed paired comparison |
| Quality | Compact AI-linked versus no-AI-observed paired comparison |
| Customer outcome | Valid declared comparison where available |
| Evidence | Coverage, maturity and sample status |

Each analytical family has one configurable primary metric:

- Investment: attributed AI spend
- Adoption: AI-linked share of eligible shipped work
- Delivery: initially work-item cycle time
- Quality: initially escaped-defect rate
- Customer: declared outcome or support rate where valid
- Evidence: linkage coverage and maturity

Users can change the primary metric within a family. For example, Delivery can switch among work-item cycle time, review time, change lead time and deployment frequency.

No generated executive narrative is required. No composite productivity or ROI score is required.

### 9.2 Compare

A deeper cohort-comparison page shows:

- AI-linked and no-AI-observed distributions
- exact values and differences
- matched-cohort method
- sample size
- time trend
- uncertainty or evidence strength
- owned versus contributed scope
- attributed versus touched treatment

### 9.3 Explore

Drill into any configured organisation, team, initiative, product, service, application, cost centre or intersection.

### 9.4 Live Trace

Search by ticket, pull request or deployment and inspect the connected AI, work, release, quality, support and outcome evidence.

Every edge shows whether it is direct, confirmed, inferred, conflicted or missing.

### 9.5 Data Health

Data Health covers:

- connector status and freshness
- event-to-query latency
- source completeness
- AI-status coverage
- identity resolution
- per-edge linkage coverage
- cost reconciliation
- hierarchy mapping health
- ownership conflicts
- allocation reconciliation
- orphan entities
- mature versus open quality and outcome windows

### 9.6 Data Policy and Configuration

Controls:

- collector policy
- identity visibility
- roles and access
- retention
- individual-level reporting policy
- hierarchy and relationship configuration
- mapping and allocation rules
- correction and dispute history
- audit trail

## 10. Core metric catalogue

### Investment and adoption

- Total AI spend by cost class
- Spend per active developer
- Spend by tool, provider, product, organisation and configured work entity
- AI-active developers
- AI-linked share of eligible shipped work
- Unallocated licence and usage cost

### Developer and session diagnostics

- Mean and median session duration
- Mean and median interaction intensity
- Human messages per session
- Agent tool actions per human message
- Autonomous execution duration where available
- Model, tool, harness and permission-mode usage

These are diagnostic usage measures, not productivity scores.

### Delivery

- Work-item cycle time
- Change lead time
- Branch creation to pull-request open
- Review request to approval or merge
- Review rounds
- Additional commits after review
- Deployment frequency per service-week
- Feature or initiative idea-to-release time

### Quality

- Escaped-defect rate
- Change-failure rate
- Rollback, revert and hotfix rate
- Incidents by severity
- Mean time to recovery
- Review comments and post-review churn
- New high or critical security findings
- CI failure and rerun rate
- Post-release error-budget burn

### Support and customer outcomes

- Support cases per 1,000 exposed accounts
- Affected accounts and product areas
- Feature adoption
- Task completion
- Conversion
- Retention
- Reliability
- Customer-declared initiative or product metric

Customer outcomes attach to the valid feature, product, release or initiative exposure unit. They must not be attributed directly to one developer or PR without the required mapping.

## 11. Cost and ROI treatment

Keep these cost classes separate:

- provider-metered usage
- invoiced licence cost
- allocated licence cost
- estimated or modelled cost
- implementation and enablement cost where included
- infrastructure and verification cost where included

Costs must reconcile to the in-scope source ledger. Every allocation displays its basis.

Linked cost is not ROI.

Echo may present supported ROI only when:

- spend is measured or transparently allocated
- delivery linkage is sufficiently complete
- quality and outcome windows are mature
- AI contribution uses a declared analytical method
- the customer validates the financial or operational value treatment

Otherwise Echo shows the appropriate status, such as Supported association, Provisional, Unmeasured or ROI unavailable. Missing evidence is not negative evidence.

## 12. Initial integration stack

The connector set is an 80/20 product-value choice, not a claim of universal market coverage.

| Domain | Initial connectors |
|---|---|
| AI coding | Claude Code, OpenAI Codex, GitHub Copilot, Cursor |
| Work tracking | Jira Cloud, Linear |
| Source control | GitHub Cloud, Bitbucket Cloud |
| Deployment | GitHub Actions and Deployments, Bitbucket Pipelines and Deployments |
| Production quality | Sentry Cloud |
| Customer support | Zendesk Support, Intercom |
| Product outcomes | Amplitude, PostHog |

A signed provider-neutral deployment-event API should exist from the start for Jenkins, CircleCI, Argo CD, Buildkite, Vercel and other deployment systems.

A successful build or merged pull request is never proof of production deployment.

### Coherent starting stacks

1. Jira -> GitHub -> GitHub Actions and Deployments -> Sentry -> Zendesk -> Amplitude
2. Linear -> GitHub -> GitHub Actions and Deployments -> Sentry -> Intercom -> PostHog
3. Jira -> Bitbucket -> Bitbucket Pipelines and Deployments -> Sentry -> Zendesk -> Amplitude

The exact first build should follow the first funded design partner's stack.

## 13. Endpoint collection and privacy

### Initial collection products

First-class adapters:

1. Claude Code
2. OpenAI Codex
3. GitHub Copilot
4. Cursor

The architecture remains vendor-neutral. Native fields map into one canonical content-free event model.

### Collection path

    Vendor hooks, OTel and administration APIs
        -> vendor adapter
        -> local allowlist privacy processor
        -> session and event normaliser
        -> local Git provenance linker
        -> encrypted durable buffer
        -> Echo ingestion API
        -> evidence graph and analytics

Endpoint telemetry and provider administration data are complementary:

- endpoints provide session, tool, permission and change context
- provider APIs provide usage, seat, credit and spend reconciliation
- Git and source-control connectors establish commits and pull requests
- downstream connectors establish delivery, quality, support and product outcomes

### Intended metadata

- pseudonymous customer-controlled identity
- provider, tool, model and agent
- session and turn identifiers
- timestamps and duration
- token and cost metadata
- tool category, outcome and duration
- permission mode and decision metadata
- repository, commit and pull-request references
- collector version, schema version and health
- link method, confidence and rule version

### Default prohibited outbound data

- prompts and responses
- reasoning or thought content
- source code and raw diffs
- raw file paths
- raw branch names beyond a locally extracted work key
- raw commands
- tool arguments and results
- error-message text
- secrets and environment-variable values
- clipboard data
- screenshots
- keystrokes
- full transcripts

Sanitisation occurs locally before queue or disk persistence of outbound events. No vendor should send native content-bearing payloads directly to Echo Cloud.

## 14. Cloud ingestion and analytical architecture

### Working decision

Echo uses:

- Kafka as the durable event log and decoupling layer
- ClickHouse as the hot analytical store
- S3 or qualified S3-compatible storage as the canonical archive
- PostgreSQL as the mutable control plane

Kafka is retained for scalability, replay, burst absorption and failure isolation. It does not require every metric to update in seconds.

ClickHouse is selected for high-cardinality analytics, traces, cohorts, percentiles and interactive dashboards. It has not yet been benchmarked with production Echo data.

PostgreSQL stores tenants, users, roles, enrollments, connector configuration, retention, identity mappings, job state and audit metadata. It is not the primary event warehouse.

### Event flow

    Echo Edge and server-side connectors
        -> regional authenticated admission API
        -> Kafka event log
        -> ClickHouse writer
        -> ClickHouse hot analytics
        -> tenant-aware Query API
        -> Overview, Compare, Explore, Trace and Data Health

    Kafka
        -> archive writer
        -> S3-compatible canonical archive
        -> replay and recomputation
        -> ClickHouse

    PostgreSQL control plane
        -> admission, policy and query services

### Freshness position

Echo processes continuously and uses near-real-time data where supported.

True second-level freshness is not the product promise. Every source and metric exposes:

- event watermark
- source freshness
- maturity state
- late-event behaviour
- observation window

A result available after minutes or hours can still satisfy the CTO use case.

## 15. Tenant isolation and deployment models

### Standard SaaS

- bounded regional cells
- tenancy derived from authenticated enrollment or connector credentials
- tenant on every fact, relationship, aggregate, cache and object
- tenant-aware joins
- tenant-specific read-only ClickHouse identities and row policies
- forced PostgreSQL row-level security
- no direct browser or BI access to ClickHouse
- cross-tenant negative testing
- per-tenant quotas and bounded blast radius

ClickHouse row policies are defence in depth, not a physical write boundary.

### Dedicated enterprise

Customers requiring stronger separation receive dedicated account, network, Kafka, ClickHouse, object storage, PostgreSQL, keys, secrets and backups.

A database or schema in a shared cluster must not be described as full physical isolation.

### Deployment portability

The same logical data plane should support:

- Difinity SaaS on AWS
- customer-owned AWS account
- connected private data centre
- air-gapped environment

Core portable contracts:

- Kafka
- ClickHouse SQL
- PostgreSQL
- S3 API
- Parquet
- OCI images
- Helm
- OIDC or SAML

AWS-specific services may implement these contracts but must not become authoritative domain dependencies.

## 16. Delivery sequence

Working recommendation:

1. Canonical schema, privacy registries and test harness
2. Minimal Claude, Codex, Copilot and Cursor adapters
3. Local Git provenance and cloud ingestion
4. Provider cost and identity reconciliation
5. One end-to-end customer stack using Jira or Linear plus GitHub and GitHub Deployments
6. Live Trace and Data Health
7. Configurable dimensional graph and mapping health
8. Overview comparison matrix
9. Sentry plus Zendesk or Intercom
10. Amplitude or PostHog
11. Bitbucket path
12. Advanced effect analysis and additional connectors based on paid demand

This is not a fixed release commitment. A funded design partner should determine the exact first stack.

## 17. Confirmed decisions

- Product name: Echo, with exact brand lockup still open
- Category: continuous or real-time AI engineering analytics
- ROI is the marketing promise, not a board or investment-approval workflow
- Echo is standalone and may be enriched by Hub and Flow
- First AI collection products: Claude Code, Codex, Copilot and Cursor
- Initial connector families and coherent starting stacks are selected
- Default collection is metadata-only with a local allowlist privacy boundary
- Four AI evidence cohorts remain distinct
- Kafka remains in the architecture for scalability and resilience
- ClickHouse is the preferred hot analytical store
- S3-compatible storage is the canonical archive
- PostgreSQL is the control plane
- SaaS, customer-cloud and private deployment are product requirements
- Current prototype data and interfaces are illustrative

## 18. Current working product directions

- Customer-configured dimensional graph rather than a fixed organisation/work hierarchy
- Natural-grain metric engine with valid roll-up contracts
- Explicit owned, contributed, attributed and touched semantics
- Overview organised around a consolidated comparison matrix
- Configurable primary metric for each analytical family
- Session and developer behaviour treated as diagnostic drill-down
- No generated executive narrative and no composite magic score
- Overview, Compare, Explore, Live Trace, Data Health and Data Policy/Configuration as the working information architecture

These have not been implemented or validated with a customer.

## 19. Decisions required next

### Product and information model

1. Minimum dimension families and relationship types for v1
2. Tree versus DAG rules, versioning and cycle prevention
3. Source systems that seed hierarchy configuration
4. Ownership and contribution semantics
5. Default attributed-spend allocation policy
6. Whether non-cost facts can be fractionally allocated
7. Primary Overview metric for each analytical family
8. Customer-outcome summary across heterogeneous initiatives
9. Individual visibility and whether it is a primary view or restricted drill-down
10. Mapping correction and dispute workflow
11. Minimum evidence coverage before comparisons are published

### Technical and commercial

12. First funded design partner and coherent stack
13. Exact latency, scale and retention targets
14. ClickHouse production-shaped benchmark
15. Tenant isolation tiering and deployment packaging
16. Default identity and pseudonymity policy
17. Pricing and packaging
18. Exact brand lockup and trademark/domain clearance
19. Whether Echo becomes a formal third product beside Hub and Flow

## 20. Meeting focus

The most useful meeting outcomes would be:

1. Confirm whether the configurable dimensional graph is the correct core information model.
2. Choose the minimum hierarchy and relationship configuration required for a design-partner pilot.
3. Agree on the first Overview comparison families and primary metrics.
4. Decide the default owned/contributed and attributed/touched semantics.
5. Identify one coherent customer stack and one real initiative or product area for an end-to-end pilot.
6. Confirm which open questions must be validated with CTOs before further implementation.

## 21. Evidence and validation status

- No customer outcome is represented by the prototype.
- No Echo endpoint collector is production-proven.
- No complete end-to-end connector stack has been validated with a customer.
- No production-scale ClickHouse benchmark exists for Echo-shaped data.
- No SaaS, customer-cloud, private or air-gapped deployment has been proven.
- The product category and information architecture still require buyer validation.
- The dimensional graph and comparison matrix are current working directions, not finished product decisions.
- Prototype numbers must never be represented as customer results.

## Related detailed notes

- [[Echo - Difinity_s new product idea]]
- [[2026-08-31 Echo product information model and dashboard aggregation update]]
- [[Difinity echo - Tech spec for collection agent]]
- [[Difinity echo - Tech spec for collection agent - Property contract and privacy boundary]]
- [[Difinity echo - Technical architecture for cloud ingestion]]
- [[Difinity Echo - design prototype]]
