import type { ServiceHealth, ServiceReadiness } from "@difinity-echo/observability-contracts"

/** Driving port: process liveness. */
export interface GetLivenessUseCase {
  execute(): ServiceHealth
}

/** Driving port: readiness of the currently implemented responsibilities. */
export interface GetReadinessUseCase {
  execute(): Promise<ServiceReadiness>
}
