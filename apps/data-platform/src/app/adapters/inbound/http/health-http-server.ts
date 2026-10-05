import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http"
import type { SafeError } from "@difinity-echo/contracts"
import {
  CORRELATION_ID_HEADER,
  CorrelationId,
  type ServiceHealth,
  type ServiceReadiness,
} from "@difinity-echo/observability-contracts"
import type {
  GetLivenessUseCase,
  GetReadinessUseCase,
} from "../../../../core/ports/in/service-health.js"

export const HealthRoute = {
  Liveness: "/health/live",
  Readiness: "/health/ready",
} as const

const HttpStatus = {
  Ok: 200,
  NotFound: 404,
  MethodNotAllowed: 405,
  InternalServerError: 500,
  ServiceUnavailable: 503,
} as const

const HttpMethod = { Get: "GET", Head: "HEAD" } as const

export interface HealthHttpDependencies {
  readonly liveness: GetLivenessUseCase
  readonly readiness: GetReadinessUseCase
  /** Generates a correlation id when the caller did not supply a valid one. */
  readonly newCorrelationId: () => CorrelationId
  /** Receives sanitised diagnostics; never raw request bodies or credentials. */
  readonly reportDefect: (correlationId: CorrelationId, defect: unknown) => void
}

const resolveCorrelationId = (
  request: IncomingMessage,
  newCorrelationId: () => CorrelationId
): CorrelationId => {
  const header = request.headers[CORRELATION_ID_HEADER]
  const candidate = Array.isArray(header) ? header[0] : header
  if (candidate === undefined) return newCorrelationId()
  const parsed = CorrelationId.parse(candidate)
  return parsed.ok ? parsed.value : newCorrelationId()
}

const sendJson = (
  response: ServerResponse,
  status: number,
  correlationId: CorrelationId,
  body: ServiceHealth | ServiceReadiness | SafeError
): void => {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    [CORRELATION_ID_HEADER]: correlationId,
  })
  response.end(JSON.stringify(body))
}

const safeError = (
  code: SafeError["code"],
  message: string,
  correlationId: CorrelationId
): SafeError => ({ code, message, correlationId })

/** Inbound HTTP adapter exposing the shared health and readiness contracts. */
export const createHealthHttpServer = (dependencies: HealthHttpDependencies): Server =>
  createServer((request, response) => {
    const correlationId = resolveCorrelationId(request, dependencies.newCorrelationId)
    const path = new URL(request.url ?? "/", "http://localhost").pathname
    const isRead = request.method === HttpMethod.Get || request.method === HttpMethod.Head

    if (path !== HealthRoute.Liveness && path !== HealthRoute.Readiness) {
      sendJson(
        response,
        HttpStatus.NotFound,
        correlationId,
        safeError("not-found", "Route not found.", correlationId)
      )
      return
    }
    if (!isRead) {
      sendJson(
        response,
        HttpStatus.MethodNotAllowed,
        correlationId,
        safeError("invalid-request", "Method not allowed.", correlationId)
      )
      return
    }
    if (path === HealthRoute.Liveness) {
      sendJson(response, HttpStatus.Ok, correlationId, dependencies.liveness.execute())
      return
    }
    dependencies.readiness
      .execute()
      .then((report) => {
        const status = report.status === "ready" ? HttpStatus.Ok : HttpStatus.ServiceUnavailable
        sendJson(response, status, correlationId, report)
      })
      .catch((defect: unknown) => {
        dependencies.reportDefect(correlationId, defect)
        sendJson(
          response,
          HttpStatus.InternalServerError,
          correlationId,
          safeError("unexpected-defect", "Readiness could not be determined.", correlationId)
        )
      })
  })
