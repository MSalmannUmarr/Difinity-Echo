import type { Server } from "node:http"
import { randomUUID } from "node:crypto"
import {
  CorrelationId,
  DependencyKind,
  type ServiceIdentity,
} from "@difinity-echo/observability-contracts"
import { platformBoundaries, PlatformStore } from "../../core/domain/platform-boundary.js"
import type { Clock } from "../../core/ports/out/clock.js"
import type { DependencyProbe } from "../../core/ports/out/dependency-probe.js"
import { LivenessService } from "../../core/services/liveness-service.js"
import { ReadinessService } from "../../core/services/readiness-service.js"
import { createHealthHttpServer } from "../adapters/inbound/http/health-http-server.js"
import { HttpHealthProbe } from "../adapters/outbound/http-health-probe.js"
import { NotImplementedBoundaryProbe } from "../adapters/outbound/not-implemented-boundary-probe.js"
import { SystemClock } from "../adapters/outbound/system-clock.js"
import { TcpReachabilityProbe } from "../adapters/outbound/tcp-reachability-probe.js"
import type { DataPlatformConfig } from "../config/config.js"
import { SERVICE_VERSION } from "../config/service-version.js"

/** Health endpoints owned by the infrastructure adapters, not by the core. */
const InfrastructureHealthPath = {
  ClickHouse: "/ping",
  ObjectStorage: "/minio/health/live",
} as const

export interface DataPlatformContainer {
  readonly config: DataPlatformConfig
  readonly server: Server
}

const newCorrelationId = (): CorrelationId => {
  const parsed = CorrelationId.parse(randomUUID())
  if (!parsed.ok) throw new Error("Generated correlation id failed validation")
  return parsed.value
}

const resolveHealthUrl = (base: URL | undefined, path: string): URL | undefined =>
  base === undefined ? undefined : new URL(path, base)

/**
 * Composition root. In Milestone 0 no business flow uses the stores, so they
 * are optional (`required: false`) and probed for reachability only.
 */
export const createDataPlatformContainer = (
  config: DataPlatformConfig,
  clock: Clock = new SystemClock()
): DataPlatformContainer => {
  const service: ServiceIdentity = { component: "data-platform", version: SERVICE_VERSION }
  const { infrastructure, probeTimeoutMs: timeoutMs } = config
  const infra = { kind: DependencyKind.Infrastructure, required: false, timeoutMs } as const
  const probes: DependencyProbe[] = [
    new TcpReachabilityProbe({
      ...infra,
      name: PlatformStore.EventLog,
      endpoint: infrastructure.kafkaBootstrap,
    }),
    new HttpHealthProbe({
      ...infra,
      name: PlatformStore.AnalyticalStore,
      url: resolveHealthUrl(infrastructure.clickHouseUrl, InfrastructureHealthPath.ClickHouse),
    }),
    new TcpReachabilityProbe({
      ...infra,
      name: PlatformStore.ControlPlane,
      endpoint: infrastructure.postgresEndpoint,
    }),
    new HttpHealthProbe({
      ...infra,
      name: PlatformStore.CanonicalArchive,
      url: resolveHealthUrl(
        infrastructure.objectStorageUrl,
        InfrastructureHealthPath.ObjectStorage
      ),
    }),
    ...platformBoundaries.map((boundary) => new NotImplementedBoundaryProbe(boundary)),
  ]
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
