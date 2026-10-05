# Architecture decision records

Consequential decisions follow the format in the
[Difinity standard §14.2](../reference/Difinity-Architecture-and-Coding-Standard-v3.md#142-record-consequential-architecture-decisions):
context, decision, alternatives, consequences, contracts and verification,
and any narrow exception.

| ADR                                           | Title                                                                       | Status                                          |
| --------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------- |
| [0001](0001-typescript-node-pnpm-monorepo.md) | TypeScript/Node.js pnpm monorepo with contract-first application boundaries | Proposed (needs three-division approval, M0-01) |
| [0002](0002-frontend-location-in-apps-web.md) | Move the existing Echo frontend into `apps/web`                             | Accepted for Milestone 0                        |

Number new records sequentially (`0003-short-title.md`). A proposed record is
not an accepted design; supersede rather than edit accepted records when
assumptions change.
