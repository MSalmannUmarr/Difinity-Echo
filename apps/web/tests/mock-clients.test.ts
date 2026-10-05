import { describe, expect, it } from "vitest"
import { MockAnalyticsClient } from "@/src/features/analytics/data/mock-analytics-client"
import { MockDataHealthClient } from "@/src/features/data-health/data/mock-data-health-client"
import { MockEvidenceClient } from "@/src/features/evidence/data/mock-evidence-client"
import { DEFAULT_CONTEXT } from "@/src/shared/core/models"

describe("mock client contracts", () => {
  it("preserves the selected metric in a cohort comparison", async () => {
    const result = await new MockAnalyticsClient().getComparison(DEFAULT_CONTEXT, "Change failure rate", "healthy")

    expect(result.metric.label).toBe("Change failure rate")
    expect(result.metric.naturalGrain).toBe("Deployment")
    expect(result.aiSample).toBeGreaterThan(30)
  })

  it("resolves every seeded golden-path trace identifier", async () => {
    const client = new MockEvidenceClient()

    for (const query of ["PAY-1427", "#382", "e942bd", "checkout-api v8.4.1"]) {
      const trace = await client.findTrace(query, "healthy")
      expect(trace?.entities).toHaveLength(9)
      expect(trace?.relationships.at(-1)?.evidence).toBe("Inferred")
    }
  })

  it("removes the repaired ownership conflict from data health", async () => {
    const client = new MockDataHealthClient()
    const before = await client.getHealth("healthy", false)
    const after = await client.getHealth("healthy", true)

    expect(before.issues.some((issue) => issue.id === "ownership-conflict")).toBe(true)
    expect(after.issues.some((issue) => issue.id === "ownership-conflict")).toBe(false)
    expect(after.issues).toHaveLength(before.issues.length - 1)
  })

  it("represents an insufficient cohort without fabricating confidence", async () => {
    const result = await new MockAnalyticsClient().getComparison(DEFAULT_CONTEXT, "Work-item cycle time", "insufficient-cohort")

    expect(result.evidence).toBe("Missing")
    expect(result.aiSample + result.comparatorSample).toBeLessThan(10)
  })
})
