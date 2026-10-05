import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { parseEdgeAgentConfig } from "../src/app/config/config.js"
import { SERVICE_VERSION } from "../src/app/config/service-version.js"

describe("edge-agent configuration", () => {
  it("applies safe local defaults", () => {
    expect(parseEdgeAgentConfig({})).toEqual({
      ok: true,
      value: { http: { host: "127.0.0.1", port: 4200 } },
    })
  })

  it("collects every invalid key instead of failing on the first", () => {
    const result = parseEdgeAgentConfig({ EDGE_AGENT_HOST: "bad host!", EDGE_AGENT_PORT: "70000" })
    expect(result.ok).toBe(false)
    if (!result.ok)
      expect(result.error.map((e) => e.key)).toEqual(["EDGE_AGENT_HOST", "EDGE_AGENT_PORT"])
  })

  it("keeps SERVICE_VERSION aligned with package.json", () => {
    const manifest = JSON.parse(
      readFileSync(new URL("../package.json", import.meta.url), "utf8")
    ) as {
      readonly version: string
    }
    expect(SERVICE_VERSION).toBe(manifest.version)
  })
})
