import type { Server } from "node:http"
import { randomUUID } from "node:crypto"
import { CorrelationId, type ServiceIdentity } from "@difinity-echo/observability-contracts"
import { edgeBoundaries } from "../../core/domain/edge-boundary.js"
import type { Clock } from "../../core/ports/out/clock.js"
import { LivenessService } from "../../core/services/liveness-service.js"
import { ReadinessService } from "../../core/services/readiness-service.js"
import { createHealthHttpServer } from "../adapters/inbound/http/health-http-server.js"
import { NotImplementedBoundaryProbe } from "../adapters/outbound/not-implemented-boundary-probe.js"
import { SystemClock } from "../adapters/outbound/system-clock.js"
import type { EdgeAgentConfig } from "../config/config.js"
import { SERVICE_VERSION } from "../config/service-version.js"

export interface EdgeAgentContainer {
  readonly config: EdgeAgentConfig
  readonly server: Server
}

const newCorrelationId = (): CorrelationId => {
  const parsed = CorrelationId.parse(randomUUID())
  if (!parsed.ok) throw new Error("Generated correlation id failed validation")
  return parsed.value
}

/** Composition root: the only place that selects and wires concrete adapters. */
export const createEdgeAgentContainer = (
  config: EdgeAgentConfig,
  clock: Clock = new SystemClock()
): EdgeAgentContainer => {
  const service: ServiceIdentity = { component: "edge-agent", version: SERVICE_VERSION }
  const probes = edgeBoundaries.map((boundary) => new NotImplementedBoundaryProbe(boundary))
  const server = createHealthHttpServer({
    liveness: new LivenessService(service, clock),
    readiness: new ReadinessService(service, clock, probes),
    newCorrelationId,
    reportDefect: (correlationId) =>
      console.error(
        JSON.stringify({ event: "RequestFailed", correlationId, failure: "unexpected-defect" })
      ),
  })
  return { config, server }
}
