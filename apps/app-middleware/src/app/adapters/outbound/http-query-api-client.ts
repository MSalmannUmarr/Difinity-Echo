import { err, ok, type Result } from "@difinity-echo/contracts"
import {
  CORRELATION_ID_HEADER,
  ObservabilityContractId,
  observabilityRegistry,
  type CorrelationId,
  type FailureClassification,
  type ServiceReadiness,
} from "@difinity-echo/observability-contracts"
import type {
  QueryApiAvailability,
  QueryApiClient,
  QueryApiFailure,
} from "../../../core/ports/out/query-api-client.js"

/** Query API route owned by this adapter (published by the Data Platform). */
const QueryApiRoute = { Readiness: "/health/ready" } as const

export interface HttpQueryApiClientOptions {
  readonly baseUrl: URL
  readonly timeoutMs: number
}

const readinessValidator = (() => {
  const result = observabilityRegistry.validator<ServiceReadiness>(
    ObservabilityContractId.ServiceReadiness
  )
  if (!result.ok) throw new Error("ServiceReadiness contract is not registered")
  return result.value
})()

const classify = (error: unknown): FailureClassification => {
  if (error instanceof DOMException && error.name === "TimeoutError") return "timeout"
  const code = (error as { readonly cause?: { readonly code?: string } }).cause?.code
  if (code === "ECONNREFUSED") return "connection-refused"
  if (code === "ENOTFOUND" || code === "EHOSTUNREACH") return "unreachable"
  return "unexpected-response"
}

/**
 * HTTP adapter (ACL) for the tenant-aware Query API. Validates every response
 * against the published contract before translating it into domain language.
 */
export class HttpQueryApiClient implements QueryApiClient {
  readonly #options: HttpQueryApiClientOptions

  constructor(options: HttpQueryApiClientOptions) {
    this.#options = options
  }

  async availability(
    correlationId: CorrelationId
  ): Promise<Result<QueryApiAvailability, QueryApiFailure>> {
    let body: unknown
    try {
      const response = await fetch(new URL(QueryApiRoute.Readiness, this.#options.baseUrl), {
        headers: { accept: "application/json", [CORRELATION_ID_HEADER]: correlationId },
        redirect: "error",
        signal: AbortSignal.timeout(this.#options.timeoutMs),
      })
      body = await response.json()
    } catch (error: unknown) {
      if (error instanceof SyntaxError) return err({ kind: "query-api-invalid-response" })
      return err({ kind: "query-api-unreachable", failure: classify(error) })
    }
    const parsed = readinessValidator.validate(body)
    if (!parsed.ok || parsed.value.service.component !== "data-platform") {
      return err({ kind: "query-api-invalid-response" })
    }
    return ok(parsed.value.status === "ready" ? "available" : "unavailable")
  }
}
