import type { AddressInfo } from "node:net"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  ObservabilityContractId,
  observabilityRegistry,
  type ServiceReadiness,
} from "@difinity-echo/observability-contracts"
import {
  createEdgeAgentContainer,
  type EdgeAgentContainer,
} from "../src/app/container/container.js"
import { edgeBoundaries } from "../src/core/domain/edge-boundary.js"

const fixedClock = { now: () => new Date("2026-01-15T09:30:00Z") }
let container: EdgeAgentContainer
let baseUrl: string

beforeEach(async () => {
  container = createEdgeAgentContainer({ http: { host: "127.0.0.1", port: 0 } }, fixedClock)
  await new Promise<void>((resolve) => container.server.listen(0, "127.0.0.1", resolve))
  baseUrl = `http://127.0.0.1:${(container.server.address() as AddressInfo).port}`
})

afterEach(async () => {
  await new Promise<void>((resolve) => container.server.close(() => resolve()))
})

const validatorFor = (id: string) => {
  const result = observabilityRegistry.validator(id)
  if (!result.ok) throw new Error(`missing contract ${id}`)
  return result.value
}

describe("edge-agent health endpoints", () => {
  it("reports liveness using the shared contract", async () => {
    const response = await fetch(`${baseUrl}/health/live`)
    expect(response.status).toBe(200)
    const body: unknown = await response.json()
    expect(validatorFor(ObservabilityContractId.ServiceHealth).validate(body).ok).toBe(true)
  })

  it("reports every Edge boundary as not implemented, never as ready", async () => {
    const response = await fetch(`${baseUrl}/health/ready`)
    const body = (await response.json()) as ServiceReadiness
    expect(validatorFor(ObservabilityContractId.ServiceReadiness).validate(body).ok).toBe(true)
    expect(response.status).toBe(200)
    expect(body.service.component).toBe("edge-agent")
    expect(body.dependencies.map((d) => d.name)).toEqual([...edgeBoundaries])
    expect(body.dependencies.every((d) => d.status === "not-implemented" && !d.required)).toBe(true)
  })

  it("propagates a valid correlation id and replaces an invalid one", async () => {
    const kept = await fetch(`${baseUrl}/health/live`, {
      headers: { "x-correlation-id": "synthetic-correlation-1" },
    })
    expect(kept.headers.get("x-correlation-id")).toBe("synthetic-correlation-1")
    const replaced = await fetch(`${baseUrl}/health/live`, {
      headers: { "x-correlation-id": "bad" },
    })
    expect(replaced.headers.get("x-correlation-id")).not.toBe("bad")
  })

  it("returns typed safe errors for unknown routes and methods", async () => {
    const missing = await fetch(`${baseUrl}/unknown`)
    expect(missing.status).toBe(404)
    expect(await missing.json()).toMatchObject({ code: "not-found" })
    const post = await fetch(`${baseUrl}/health/live`, { method: "POST" })
    expect(post.status).toBe(405)
    expect(await post.json()).toMatchObject({ code: "invalid-request" })
  })
})
