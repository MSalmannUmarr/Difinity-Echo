import type { AddressInfo } from "node:net"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  ObservabilityContractId,
  observabilityRegistry,
  type ServiceReadiness,
} from "@difinity-echo/observability-contracts"
import { parseDataPlatformConfig } from "../src/app/config/config.js"
import {
  createDataPlatformContainer,
  type DataPlatformContainer,
} from "../src/app/container/container.js"
import { platformBoundaries } from "../src/core/domain/platform-boundary.js"

const fixedClock = { now: () => new Date("2026-01-15T09:30:00Z") }
let container: DataPlatformContainer
let baseUrl: string

beforeEach(async () => {
  const config = parseDataPlatformConfig({})
  if (!config.ok) throw new Error("default config must parse")
  container = createDataPlatformContainer(config.value, fixedClock)
  await new Promise<void>((resolve) => container.server.listen(0, "127.0.0.1", resolve))
  baseUrl = `http://127.0.0.1:${(container.server.address() as AddressInfo).port}`
})

afterEach(async () => {
  await new Promise<void>((resolve) => container.server.close(() => resolve()))
})

describe("data-platform health endpoints", () => {
  it("serves contract-valid liveness", async () => {
    const response = await fetch(`${baseUrl}/health/live`)
    const validator = observabilityRegistry.validator(ObservabilityContractId.ServiceHealth)
    if (!validator.ok) throw new Error("missing contract")
    expect(validator.value.validate(await response.json()).ok).toBe(true)
  })

  it("reports unconfigured stores and unimplemented boundaries honestly", async () => {
    const response = await fetch(`${baseUrl}/health/ready`)
    const body = (await response.json()) as ServiceReadiness
    const validator = observabilityRegistry.validator(ObservabilityContractId.ServiceReadiness)
    if (!validator.ok) throw new Error("missing contract")
    expect(validator.value.validate(body).ok).toBe(true)
    const byName = new Map(body.dependencies.map((d) => [d.name, d]))
    for (const store of ["kafka", "clickhouse", "postgresql", "object-storage"]) {
      expect(byName.get(store)?.status).toBe("not-configured")
    }
    for (const boundary of platformBoundaries) {
      expect(byName.get(boundary)?.status).toBe("not-implemented")
    }
    expect(body.dependencies.some((d) => d.status === "ready")).toBe(false)
  })
})
