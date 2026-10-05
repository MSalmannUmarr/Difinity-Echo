# Echo Edge (`@difinity-echo/edge-agent`)

**Owner:** Division 1 — Edge & Integrations ·
**Brief:** [implementation brief §9](../../docs/product-briefs/ECHO_IMPLEMENTATION_PRODUCT_BRIEFS.md#9-product-brief--echo-edge--local-agent)

Developer-machine collector. Its mission is to collect, sanitise, normalise,
correlate and reliably transmit **content-free** AI engineering telemetry
without letting prohibited content cross the local trust boundary.

## Status: Milestone 0 skeleton

Implemented: typed configuration, health (`GET /health/live`) and readiness
(`GET /health/ready`) using the shared observability contract, unit tests and
architecture rules. **No collection, privacy filtering, normalisation,
provenance, buffering or admission is implemented.** Readiness lists each of
those boundaries as `not-implemented`; it never reports them as ready.

## Boundaries

| Boundary                | Responsibility                                                                                                            | Planned home                                   | Milestone |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | --------- |
| Vendor adapters         | Translate Cursor (first), later Claude Code/Codex/Copilot hooks into internal events; vendor DTOs stay inside the adapter | `src/app/adapters/inbound/<vendor>`            | M1-03     |
| Local privacy allowlist | Remove/reject prohibited content **before** any outbound queue or disk write                                              | `src/core/domain` policy + `src/core/services` | M1-02     |
| Canonical normalisation | Map allowlisted fields to the versioned canonical event (`packages/contracts`)                                            | `src/core/services`                            | M1-03     |
| Git provenance          | Attach repository/commit/PR/work-key references, never diffs, paths or raw branch names                                   | driven port + `src/app/adapters/outbound/git`  | M1-04     |
| Durable buffer          | Encrypted, bounded, restart-safe queue of approved events                                                                 | driven port + outbound adapter                 | M1-05     |
| Admission client        | Authenticated, idempotent delivery to Data Platform admission                                                             | driven port + HTTP adapter                     | M1-14     |
| Health/readiness        | Safe local health without raw content                                                                                     | implemented                                    | M0        |

## Non-goals

Transmitting prompts, responses, code, diffs, paths, commands, secrets or
transcripts; deciding final AI contribution or metrics; writing to Kafka or
any database directly (enforced by the architecture tests); ranking developers.

## Layout

```text
src/core/domain      pure domain concepts (boundary catalogue)
src/core/ports       driving (in) and driven (out) ports
src/core/services    use cases (liveness, readiness)
src/app/adapters     HTTP inbound adapter; clock and boundary probes outbound
src/app/config       typed configuration parsed once
src/app/container    composition root
src/app/main         process entry point (only place reading process.env)
```

## Commands

```bash
pnpm --filter @difinity-echo/edge-agent... build   # build with its package dependencies
pnpm --filter @difinity-echo/edge-agent test
pnpm --filter @difinity-echo/edge-agent start      # http://127.0.0.1:4200/health/ready
```

Configuration: [`.env.example`](.env.example) (`EDGE_AGENT_HOST`, `EDGE_AGENT_PORT`).
