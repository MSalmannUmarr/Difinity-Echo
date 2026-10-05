import { spawnSync } from "node:child_process"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
  buildLiveness,
  buildReadiness,
  CorrelationId,
  DependencyKind,
  DependencyStatus,
  ObservabilityContractId,
  observabilityRegistry,
  type DependencyReadiness,
  type ServiceReadiness,
} from "../src/index.js"

const service = { component: "data-platform", version: "0.0.0" } as const
const at = new Date("2026-01-15T09:30:00Z")
const dependency = (
  status: DependencyReadiness["status"],
  required: boolean
): DependencyReadiness => ({ name: "query-api", kind: DependencyKind.Service, required, status })

describe("readiness policy", () => {
  it("is ready when there are no required dependencies", () => {
    const report = buildReadiness(service, [dependency(DependencyStatus.NotImplemented, false)], at)
    expect(report.status).toBe("ready")
  })

  it.each([
    DependencyStatus.NotImplemented,
    DependencyStatus.NotConfigured,
    DependencyStatus.NotReady,
    DependencyStatus.Reachable,
  ])("is not ready when a required dependency is %s", (status) => {
    expect(buildReadiness(service, [dependency(status, true)], at).status).toBe("not-ready")
  })

  it("is ready when every required dependency is ready", () => {
    expect(buildReadiness(service, [dependency(DependencyStatus.Ready, true)], at).status).toBe(
      "ready"
    )
  })

  it("produces reports that satisfy the published schemas", () => {
    const readiness = observabilityRegistry.validator<ServiceReadiness>(
      ObservabilityContractId.ServiceReadiness
    )
    const liveness = observabilityRegistry.validator(ObservabilityContractId.ServiceHealth)
    if (!readiness.ok || !liveness.ok) throw new Error("contracts missing")
    const report = buildReadiness(service, [dependency(DependencyStatus.Ready, true)], at)
    expect(readiness.value.validate(report).ok).toBe(true)
    expect(liveness.value.validate(buildLiveness(service, at)).ok).toBe(true)
  })
})

describe("correlation id", () => {
  it.each(["synthetic-correlation-1", "0b2f6c9e-2d7a-4e0f-9a7c-1b2c3d4e5f60"])(
    "accepts %s",
    (raw) => {
      expect(CorrelationId.parse(raw).ok).toBe(true)
    }
  )

  it.each(["", "short", "has spaces in it", "x".repeat(200), "../../etc/passwd"])(
    "rejects %j",
    (raw) => {
      expect(CorrelationId.parse(raw).ok).toBe(false)
    }
  )
})

describe("schema-derived types", () => {
  it("are regenerated from the committed JSON Schemas", () => {
    const require = createRequire(import.meta.url)
    const generator = require.resolve("@difinity-echo/contracts/codegen")
    const run = spawnSync(process.execPath, [generator, "schemas", "src/generated", "--check"], {
      cwd: fileURLToPath(new URL("..", import.meta.url)),
      encoding: "utf8",
    })
    expect(run.stderr).toBe("")
    expect(run.status).toBe(0)
  })
})
