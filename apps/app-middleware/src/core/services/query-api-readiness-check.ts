import {
  DependencyKind,
  DependencyStatus,
  type DependencyReadiness,
} from "@difinity-echo/observability-contracts"
import type { CorrelationIdSource } from "../ports/out/correlation-id-source.js"
import type { DependencyProbe } from "../ports/out/dependency-probe.js"
import type { QueryApiClient } from "../ports/out/query-api-client.js"

export const QUERY_API_DEPENDENCY = "query-api"

/** The Query API is the middleware's only required dependency. */
export class QueryApiReadinessCheck implements DependencyProbe {
  readonly #client: QueryApiClient
  readonly #ids: CorrelationIdSource

  constructor(client: QueryApiClient, ids: CorrelationIdSource) {
    this.#client = client
    this.#ids = ids
  }

  async probe(): Promise<DependencyReadiness> {
    const base = { name: QUERY_API_DEPENDENCY, kind: DependencyKind.Service, required: true }
    const result = await this.#client.availability(this.#ids.next())
    if (result.ok) {
      return result.value === "available"
        ? { ...base, status: DependencyStatus.Ready }
        : { ...base, status: DependencyStatus.NotReady, failure: "unexpected-response" }
    }
    return result.error.kind === "query-api-unreachable"
      ? { ...base, status: DependencyStatus.NotReady, failure: result.error.failure }
      : { ...base, status: DependencyStatus.NotReady, failure: "unexpected-response" }
  }
}
