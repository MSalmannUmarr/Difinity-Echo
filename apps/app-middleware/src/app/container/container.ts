import type { Server } from "node:http"
import type { ServiceIdentity } from "@difinity-echo/observability-contracts"
import type { Authenticator } from "../../core/ports/out/authenticator.js"
import type { Clock } from "../../core/ports/out/clock.js"
import type { QueryApiClient } from "../../core/ports/out/query-api-client.js"
import { LivenessService } from "../../core/services/liveness-service.js"
import { QueryApiReadinessCheck } from "../../core/services/query-api-readiness-check.js"
import { ReadinessService } from "../../core/services/readiness-service.js"
import { createHealthHttpServer } from "../adapters/inbound/http/health-http-server.js"
import { HttpQueryApiClient } from "../adapters/outbound/http-query-api-client.js"
import { RandomCorrelationIdSource } from "../adapters/outbound/random-correlation-id-source.js"
import { SystemClock } from "../adapters/outbound/system-clock.js"
import { UnconfiguredAuthenticator } from "../adapters/outbound/unconfigured-authenticator.js"
import type { AppMiddlewareConfig } from "../config/config.js"
import { SERVICE_VERSION } from "../config/service-version.js"

export interface AppMiddlewareContainer {
  readonly config: AppMiddlewareConfig
  readonly server: Server
  /** Fail-closed until an identity provider is selected; no protected routes exist yet. */
  readonly authenticator: Authenticator
}

export interface AppMiddlewareOverrides {
  readonly clock?: Clock
  readonly queryApiClient?: QueryApiClient
}

/** Composition root. The middleware has no database, Kafka or object-storage adapter. */
export const createAppMiddlewareContainer = (
  config: AppMiddlewareConfig,
  overrides: AppMiddlewareOverrides = {}
): AppMiddlewareContainer => {
  const service: ServiceIdentity = { component: "app-middleware", version: SERVICE_VERSION }
  const clock = overrides.clock ?? new SystemClock()
  const ids = new RandomCorrelationIdSource()
  const queryApiClient =
    overrides.queryApiClient ??
    new HttpQueryApiClient({
      baseUrl: config.queryApi.baseUrl,
      timeoutMs: config.queryApi.timeoutMs,
    })
  const server = createHealthHttpServer({
    liveness: new LivenessService(service, clock),
    readiness: new ReadinessService(service, clock, [
      new QueryApiReadinessCheck(queryApiClient, ids),
    ]),
    newCorrelationId: () => ids.next(),
    reportDefect: (correlationId) =>
      console.error(
        JSON.stringify({ event: "RequestFailed", correlationId, failure: "unexpected-defect" })
      ),
  })
  return { config, server, authenticator: new UnconfiguredAuthenticator() }
}
