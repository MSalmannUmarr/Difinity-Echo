import { issueId, type ConnectorHealth, type DataHealthIssue, type DemoScenario } from "@/src/shared/core/models"

export interface DataHealthSnapshot { readonly connectors: readonly ConnectorHealth[]; readonly issues: readonly DataHealthIssue[]; readonly linkage: readonly Record<string, unknown>[] }
export interface DataHealthClient { getHealth(scenario: DemoScenario, mappingRepaired: boolean): Promise<Readonly<DataHealthSnapshot>> }

const connectors: ConnectorHealth[] = [
  { name: "Cursor", domain: "AI evidence", state: "Healthy", freshness: "4 min ago", coverage: 92 },
  { name: "GitHub", domain: "Source control", state: "Healthy", freshness: "2 min ago", coverage: 99 },
  { name: "Jira", domain: "Work tracking", state: "Healthy", freshness: "8 min ago", coverage: 96 },
  { name: "GitHub Actions", domain: "Deployment", state: "Healthy", freshness: "3 min ago", coverage: 98 },
  { name: "Sentry", domain: "Quality", state: "Delayed", freshness: "47 min ago", coverage: 84 },
  { name: "Zendesk", domain: "Customer", state: "Partial", freshness: "2 hr ago", coverage: 71 },
]
const issues: DataHealthIssue[] = [
  { id: issueId("ownership-conflict"), title: "Checkout API has conflicting primary ownership", category: "Hierarchy", severity: "High", scope: "Payments / Checkout API", detail: "CODEOWNERS and the service registry disagree. Attributed ownership totals 140%.", configurable: true },
  { id: issueId("outcome-linkage"), title: "Deployment-to-outcome linkage is incomplete", category: "Outcomes", severity: "Medium", scope: "Digital Payments", detail: "29% of support records cannot be associated with a mature release window.", configurable: true },
  { id: issueId("identity-alias"), title: "Three actor aliases need review", category: "Identity", severity: "Low", scope: "Engineering", detail: "Provider and Git identities have no confirmed directory match.", configurable: true },
]

export class MockDataHealthClient implements DataHealthClient {
  async getHealth(scenario: DemoScenario, mappingRepaired: boolean) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    if (scenario === "service-error") throw new Error("mock health unavailable")
    let nextConnectors = connectors
    if (scenario === "connector-outage") nextConnectors = connectors.map((item) => item.name === "GitHub" ? { ...item, state: "Disconnected" as const, freshness: "6 hr ago", coverage: 42 } : item)
    if (scenario === "poor-evidence") nextConnectors = connectors.map((item) => ({ ...item, state: "Partial" as const, coverage: Math.max(38, item.coverage - 32) }))
    return {
      connectors: nextConnectors,
      issues: mappingRepaired ? issues.filter((item) => item.id !== "ownership-conflict") : issues,
      linkage: [
        { name: "AI to commit", coverage: scenario === "poor-evidence" ? 48 : 87 },
        { name: "Commit to PR", coverage: 96 },
        { name: "PR to deployment", coverage: scenario === "connector-outage" ? 51 : 91 },
        { name: "Deployment to outcome", coverage: 71 },
      ],
    }
  }
}

export const dataHealthClient: DataHealthClient = new MockDataHealthClient()
