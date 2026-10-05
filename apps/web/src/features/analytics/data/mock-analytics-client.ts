import { entityId, metricId, type AnalyticalContext, type CohortComparison, type DemoScenario, type MetricDefinition } from "@/src/shared/core/models"
import type { OrganisationGraph, OverviewSnapshot } from "../domain/models"

export interface AnalyticsClient {
  getOverview(context: AnalyticalContext, scenario: DemoScenario): Promise<OverviewSnapshot>
  getComparison(context: AnalyticalContext, metric: string, scenario: DemoScenario): Promise<Readonly<CohortComparison>>
  getOrganisationGraph(): Promise<Readonly<OrganisationGraph>>
}

const cycleTime: MetricDefinition = {
  id: metricId("work-item-cycle-time"), label: "Work-item cycle time", unit: "days", naturalGrain: "Work item", category: "Delivery",
}

const comparisonByMetric: Readonly<Record<string, CohortComparison>> = {
  "AI investment": { metric: { id: metricId("ai-spend"), label: "AI investment", unit: "$k", naturalGrain: "Provider billing period", category: "Investment" }, aiLinkedMedian: 31.8, comparatorMedian: 29.4, difference: "8.2% higher", aiSample: 124, comparatorSample: 98, evidence: "Confirmed", window: "Last 90 days" },
  "AI coverage": { metric: { id: metricId("ai-coverage"), label: "AI coverage", unit: "%", naturalGrain: "Work item", category: "Coverage" }, aiLinkedMedian: 74, comparatorMedian: 61, difference: "13 pts higher", aiSample: 124, comparatorSample: 98, evidence: "Confirmed", window: "Last 90 days" },
  "Work-item cycle time": { metric: cycleTime, aiLinkedMedian: 6.8, comparatorMedian: 8.3, difference: "17.4% lower", aiSample: 124, comparatorSample: 98, evidence: "Confirmed", window: "Last 90 days" },
  "Change failure rate": { metric: { id: metricId("change-failure-rate"), label: "Change failure rate", unit: "%", naturalGrain: "Deployment", category: "Quality" }, aiLinkedMedian: 2.9, comparatorMedian: 3.7, difference: "0.8 pts lower", aiSample: 81, comparatorSample: 73, evidence: "Confirmed", window: "Last 90 days" },
  "Support demand": { metric: { id: metricId("support-demand"), label: "Support demand", unit: "%", naturalGrain: "Deployment window", category: "Customer" }, aiLinkedMedian: 11, comparatorMedian: 13, difference: "11% lower", aiSample: 64, comparatorSample: 58, evidence: "Inferred", window: "Last 90 days" },
}

const graph: OrganisationGraph = {
  entities: [
    { id: entityId("engineering"), name: "Engineering", type: "Organisation", description: "Product engineering organisation" },
    { id: entityId("payments"), name: "Payments", type: "Team", description: "Owns payment services and contributes to checkout" },
    { id: entityId("platform"), name: "Platform", type: "Team", description: "Operates the shared delivery platform" },
    { id: entityId("identity"), name: "Identity", type: "Team", description: "Owns authentication and identity services" },
    { id: entityId("checkout-modernisation"), name: "Checkout Modernisation", type: "Initiative", description: "Improves the end-to-end checkout journey" },
    { id: entityId("digital-payments"), name: "Digital Payments", type: "Product", description: "Customer-facing payment product" },
    { id: entityId("checkout-api"), name: "Checkout API", type: "Service", description: "Coordinates checkout and payment intent creation" },
    { id: entityId("checkout-repo"), name: "checkout-api", type: "Repository", description: "TypeScript service repository" },
    { id: entityId("cc-183"), name: "Cost Centre 183", type: "Cost Centre", description: "Digital commerce engineering budget" },
  ],
  relationships: [
    { sourceId: entityId("engineering"), targetId: entityId("payments"), kind: "contains", evidence: "Confirmed", source: "Organisation import", effectivePeriod: "Jan 2026 - present" },
    { sourceId: entityId("engineering"), targetId: entityId("platform"), kind: "contains", evidence: "Confirmed", source: "Organisation import", effectivePeriod: "Jan 2026 - present" },
    { sourceId: entityId("payments"), targetId: entityId("checkout-modernisation"), kind: "contributes to", evidence: "Confirmed", source: "Jira initiative mapping", effectivePeriod: "Apr 2026 - present" },
    { sourceId: entityId("platform"), targetId: entityId("checkout-modernisation"), kind: "contributes to", evidence: "Inferred", source: "Repository ownership rule", effectivePeriod: "Apr 2026 - present" },
    { sourceId: entityId("checkout-modernisation"), targetId: entityId("digital-payments"), kind: "affects", evidence: "Confirmed", source: "Portfolio map", effectivePeriod: "Apr 2026 - present" },
    { sourceId: entityId("payments"), targetId: entityId("checkout-api"), kind: "operates", evidence: "Conflicted", source: "CODEOWNERS + service registry", effectivePeriod: "Jul 2026 - present" },
    { sourceId: entityId("checkout-api"), targetId: entityId("checkout-repo"), kind: "backed by", evidence: "Direct", source: "GitHub repository link", effectivePeriod: "Jan 2026 - present" },
    { sourceId: entityId("cc-183"), targetId: entityId("payments"), kind: "funded by", evidence: "Confirmed", source: "Finance import", effectivePeriod: "FY 2026" },
  ],
}

const rows = [
  ["payments", "Payments", "$31.8k", "74%", "6.8d", "2.9%", "-11%", "Conflicted"],
  ["platform", "Platform", "$24.2k", "63%", "8.4d", "4.1%", "-4%", "Confirmed"],
  ["identity", "Identity", "$18.6k", "57%", "9.1d", "3.5%", "+2%", "Inferred"],
] as const

const overview: OverviewSnapshot = {
  rows: rows.map(([id, , spend, coverage, delivery, quality, customer, evidence]) => ({
    entity: graph.entities.find((item) => item.id === id)!,
    investment: { metricId: metricId("ai-spend"), value: Number(spend.replace(/[^0-9.]/g, "")), formatted: spend, delta: "+8%", direction: "neutral" },
    coverage: { metricId: metricId("ai-coverage"), value: Number(coverage.slice(0, -1)), formatted: coverage, delta: "+6 pts", direction: "positive" },
    delivery: { metricId: metricId("work-item-cycle-time"), value: Number(delivery.slice(0, -1)), formatted: delivery, delta: id === "payments" ? "-17.4%" : "-6.2%", direction: "positive" },
    quality: { metricId: metricId("change-failure-rate"), value: Number(quality.slice(0, -1)), formatted: quality, delta: id === "payments" ? "-0.8 pts" : "+0.3 pts", direction: id === "platform" ? "negative" : "positive" },
    customer: { metricId: metricId("support-demand"), value: Number(customer.replace("%", "")), formatted: customer, delta: "vs prior", direction: customer.startsWith("-") ? "positive" : "negative" },
    evidence,
  })),
  trend: [
    { date: new Date("2026-04-01"), aiLinked: 9.4, comparator: 10.1 },
    { date: new Date("2026-05-01"), aiLinked: 8.7, comparator: 9.8 },
    { date: new Date("2026-06-01"), aiLinked: 7.9, comparator: 9.4 },
    { date: new Date("2026-07-01"), aiLinked: 7.4, comparator: 9.1 },
    { date: new Date("2026-08-01"), aiLinked: 6.8, comparator: 8.9 },
    { date: new Date("2026-09-01"), aiLinked: 6.6, comparator: 8.7 },
  ],
  comparison: { metric: cycleTime, aiLinkedMedian: 6.8, comparatorMedian: 8.3, difference: "17.4% lower", aiSample: 124, comparatorSample: 98, evidence: "Confirmed", window: "Last 90 days" },
}

const delay = <T,>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 320))

export class MockAnalyticsClient implements AnalyticsClient {
  getOverview(_context: AnalyticalContext, scenario: DemoScenario) {
    if (scenario === "service-error") return Promise.reject(new Error("mock analytics unavailable"))
    const adjusted = scenario === "poor-evidence" ? { ...overview, rows: overview.rows.map((row) => ({ ...row, evidence: "Missing" as const })) } : overview
    return delay(adjusted)
  }
  getComparison(_context: AnalyticalContext, metric: string, scenario: DemoScenario) {
    if (scenario === "service-error") return Promise.reject(new Error("mock analytics unavailable"))
    const selected = comparisonByMetric[metric] ?? overview.comparison
    const value = scenario === "insufficient-cohort" ? { ...selected, aiSample: 5, comparatorSample: 3, evidence: "Missing" as const } : selected
    return delay(value)
  }
  getOrganisationGraph() { return delay(graph) }
}

export const analyticsClient: AnalyticsClient = new MockAnalyticsClient()
