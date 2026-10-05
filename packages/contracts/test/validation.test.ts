import { describe, expect, it } from "vitest"
import {
  ContractId,
  contractsRegistry,
  createContractRegistry,
  errorCodes,
  type CanonicalEventEnvelope,
} from "../src/index.js"

const validEvent: CanonicalEventEnvelope = {
  schemaVersion: "0",
  eventId: "00000000-0000-4000-8000-0000000000aa",
  eventType: "synthetic.ai-session.started",
  occurredAt: "2026-01-15T09:30:00Z",
  idempotencyKey: "synthetic-collector:0000000000aa",
  collector: { name: "synthetic-collector", version: "0.0.0" },
  policyVersion: "0.0.0",
  attributes: { provider: "synthetic-provider" },
}

const eventValidator = () => {
  const result = contractsRegistry.validator<CanonicalEventEnvelope>(
    ContractId.CanonicalEventEnvelope
  )
  if (!result.ok) throw new Error("canonical event contract missing from registry")
  return result.value
}

describe("contract registry", () => {
  it("accepts a valid canonical event envelope", () => {
    expect(eventValidator().validate(validEvent)).toEqual({ ok: true, value: validEvent })
  })

  it("returns a typed failure instead of throwing for invalid input", () => {
    const result = eventValidator().validate({ ...validEvent, eventId: "not-a-uuid" })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.kind).toBe("contract-validation-failure")
      expect(result.error.issues.map((issue) => issue.path)).toContain("/eventId")
    }
  })

  it("never echoes the rejected value in validation issues", () => {
    const marker = "SYNTHETIC-PROHIBITED-CONTENT-NOT-REAL"
    const result = eventValidator().validate({
      ...validEvent,
      prompt: marker,
      attributes: { transcript: marker },
    })
    expect(result.ok).toBe(false)
    expect(JSON.stringify(result)).not.toContain(marker)
  })

  it("rejects a payload tenant claim because tenancy is derived at admission", () => {
    const result = eventValidator().validate({ ...validEvent, tenantId: "synthetic-tenant" })
    expect(result.ok).toBe(false)
  })

  it("reports an unknown contract as a typed error", () => {
    const result = contractsRegistry.validator("https://example.invalid/unknown.json")
    expect(result).toEqual({
      ok: false,
      error: { kind: "unknown-contract", schemaId: "https://example.invalid/unknown.json" },
    })
  })

  it("resolves cross-schema references by $id", () => {
    const result = contractsRegistry.validator(ContractId.QueryResponseEnvelope)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const failure = result.value.validate({
      schemaVersion: "0",
      correlationId: "synthetic-correlation-1",
      outcome: "failure",
      error: { code: "not-a-code", message: "x", correlationId: "synthetic-correlation-1" },
    })
    expect(failure.ok).toBe(false)
  })

  it("compiles every published schema", () => {
    for (const schemaId of contractsRegistry.schemaIds) {
      expect(contractsRegistry.validator(schemaId).ok, schemaId).toBe(true)
    }
  })

  it("isolates registries", () => {
    expect(createContractRegistry([]).schemaIds).toEqual([])
  })

  it("publishes the error taxonomy from the implementation brief", () => {
    expect(errorCodes).toContain("insufficient-evidence")
    expect(errorCodes).toContain("dependency-unavailable")
    expect(errorCodes).not.toContain("not-ready")
  })
})
