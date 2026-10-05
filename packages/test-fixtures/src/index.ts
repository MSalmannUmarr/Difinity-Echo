import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import type { JsonValue } from "@difinity-echo/contracts"

/** Whether the fixture must satisfy (`valid`) or be rejected by (`invalid`) its contract. */
export type FixtureExpectation = "valid" | "invalid"

export interface FixtureEntry {
  /** Stable identifier, e.g. `prohibited-content/top-level-prompt`. */
  readonly id: string
  /** Path relative to the package `fixtures/` directory. */
  readonly file: string
  /** `$id` of the JSON Schema contract the fixture exercises. */
  readonly contract: string
  readonly expectation: FixtureExpectation
  /** Why the fixture exists; `KNOWN GAP` marks behaviour a later milestone must close. */
  readonly reason: string
}

const fixturesRoot = new URL("../fixtures/", import.meta.url)

const readJson = (relativePath: string): JsonValue =>
  JSON.parse(readFileSync(new URL(relativePath, fixturesRoot), "utf8")) as JsonValue

const isFixtureEntry = (value: JsonValue): value is JsonValue & FixtureEntry => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false
  const record = value as { readonly [key: string]: JsonValue }
  return (
    typeof record["id"] === "string" &&
    typeof record["file"] === "string" &&
    typeof record["contract"] === "string" &&
    (record["expectation"] === "valid" || record["expectation"] === "invalid") &&
    typeof record["reason"] === "string"
  )
}

const loadCatalogue = (): readonly FixtureEntry[] => {
  const raw = readJson("catalogue.json")
  if (!Array.isArray(raw) || !raw.every(isFixtureEntry)) {
    throw new Error("fixtures/catalogue.json does not match the FixtureEntry shape")
  }
  return raw
}

/** Every registered fixture. The catalogue is the single index; unregistered files fail tests. */
export const fixtureCatalogue: readonly FixtureEntry[] = loadCatalogue()

export const loadFixture = (entry: FixtureEntry): JsonValue => readJson(entry.file)

export const fixturesDirectory: string = fileURLToPath(fixturesRoot)

/** Marker used in every prohibited-content fixture so leaks are easy to detect. */
export const SYNTHETIC_PROHIBITED_MARKER = "SYNTHETIC-PROHIBITED-CONTENT-NOT-REAL"
