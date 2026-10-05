# Echo Web (`@difinity-echo/web`)

**Owner:** Division 3 — Application & Frontend ·
**Brief:** [implementation brief §12](../../docs/product-briefs/ECHO_IMPLEMENTATION_PRODUCT_BRIEFS.md#12-product-brief--echo-frontend) ·
**Design:** [`DESIGN.md`](../../DESIGN.md)

Next.js 16 / React 19 application for the six Echo surfaces: Overview,
Compare, Explore, Live Trace, Data Health and Data Policy/Configuration.

## Status

The existing high-fidelity prototype, moved here unchanged from the reference
workspace (see [ADR 0002](../../docs/adr/0002-frontend-location-in-apps-web.md)).
Pages use **in-memory mock clients with illustrative data — not customer
results**. Milestone 0 added only `GET /api/health/live` for the demo.

## Boundaries

- Feature-Sliced Design: `src/features/<context>/{data,domain,presentation}`,
  `src/shared/{core,design}`, composition in `src/app` and Next.js `app/` routes.
- Features never import each other; `domain/` and `shared/core` stay pure
  (enforced by `tests/architecture.test.ts` here and the repository
  architecture suite).
- The browser and web server talk only to the Application Middleware — never
  to Kafka, ClickHouse, PostgreSQL or object storage.

This Next.js version has breaking changes from older releases: read
`node_modules/next/dist/docs/` before changing framework code (see `AGENTS.md`).

## Commands

```bash
pnpm --filter @difinity-echo/web dev     # http://localhost:3000
pnpm --filter @difinity-echo/web lint
pnpm --filter @difinity-echo/web typecheck
pnpm --filter @difinity-echo/web test
pnpm --filter @difinity-echo/web build
```
