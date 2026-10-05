import type { Result } from "@difinity-echo/contracts"
import type { CorrelationId, FailureClassification } from "@difinity-echo/observability-contracts"

/** The middleware's view of the tenant-aware Query API's availability. */
export type QueryApiAvailability = "available" | "unavailable"

export type QueryApiFailure =
  | { readonly kind: "query-api-unreachable"; readonly failure: FailureClassification }
  | { readonly kind: "query-api-invalid-response" }

/**
 * Driven port to the Core Data Platform's tenant-aware Query API — the ONLY
 * data access path available to the middleware. Milestone 0 exposes only the
 * availability check; query operations are added per milestone with their own
 * versioned contracts.
 */
export interface QueryApiClient {
  availability(correlationId: CorrelationId): Promise<Result<QueryApiAvailability, QueryApiFailure>>
}
