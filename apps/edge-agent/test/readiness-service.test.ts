import { describe, expect, it } from "vitest"
import type { DependencyReadiness } from "@difinity-echo/observability-contracts"
import { ReadinessService } from "../src/core/services/readiness-service.js"

const clock = { now: () => new Date("2026-01-15T09:30:00Z") }
const probe = (dependency: DependencyReadiness) => ({ probe: () => Promise.resolve(dependency) })

describe("readiness service", () => {
  it("is not ready when a required dependency is not ready", async () => {
    const service = new ReadinessService({ component: "edge-agent", version: "0.0.0" }, clock, [
      probe({
        name: "durable-buffer",
        kind: "boundary",
        required: true,
        status: "not-ready",
        failure: "timeout",
      }),
    ])
    const report = await service.execute()
    expect(report.status).toBe("not-ready")
    expect(report.checkedAt).toBe("2026-01-15T09:30:00.000Z")
  })
})
