export type Brand<T, Name extends string> = T & { readonly __brand: Name }

export type EntityId = Brand<string, "EntityId">
export type MetricId = Brand<string, "MetricId">
export type TraceId = Brand<string, "TraceId">
export type IssueId = Brand<string, "IssueId">

export const entityId = (value: string) => value as EntityId
export const metricId = (value: string) => value as MetricId
export const traceId = (value: string) => value as TraceId
export const issueId = (value: string) => value as IssueId

export type EvidenceState = "Direct" | "Confirmed" | "Inferred" | "Conflicted" | "Missing"
export type HealthState = "Healthy" | "Delayed" | "Partial" | "Disconnected" | "Attention required"
export type Persona = "CTO" | "VP Engineering" | "Engineering Manager" | "Platform Lead" | "Echo Administrator"
export type DemoScenario = "healthy" | "poor-evidence" | "connector-outage" | "mapping-conflict" | "insufficient-cohort" | "service-error"
export type AllocationMode = "Attributed" | "Touched"
export type InvolvementMode = "All" | "Owned" | "Contributed"

export interface AnalyticalContext {
  readonly tenant: string
  readonly window: "Last 30 days" | "Last 90 days" | "Last 180 days"
  readonly viewBy: "Team" | "Initiative" | "Product" | "Application / Service" | "Cost Centre"
  readonly entity: EntityId | "all"
  readonly repository: string
  readonly provider: string
  readonly cohort: string
  readonly involvement: InvolvementMode
  readonly allocation: AllocationMode
}

export interface DimensionEntity {
  readonly id: EntityId
  readonly name: string
  readonly type: "Organisation" | "Team" | "Initiative" | "Product" | "Service" | "Repository" | "Cost Centre"
  readonly description: string
}

export interface DimensionRelationship {
  readonly sourceId: EntityId
  readonly targetId: EntityId
  readonly kind: "contains" | "owns" | "contributes to" | "belongs to" | "delivers" | "operates" | "funded by" | "affects" | "backed by"
  readonly evidence: EvidenceState
  readonly source: string
  readonly effectivePeriod: string
}

export interface MetricDefinition {
  readonly id: MetricId
  readonly label: string
  readonly unit: string
  readonly naturalGrain: string
  readonly category: "Investment" | "Coverage" | "Delivery" | "Quality" | "Customer"
}

export interface MetricObservation {
  readonly metricId: MetricId
  readonly value: number
  readonly formatted: string
  readonly delta: string
  readonly direction: "positive" | "negative" | "neutral"
}

export interface CohortComparison {
  readonly metric: MetricDefinition
  readonly aiLinkedMedian: number
  readonly comparatorMedian: number
  readonly difference: string
  readonly aiSample: number
  readonly comparatorSample: number
  readonly evidence: EvidenceState
  readonly window: string
}

export interface TraceEntity {
  readonly id: TraceId
  readonly kind: "AI session" | "Change set" | "Commit" | "Pull request" | "Work item" | "Build" | "Deployment" | "Quality signal" | "Customer outcome"
  readonly title: string
  readonly source: string
  readonly timestamp: string
  readonly metadata: Readonly<Record<string, string>>
}

export interface TraceRelationship {
  readonly from: TraceId
  readonly to: TraceId
  readonly evidence: EvidenceState
  readonly method: string
}

export interface ConnectorHealth {
  readonly name: string
  readonly domain: string
  readonly state: HealthState
  readonly freshness: string
  readonly coverage: number
}

export interface DataHealthIssue {
  readonly id: IssueId
  readonly title: string
  readonly category: "Collection" | "Identity" | "Linkage" | "Cost" | "Hierarchy" | "Outcomes"
  readonly severity: "High" | "Medium" | "Low"
  readonly scope: string
  readonly detail: string
  readonly configurable: boolean
}

export const DEFAULT_CONTEXT: AnalyticalContext = {
  tenant: "Difinity Demo Organisation",
  window: "Last 90 days",
  viewBy: "Team",
  entity: "all",
  repository: "All applications",
  provider: "All providers",
  cohort: "AI-linked vs capture-complete",
  involvement: "All",
  allocation: "Attributed",
}
