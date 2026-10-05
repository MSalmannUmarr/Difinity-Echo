import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { analyseRepository, repositoryRoot, Rule, type Violation } from "./architecture-rules.js"

const root = repositoryRoot()
const fixture = (name: string): string => join(root, "tests/architecture/fixtures", name)

const rulesFor = (violations: readonly Violation[], file: string): Rule[] =>
  violations.filter((violation) => violation.file === file).map((violation) => violation.rule)

describe("repository architecture", () => {
  const result = analyseRepository(root)

  it("scans every application and shared package (a gate that scans nothing proves nothing)", () => {
    for (const area of [
      "apps/edge-agent/src/core/",
      "apps/edge-agent/src/app/",
      "apps/data-platform/src/core/",
      "apps/data-platform/src/app/adapters/",
      "apps/app-middleware/src/core/",
      "apps/app-middleware/src/app/",
      "apps/web/src/features/",
      "apps/web/src/shared/core/",
      "apps/web/app/",
      "packages/contracts/src/",
      "packages/observability-contracts/src/",
      "packages/test-fixtures/src/",
    ]) {
      expect(
        result.scannedFiles.some((file) => file.startsWith(area)),
        area
      ).toBe(true)
    }
  })

  it("has no dependency-rule violations", () => {
    expect(result.violations).toEqual([])
  })
})

describe("architecture rules reject forbidden dependencies (negative fixtures)", () => {
  const { violations } = analyseRepository(fixture("violating"))

  it.each<[string, Rule[]]>([
    [
      "apps/edge-agent/src/core/domain/uses-http.ts",
      [Rule.CoreExternalDependency, Rule.CoreToApplication, Rule.DomainDirection],
    ],
    ["apps/edge-agent/src/core/ports/out/port.ts", [Rule.PortDirection]],
    [
      "apps/edge-agent/src/core/services/service.ts",
      [Rule.CoreExternalDependency, Rule.DirectDataStoreAccess],
    ],
    [
      "apps/edge-agent/src/core/services/dynamic.ts",
      [Rule.CoreToApplication, Rule.ConcreteAdapterOutsideComposition],
    ],
    ["apps/edge-agent/src/app/adapters/outbound/sender.ts", [Rule.AdapterToWiring]],
    [
      "apps/edge-agent/src/app/config/config.ts",
      [Rule.EnvironmentAccessOutsideBoundary, Rule.CrossApplicationImport],
    ],
    ["apps/app-middleware/src/app/adapters/outbound/db.ts", [Rule.DirectDataStoreAccess]],
    ["apps/app-middleware/src/app/adapters/inbound/reexport.ts", [Rule.CrossApplicationImport]],
    ["apps/app-middleware/package.json", [Rule.ForbiddenManifestDependency]],
    [
      "packages/contracts/src/index.ts",
      [Rule.ContractPackageDependency, Rule.PackageImportsApplication],
    ],
    [
      "apps/web/src/features/order/domain/order.ts",
      [Rule.FrontendDomainPurity, Rule.CrossFeatureImport],
    ],
    ["apps/web/src/features/order/data/order-api.ts", [Rule.DataToPresentation]],
    ["apps/web/src/shared/core/models.ts", [Rule.SharedCorePurity, Rule.SharedToFeature]],
  ])("%s violates %j", (file, expected) => {
    const actual = rulesFor(violations, file)
    for (const rule of expected) expect(actual, `${file} should violate ${rule}`).toContain(rule)
  })

  it("exercises every rule family at least once", () => {
    const fired = new Set(violations.map((violation) => violation.rule))
    expect([...Object.values(Rule)].filter((rule) => !fired.has(rule))).toEqual([])
  })
})

describe("architecture rules accept permitted dependencies (positive fixtures)", () => {
  it("reports no violations for a compliant layout", () => {
    const { scannedFiles, violations } = analyseRepository(fixture("compliant"))
    expect(scannedFiles.length).toBeGreaterThan(5)
    expect(violations).toEqual([])
  })
})
