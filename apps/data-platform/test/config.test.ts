import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { parseDataPlatformConfig } from "../src/app/config/config.js"
import { SERVICE_VERSION } from "../src/app/config/service-version.js"

describe("data-platform configuration", () => {
  it("treats absent infrastructure endpoints as not configured", () => {
    const result = parseDataPlatformConfig({})
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.http).toEqual({ host: "127.0.0.1", port: 4100 })
      expect(result.value.infrastructure.kafkaBootstrap).toBeUndefined()
      expect(result.value.infrastructure.clickHouseUrl).toBeUndefined()
    }
  })

  it("parses endpoints and URLs", () => {
    const result = parseDataPlatformConfig({
      DATA_PLATFORM_KAFKA_BOOTSTRAP: "127.0.0.1:59092",
      DATA_PLATFORM_CLICKHOUSE_URL: "http://127.0.0.1:58123",
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.infrastructure.kafkaBootstrap).toEqual({ host: "127.0.0.1", port: 59092 })
      expect(result.value.infrastructure.clickHouseUrl?.href).toBe("http://127.0.0.1:58123/")
    }
  })

  it("rejects URLs that embed credentials", () => {
    const result = parseDataPlatformConfig({
      DATA_PLATFORM_OBJECT_STORAGE_URL: "http://user:synthetic@127.0.0.1:59000",
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error[0]?.key).toBe("DATA_PLATFORM_OBJECT_STORAGE_URL")
      expect(JSON.stringify(result.error)).not.toContain("synthetic")
    }
  })

  it("rejects malformed endpoints and timeouts", () => {
    const result = parseDataPlatformConfig({
      DATA_PLATFORM_POSTGRES_ENDPOINT: "no-port",
      DATA_PLATFORM_PROBE_TIMEOUT_MS: "5",
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toHaveLength(2)
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
