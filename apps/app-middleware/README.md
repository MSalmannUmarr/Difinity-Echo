# Application Middleware (`@difinity-echo/app-middleware`)

**Owner:** Division 3 — Application & Frontend ·
**Brief:** [implementation brief §11](../../docs/product-briefs/ECHO_IMPLEMENTATION_PRODUCT_BRIEFS.md#11-product-brief--application-middleware)

The secure backend for Echo user interactions: authentication, immutable
actor/tenant context, capability-based authorisation, request validation,
Query API orchestration and stable frontend-facing responses.
**It never accesses a database, Kafka or object storage** — the tenant-aware
Query API is its only data source (enforced by architecture and manifest tests).

## Status: Milestone 0 skeleton

Implemented:

- health and readiness; readiness **requires** the Query API and is derived
  over HTTP from the Data Platform's published readiness contract (validated
  with the shared JSON Schema before use);
- `ActorContext` (immutable, branded `ActorId`/`TenantId`/`Capability`) and a
  capability check;
- an `Authenticator` port with a **fail-closed** adapter: every authentication
  attempt is rejected until an identity provider is chosen;
- typed failure → safe HTTP error mapping (401/403/502/503 with correlation id,
  never raw causes).

**Not implemented:** SSO/browser authentication, protected routes, query
endpoints, rate limiting and audit logging. No capability names or role
matrix are defined — that remains an open decision (brief §11.3).

## Boundaries

| Boundary                                | Location                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Authentication                          | `src/core/ports/out/authenticator.ts`, `src/app/adapters/outbound/unconfigured-authenticator.ts` |
| Immutable actor/tenant context          | `src/core/domain/actor-context.ts`                                                               |
| Authorisation                           | `src/core/domain/authorization.ts`                                                               |
| Query API client                        | `src/core/ports/out/query-api-client.ts`, `src/app/adapters/outbound/http-query-api-client.ts`   |
| Request validation and response mapping | `@difinity-echo/contracts` validators, `src/app/adapters/inbound/http/response-mapping.ts`       |
| Health/readiness                        | `src/core/services/*`, `src/app/adapters/inbound/http/health-http-server.ts`                     |

## Commands

```bash
pnpm --filter @difinity-echo/app-middleware... build
pnpm --filter @difinity-echo/app-middleware test
pnpm --filter @difinity-echo/app-middleware start  # http://127.0.0.1:4000/health/ready
```

Configuration: [`.env.example`](.env.example). `APP_MIDDLEWARE_QUERY_API_URL` is required.
