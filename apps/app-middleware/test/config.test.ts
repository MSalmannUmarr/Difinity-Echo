import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { parseAppMiddlewareConfig } from "../src/app/config/config.js"
import { SERVICE_VERSION } from "../src/app/config/service-version.js"

describe("app-middleware configuration", () => {
  it("requires the Query API URL", () => {
    const result = parseAppMiddlewareConfig({})
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.map((e) => e.key)).toEqual(["APP_MIDDLEWARE_QUERY_API_URL"])
  })

  it("parses a complete configuration", () => {
    const result = parseAppMiddlewareConfig({
      APP_MIDDLEWARE_QUERY_API_URL: "http://127.0.0.1:4100",
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.http).toEqual({ host: "127.0.0.1", port: 4000 })
      expect(result.value.queryApi.baseUrl.href).toBe("http://127.0.0.1:4100/")
      expect(result.value.queryApi.timeoutMs).toBe(2000)
    }
  })

  it("rejects invalid timeouts", () => {
    const result = parseAppMiddlewareConfig({
      APP_MIDDLEWARE_QUERY_API_URL: "http://127.0.0.1:4100",
      APP_MIDDLEWARE_QUERY_API_TIMEOUT_MS: "abc",
    })
    expect(result.ok).toBe(false)
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
