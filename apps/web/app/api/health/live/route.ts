import { buildLiveness } from "@difinity-echo/observability-contracts"

// Milestone 0: process liveness for scripts/demo.sh, using the shared contract.
// Must equal `version` in apps/web/package.json.
const WEB_VERSION = "0.0.1"

export const dynamic = "force-dynamic"

export function GET(): Response {
  return Response.json(buildLiveness({ component: "web", version: WEB_VERSION }, new Date()), {
    headers: { "cache-control": "no-store" },
  })
}
