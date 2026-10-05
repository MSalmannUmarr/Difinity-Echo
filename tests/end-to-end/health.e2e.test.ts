import { describe, expect, it } from "vitest"
import { createContractRegistry } from "@difinity-echo/contracts"
import {
  ObservabilityContractId,
  observabilitySchemas,
  type ServiceReadiness,
} from "@difinity-echo/observability-contracts"

// Runs only against a stack started by scripts/bootstrap.sh (scripts/demo.sh sets ECHO_E2E=1).
const enabled = process.env["ECHO_E2E"] === "1"
const url = (key: string, fallback: string): string => process.env[key] ?? fallback

const services = {
  edge: url("ECHO_EDGE_URL", "http://127.0.0.1:4200"),
  platform: url("ECHO_DATA_PLATFORM_URL", "http://127.0.0.1:4100"),
  middleware: url("ECHO_MIDDLEWARE_URL", "http://127.0.0.1:4000"),
  web: url("ECHO_WEB_URL", "http://127.0.0.1:3000"),
}

const registry = createContractRegistry(observabilitySchemas)
const validate = (id: string, body: unknown): boolean => {
  const validator = registry.validator(id)
  if (!validator.ok) throw new Error(`missing contract ${id}`)
  return validator.value.validate(body).ok
}

describe.skipIf(!enabled)("Milestone 0 stack (end-to-end)", () => {
  it.each(Object.entries(services))("%s reports contract-valid liveness", async (_name, base) => {
    const path = base === services.web ? "/api/health/live" : "/health/live"
    const response = await fetch(`${base}${path}`)
    expect(response.status).toBe(200)
    expect(validate(ObservabilityContractId.ServiceHealth, await response.json())).toBe(true)
  })

  it.each([services.edge, services.platform, services.middleware])(
    "%s reports contract-valid readiness",
    async (base) => {
      const response = await fetch(`${base}/health/ready`)
      const body = (await response.json()) as ServiceReadiness
      expect(validate(ObservabilityContractId.ServiceReadiness, body)).toBe(true)
      expect(
        body.dependencies.filter((d) => d.status === "not-implemented").every((d) => !d.required)
      ).toBe(true)
    }
  )

  it("middleware readiness reflects the Query API (Data Platform) through its contract", async () => {
    const body = (await (
      await fetch(`${services.middleware}/health/ready`)
    ).json()) as ServiceReadiness
    expect(body.dependencies.find((d) => d.name === "query-api")?.status).toBe("ready")
  })

  it("the web application serves its existing Overview route", async () => {
    const response = await fetch(`${services.web}/`)
    expect(response.status).toBe(200)
    expect(await response.text()).toContain("Echo")
  })
})
