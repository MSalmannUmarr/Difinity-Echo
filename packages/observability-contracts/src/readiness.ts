import type { DependencyReadiness, ServiceReadiness } from "./generated/service-readiness.v1.js"
import type { ServiceHealth } from "./generated/service-health.v1.js"

export type ServiceIdentity = ServiceHealth["service"]
export type DependencyStatus = DependencyReadiness["status"]

/** Named dependency statuses so callers do not compare raw strings. */
export const DependencyStatus = {
  Ready: "ready",
  Reachable: "reachable",
  NotReady: "not-ready",
  NotConfigured: "not-configured",
  NotImplemented: "not-implemented",
} as const satisfies Record<string, DependencyStatus>

export const DependencyKind = {
  Infrastructure: "infrastructure",
  Service: "service",
  Boundary: "boundary",
} as const satisfies Record<string, DependencyReadiness["kind"]>

/**
 * A required dependency satisfies readiness only when it is fully `ready`.
 * `reachable` (network only) and `not-implemented` never satisfy a required dependency.
 */
const satisfiesRequirement = (dependency: DependencyReadiness): boolean =>
  !dependency.required || dependency.status === DependencyStatus.Ready

export const buildReadiness = (
  service: ServiceIdentity,
  dependencies: readonly DependencyReadiness[],
  checkedAt: Date
): ServiceReadiness => ({
  schemaVersion: "1",
  service,
  status: dependencies.every(satisfiesRequirement) ? "ready" : "not-ready",
  checkedAt: checkedAt.toISOString(),
  dependencies: [...dependencies],
})

export const buildLiveness = (service: ServiceIdentity, checkedAt: Date): ServiceHealth => ({
  schemaVersion: "1",
  service,
  status: "alive",
  checkedAt: checkedAt.toISOString(),
})
