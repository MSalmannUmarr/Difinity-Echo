import { traceId, type DemoScenario, type TraceEntity, type TraceRelationship } from "@/src/shared/core/models"

export interface EvidenceTrace { readonly query: string; readonly entities: readonly TraceEntity[]; readonly relationships: readonly TraceRelationship[] }
export interface EvidenceClient { findTrace(query: string, scenario: DemoScenario): Promise<Readonly<EvidenceTrace> | null> }

const entities: TraceEntity[] = [
  { id: traceId("session"), kind: "AI session", title: "Cursor session csn_7F2A", source: "Cursor", timestamp: "10 Sep, 11:42-12:18", metadata: { Actor: "Developer 014", Repository: "checkout-api", Model: "Configured model", Content: "Not collected" } },
  { id: traceId("change"), kind: "Change set", title: "Local change set", source: "Echo collector", timestamp: "10 Sep, 12:19", metadata: { Files: "7 metadata references", Additions: "Content protected", Deletions: "Content protected" } },
  { id: traceId("commit"), kind: "Commit", title: "e942bd", source: "GitHub", timestamp: "10 Sep, 12:24", metadata: { Repository: "checkout-api", Branch: "feature/PAY-1427", Author: "Developer 014" } },
  { id: traceId("pr"), kind: "Pull request", title: "#382 Checkout retry handling", source: "GitHub", timestamp: "10 Sep, 12:31", metadata: { Reviews: "2 approved", WorkItem: "PAY-1427", State: "Merged" } },
  { id: traceId("ticket"), kind: "Work item", title: "PAY-1427", source: "Jira", timestamp: "7-10 Sep", metadata: { Initiative: "Checkout Modernisation", Team: "Payments", Type: "Story" } },
  { id: traceId("build"), kind: "Build", title: "Build #2481", source: "GitHub Actions", timestamp: "10 Sep, 12:48", metadata: { Result: "Passed", Duration: "8m 12s", SHA: "e942bd" } },
  { id: traceId("deploy"), kind: "Deployment", title: "checkout-api v8.4.1", source: "GitHub Deployments", timestamp: "10 Sep, 13:08", metadata: { Environment: "Production", Commit: "e942bd", Status: "Successful" } },
  { id: traceId("quality"), kind: "Quality signal", title: "Sentry release health", source: "Sentry", timestamp: "10-17 Sep window", metadata: { CrashFree: "99.94%", Incidents: "0 linked", Window: "Mature" } },
  { id: traceId("outcome"), kind: "Customer outcome", title: "Checkout support demand", source: "Zendesk", timestamp: "10-24 Sep window", metadata: { Tickets: "12", Change: "11% lower", Attribution: "Associated, not causal" } },
]

const relationships: TraceRelationship[] = [
  ["session", "change", "Direct", "Local provenance token"], ["change", "commit", "Confirmed", "Git patch fingerprint"],
  ["commit", "pr", "Confirmed", "GitHub commit membership"], ["pr", "ticket", "Confirmed", "Jira development link"],
  ["pr", "build", "Direct", "Workflow SHA"], ["build", "deploy", "Direct", "Deployment artifact SHA"],
  ["deploy", "quality", "Confirmed", "Sentry release name"], ["deploy", "outcome", "Inferred", "Service and observation window"],
].map(([from, to, evidence, method]) => ({ from: traceId(from), to: traceId(to), evidence: evidence as TraceRelationship["evidence"], method }))

export class MockEvidenceClient implements EvidenceClient {
  async findTrace(query: string, scenario: DemoScenario) {
    await new Promise((resolve) => setTimeout(resolve, 320))
    if (!query.trim()) return null
    if (scenario === "service-error") throw new Error("mock evidence unavailable")
    if (!["PAY-1427", "#382", "e942bd", "checkout-api v8.4.1"].some((value) => value.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(value.toLowerCase()))) return null
    const updated = scenario === "mapping-conflict" ? relationships.map((rel) => rel.to === "outcome" ? { ...rel, evidence: "Conflicted" as const } : rel) : relationships
    return { query, entities, relationships: updated }
  }
}

export const evidenceClient: EvidenceClient = new MockEvidenceClient()
