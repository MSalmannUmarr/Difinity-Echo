# Cross-workspace tests

Each workspace runs its own unit tests (`pnpm -r run test`). This directory
holds the suites that span workspaces:

| Suite                           | Command                                               | What it proves                                                                                                                    |
| ------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [`architecture/`](architecture) | `pnpm test:architecture`                              | Dependency laws for every application and package, with positive and negative fixture repositories under `architecture/fixtures/` |
| [`contracts/`](contracts)       | `pnpm test:contracts`                                 | Every published JSON Schema against the shared synthetic fixtures in `packages/test-fixtures`, plus compatibility rules           |
| [`end-to-end/`](end-to-end)     | `ECHO_E2E=1 pnpm test:e2e` (run by `scripts/demo.sh`) | Health/readiness of the running Milestone 0 stack; skipped unless a stack is running                                              |

`scripts/verify.sh` runs the architecture and contract suites; the
end-to-end suite needs a stack started by `scripts/bootstrap.sh`.
