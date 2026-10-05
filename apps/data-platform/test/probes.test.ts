import { createServer, type Server } from "node:http"
import {
  createServer as createTcpServer,
  type AddressInfo,
  type Server as TcpServer,
} from "node:net"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { HttpHealthProbe } from "../src/app/adapters/outbound/http-health-probe.js"
import { TcpReachabilityProbe } from "../src/app/adapters/outbound/tcp-reachability-probe.js"

let tcp: TcpServer
let http: Server
let tcpPort: number
let httpPort: number

const closedPort = async (): Promise<number> => {
  const server = createTcpServer()
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  const { port } = server.address() as AddressInfo
  await new Promise<void>((resolve) => server.close(() => resolve()))
  return port
}

beforeAll(async () => {
  tcp = createTcpServer((socket) => socket.end())
  await new Promise<void>((resolve) => tcp.listen(0, "127.0.0.1", resolve))
  tcpPort = (tcp.address() as AddressInfo).port
  http = createServer((request, response) => {
    response.statusCode = request.url === "/ok" ? 200 : 500
    response.end()
  })
  await new Promise<void>((resolve) => http.listen(0, "127.0.0.1", resolve))
  httpPort = (http.address() as AddressInfo).port
})

afterAll(async () => {
  await new Promise<void>((resolve) => tcp.close(() => resolve()))
  await new Promise<void>((resolve) => http.close(() => resolve()))
})

const base = {
  name: "postgresql",
  kind: "infrastructure",
  required: false,
  timeoutMs: 1000,
} as const

describe("TCP reachability probe", () => {
  it("reports reachable (never ready) when a connection succeeds", async () => {
    const result = await new TcpReachabilityProbe({
      ...base,
      endpoint: { host: "127.0.0.1", port: tcpPort },
    }).probe()
    expect(result.status).toBe("reachable")
  })

  it("classifies a refused connection without throwing", async () => {
    const port = await closedPort()
    const result = await new TcpReachabilityProbe({
      ...base,
      endpoint: { host: "127.0.0.1", port },
    }).probe()
    expect(result).toMatchObject({ status: "not-ready", failure: "connection-refused" })
  })

  it("reports not-configured when no endpoint is set", async () => {
    const result = await new TcpReachabilityProbe({ ...base, endpoint: undefined }).probe()
    expect(result.status).toBe("not-configured")
  })
})

describe("HTTP health probe", () => {
  it("reports ready for a 2xx health response", async () => {
    const url = new URL(`http://127.0.0.1:${httpPort}/ok`)
    expect((await new HttpHealthProbe({ ...base, url }).probe()).status).toBe("ready")
  })

  it("reports not-ready with a classification for a failing response", async () => {
    const url = new URL(`http://127.0.0.1:${httpPort}/fail`)
    expect(await new HttpHealthProbe({ ...base, url }).probe()).toMatchObject({
      status: "not-ready",
      failure: "unexpected-response",
    })
  })

  it("classifies a refused connection", async () => {
    const url = new URL(`http://127.0.0.1:${await closedPort()}/ok`)
    expect(await new HttpHealthProbe({ ...base, url }).probe()).toMatchObject({
      status: "not-ready",
      failure: "connection-refused",
    })
  })
})
