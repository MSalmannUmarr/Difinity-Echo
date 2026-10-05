import { describe, expect, it } from "vitest"
import { CorrelationId } from "@difinity-echo/observability-contracts"
import {
  mapFailure,
  type MiddlewareFailure,
} from "../src/app/adapters/inbound/http/response-mapping.js"

const id = (() => {
  const parsed = CorrelationId.parse("synthetic-correlation-1")
  if (!parsed.ok) throw new Error("invalid fixture")
  return parsed.value
})()

describe("failure mapping", () => {
  it.each<[MiddlewareFailure, number, string]>([
    [{ kind: "authentication-not-configured" }, 401, "unauthenticated"],
    [{ kind: "authentication-rejected" }, 401, "unauthenticated"],
    [{ kind: "authentication-unavailable" }, 503, "dependency-unavailable"],
    [{ kind: "authorization-denied" }, 403, "forbidden"],
    [{ kind: "query-api-unreachable", failure: "timeout" }, 503, "dependency-unavailable"],
    [{ kind: "query-api-invalid-response" }, 502, "unexpected-defect"],
  ])("maps %j to %i %s with the correlation id", (failure, status, code) => {
    const mapped = mapFailure(failure, id)
    expect(mapped.httpStatus).toBe(status)
    expect(mapped.body).toMatchObject({ code, correlationId: id })
  })
})
