import type { CohortComparison, DimensionEntity, DimensionRelationship, EvidenceState, MetricObservation } from "@/src/shared/core/models"

export interface OverviewRow {
  readonly entity: DimensionEntity
  readonly investment: MetricObservation
  readonly coverage: MetricObservation
  readonly delivery: MetricObservation
  readonly quality: MetricObservation
  readonly customer: MetricObservation
  readonly evidence: EvidenceState
}

export interface OverviewSnapshot {
  readonly rows: readonly OverviewRow[]
  readonly trend: readonly Record<string, unknown>[]
  readonly comparison: CohortComparison
}

export interface OrganisationGraph {
  readonly entities: readonly DimensionEntity[]
  readonly relationships: readonly DimensionRelationship[]
}
