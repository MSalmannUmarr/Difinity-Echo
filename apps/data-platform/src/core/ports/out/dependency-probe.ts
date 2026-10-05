import type { DependencyReadiness } from "@difinity-echo/observability-contracts"

/**
 * Driven port: reports the readiness of one dependency or architectural boundary.
 * Contract: never throws or rejects. Every failure is classified into the
 * returned DependencyReadiness; raw causes stay inside the adapter.
 */
export interface DependencyProbe {
  probe(): Promise<DependencyReadiness>
}
