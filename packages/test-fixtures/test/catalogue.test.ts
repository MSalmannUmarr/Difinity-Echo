import { readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { describe, expect, it } from "vitest"
import { fixtureCatalogue, fixturesDirectory, loadFixture } from "../src/index.js"

const listJson = (directory: string): string[] =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name)
    if (statSync(path).isDirectory()) return listJson(path)
    return name.endsWith(".json") ? [relative(fixturesDirectory, path)] : []
  })

describe("fixture catalogue", () => {
  it("registers every fixture file exactly once", () => {
    const files = listJson(fixturesDirectory).filter((file) => file !== "catalogue.json")
    const registered = fixtureCatalogue.map((entry) => entry.file)
    expect(new Set(registered).size).toBe(registered.length)
    expect([...registered].sort()).toEqual([...files].sort())
  })

  it("loads every registered fixture as JSON", () => {
    for (const entry of fixtureCatalogue) expect(loadFixture(entry)).toBeDefined()
  })

  it("contains no material that resembles real credentials", () => {
    const credentialPatterns = [
      /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
      /\bAKIA[0-9A-Z]{16}\b/,
      /\bgh[pousr]_[A-Za-z0-9]{36,}\b/,
      /\bsk-[A-Za-z0-9]{20,}\b/,
      /\bxox[abpr]-[A-Za-z0-9-]{10,}\b/,
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
    ]
    for (const entry of fixtureCatalogue) {
      const text = JSON.stringify(loadFixture(entry))
      for (const pattern of credentialPatterns) expect(text, entry.id).not.toMatch(pattern)
    }
  })
})
