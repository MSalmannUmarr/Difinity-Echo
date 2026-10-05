# ADR 0002 — Move the existing Echo frontend into `apps/web`

- **Status:** Accepted for Milestone 0 (ClickUp M0-08); open to review by Division 3
- **Date:** 2026-10-05

## Context

The Echo Next.js prototype lived at the root of the reference workspace
(`FYP/fyp`): `app/`, `components/`, `hooks/`, `lib/`, `public/`, `src/`,
`tests/` and its configuration. Most of it was uncommitted work in that
workspace. The target monorepo places the web application in `apps/web`, and
the root of the repository becomes the pnpm workspace root.

The migration had to preserve routes, styling, tests and dependency versions,
avoid two authoritative copies, and avoid an unrelated frontend rewrite.

## Decision

Move the frontend **as one unit** into `apps/web` in the initial commit of
the official repository, keeping its internal layout unchanged:

- All paths stay relative to the application root, so the `@/*` alias
  (`apps/web/tsconfig.json`), `components.json`, `app/globals.css`, ESLint,
  PostCSS, Prettier and Vitest configuration work without code changes.
- The lockfile importer was renamed from `.` to `apps/web`, so every frontend
  dependency resolves to exactly the same version as before (verified by
  comparing the importer sections).
- The package was renamed `@difinity-echo/web`; `packageManager` moved to the
  workspace root; `engines.node` is pinned to `24.19.0`.
- One additive change: `app/api/health/live/route.ts` reports liveness using
  the shared observability contract so `scripts/demo.sh` can check all four
  applications the same way. No page, component or style was changed.
- The FYP workspace is not modified. It remains a read-only reference backup.

Git history of the reference workspace is **not** carried over: it contained a
single "initial commit", most of the frontend was uncommitted there, and the
instructions forbid copying its `.git` directory. History begins in this repository.

## Verification

Before and after the move, from a clean install with Node 24.19.0 and pnpm 11.19.0:

| Check          | Reference workspace                                                          | `apps/web`                           |
| -------------- | ---------------------------------------------------------------------------- | ------------------------------------ |
| `eslint`       | pass                                                                         | pass                                 |
| `tsc --noEmit` | pass                                                                         | pass                                 |
| `vitest run`   | 6 tests pass                                                                 | 6 tests pass                         |
| `next build`   | `/`, `/compare`, `/configuration`, `/data-health`, `/explore`, `/live-trace` | same routes, plus `/api/health/live` |

The repository architecture tests additionally enforce the Feature-Sliced
Design rules for `apps/web/src`.

## Known follow-ups (not done here, to keep the move focused)

- **Formatting:** 104 frontend files were not Prettier-clean before the move.
  `apps/web` is excluded from the root formatting gate until a dedicated
  formatting-only change runs `pnpm --filter @difinity-echo/web format`.
- **`@types/node`:** the frontend pins `@types/node@^20`, which does not satisfy
  Vitest 5's peer range (`^22 || >=24`). This warning existed before the move.
- **Demo data:** the frontend still uses in-memory mock clients with
  illustrative data. Replacing them with typed middleware clients is milestone
  work (M1-13 onwards), not part of this move.
- **Health UI:** showing aggregate service health inside the web UI
  (ClickUp M0-12) needs a middleware health-aggregation contract and is left
  for the next Milestone 0 task.

## Alternatives considered

- _Leave the frontend at the repository root and document a later move._
  Rejected: the root would be both workspace root and Next.js application,
  so root lint, type-check and build scripts would mix the frontend with the
  other applications and blur the independent-build boundary.
- _Copy the frontend into `apps/web` and keep the original too._ Rejected:
  two authoritative frontends.
