/**
 * Architectural boundaries owned by the Core Data Platform (implementation brief §10.2).
 * Milestone 0 registers each so readiness reports it honestly as `not-implemented`.
 */
export const PlatformBoundary = {
  Admission: "admission-api",
  EventPublication: "event-publication",
  EventProcessing: "event-processing",
  EvidenceAndCohorts: "evidence-and-cohorts",
  MetricEngine: "metric-engine",
  QueryApi: "tenant-query-api",
} as const

export type PlatformBoundary = (typeof PlatformBoundary)[keyof typeof PlatformBoundary]

export const platformBoundaries: readonly PlatformBoundary[] = Object.values(PlatformBoundary)

/** Purpose-specific stores from the confirmed architecture (consolidated brief §14). */
export const PlatformStore = {
  EventLog: "kafka",
  AnalyticalStore: "clickhouse",
  ControlPlane: "postgresql",
  CanonicalArchive: "object-storage",
} as const
