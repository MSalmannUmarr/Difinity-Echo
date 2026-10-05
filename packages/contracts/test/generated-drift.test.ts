import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const packageRoot = fileURLToPath(new URL("..", import.meta.url))

describe("schema-derived types", () => {
  it("are regenerated from the committed JSON Schemas", () => {
    const run = spawnSync(
      process.execPath,
      ["./bin/generate-contract-types.mjs", "schemas", "src/generated", "--check"],
      { cwd: packageRoot, encoding: "utf8" }
    )
    expect(run.stderr).toBe("")
    expect(run.status).toBe(0)
  })
})
