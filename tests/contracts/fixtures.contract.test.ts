import { describe, expect, it } from "vitest"
import { contractSchemas, createContractRegistry } from "@difinity-echo/contracts"
import { observabilitySchemas } from "@difinity-echo/observability-contracts"
import {
  fixtureCatalogue,
  loadFixture,
  SYNTHETIC_PROHIBITED_MARKER,
} from "@difinity-echo/test-fixtures"

// One registry over every published schema, exactly as a consumer would build it.
const registry = createContractRegistry([...contractSchemas, ...observabilitySchemas])

const validatorFor = (contract: string) => {
  const result = registry.validator(contract)
  if (!result.ok) throw new Error(`Fixture references unknown contract ${contract}`)
  return result.value
}

describe("published contracts against shared fixtures", () => {
  it("covers every required fixture family", () => {
    const families = new Set(fixtureCatalogue.map((entry) => entry.id.split("/")[0]))
    for (const family of [
      "canonical-events",
      "prohibited-content",
      "tenant-isolation",
      "health",
      "admission",
      "query",
    ]) {
      expect(families, family).toContain(family)
    }
  })

  it.each(fixtureCatalogue.map((entry) => [entry.id, entry] as const))("%s", (_id, entry) => {
    const result = validatorFor(entry.contract).validate(loadFixture(entry))
    expect(result.ok, `${entry.id}: ${entry.reason}`).toBe(entry.expectation === "valid")
    if (!result.ok) {
      // Validation diagnostics must never echo rejected content.
      expect(JSON.stringify(result.error)).not.toContain(SYNTHETIC_PROHIBITED_MARKER)
    }
  })

  it("documents every structural privacy/tenancy gap as a known gap for Milestone 1", () => {
    const gaps = fixtureCatalogue.filter((entry) => entry.reason.startsWith("KNOWN GAP"))
    expect(gaps.map((entry) => entry.id).sort()).toEqual([
      "prohibited-content/known-gap-content-in-innocuous-attribute",
      "tenant-isolation/event-claims-tenant-in-attributes",
    ])
  })
})

describe("contract compatibility", () => {
  it("publishes a unique, versioned $id for every schema", () => {
    const ids = [...contractSchemas, ...observabilitySchemas].map((schema) => schema.$id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/\.v\d+\.schema\.json$/)
  })

  it("keeps every schema closed to unexpected fields", () => {
    for (const schema of [...contractSchemas, ...observabilitySchemas]) {
      const document = schema as unknown as {
        readonly type?: string
        readonly additionalProperties?: boolean
      }
      if (document.type === "object") expect(document.additionalProperties, schema.$id).toBe(false)
    }
  })
})
