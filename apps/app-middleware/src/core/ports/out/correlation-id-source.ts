import type { CorrelationId } from "@difinity-echo/observability-contracts"

/** Driven port for identifier generation (non-determinism stays outside the core). */
export interface CorrelationIdSource {
  next(): CorrelationId
}
