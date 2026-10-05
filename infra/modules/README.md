# Infrastructure modules

Reserved for reusable, provider-portable infrastructure-as-code modules
(network, Kafka, ClickHouse, PostgreSQL, object storage, OCI workloads),
as described in the Difinity standard §10.

**Status:** intentionally empty. Milestone 0 defines local development
infrastructure only (`infra/local`). The IaC tool (for example Terraform,
Pulumi or Helm charts) and the target environments are open decisions that
require an ADR before modules are added.

Rules that apply when modules are added:

- IaC never lives in, or is imported by, application `core`, `domain` or `app` code.
- Applications consume typed configuration and brokered credentials, never IaC files.
- The portable contracts (Kafka, ClickHouse SQL, PostgreSQL, S3 API, Parquet,
  OCI images, Helm, OIDC/SAML) take precedence over provider-specific services.
