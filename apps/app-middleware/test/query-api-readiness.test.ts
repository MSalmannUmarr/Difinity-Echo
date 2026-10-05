import { createServer, type Server } from "node:http"
import type { AddressInfo } from "node:net"
import { afterEach, describe, expect, it } from "vitest"
import type { ServiceReadiness } from "@difinity-echo/observability-contracts"
import { parseAppMiddlewareConfig } from "../src/app/config/config.js"
import { createAppMiddlewareContainer } from "../src/app/container/container.js"

const servers: Server[] = []
const listen = async (server: Server): Promise<number> => {
  servers.push(server)
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  return (server.address() as AddressInfo).port
}

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map((s) => new Promise<void>((resolve) => s.close(() => resolve())))
  )
})

const fakeQueryApi = (body: string, status = 200): Server =>
  createServer((_request, response) => {
    response.writeHead(status, { "content-type": "application/json" })
    response.end(body)
  })

const platformReadiness = (status: "ready" | "not-ready"): string =>
  JSON.stringify({
    schemaVersion: "1",
    service: { component: "data-platform", version: "0.0.0" },
    status,
    checkedAt: "2026-01-15T09:30:00Z",
    dependencies: [],
  })

const middlewareReadiness = async (queryApiUrl: string) => {
  const config = parseAppMiddlewareConfig({
    APP_MIDDLEWARE_QUERY_API_URL: queryApiUrl,
    APP_MIDDLEWARE_QUERY_API_TIMEOUT_MS: "500",
  })
  if (!config.ok) throw new Error("config")
  const { server } = createAppMiddlewareContainer(config.value)
  const port = await listen(server)
  const response = await fetch(`http://127.0.0.1:${port}/health/ready`)
  return { status: response.status, body: (await response.json()) as ServiceReadiness }
}

describe("middleware readiness through the Query API", () => {
  it("is ready when the Query API reports ready", async () => {
    const port = await listen(fakeQueryApi(platformReadiness("ready")))
    const { status, body } = await middlewareReadiness(`http://127.0.0.1:${port}`)
    expect(status).toBe(200)
    expect(body.dependencies).toEqual([
      { name: "query-api", kind: "service", required: true, status: "ready" },
    ])
  })

  it("is not ready when the Query API reports not-ready", async () => {
    const port = await listen(fakeQueryApi(platformReadiness("not-ready"), 503))
    const { status, body } = await middlewareReadiness(`http://127.0.0.1:${port}`)
    expect(status).toBe(503)
    expect(body.status).toBe("not-ready")
  })

  it("treats a contract-violating response as not ready rather than ready", async () => {
    const port = await listen(fakeQueryApi(JSON.stringify({ status: "ready" })))
    const { body } = await middlewareReadiness(`http://127.0.0.1:${port}`)
    expect(body.dependencies[0]).toMatchObject({
      status: "not-ready",
      failure: "unexpected-response",
    })
  })

  it("classifies an unreachable Query API", async () => {
    const closed = createServer()
    const port = await listen(closed)
    await new Promise<void>((resolve) => closed.close(() => resolve()))
    servers.splice(servers.indexOf(closed), 1)
    const { status, body } = await middlewareReadiness(`http://127.0.0.1:${port}`)
    expect(status).toBe(503)
    expect(body.dependencies[0]).toMatchObject({
      status: "not-ready",
      failure: "connection-refused",
    })
  })
})
