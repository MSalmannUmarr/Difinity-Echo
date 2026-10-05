import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { describe, expect, it } from "vitest"

const featureRoot = join(process.cwd(), "src/features")

const sourceFiles = (directory: string): string[] => readdirSync(directory).flatMap((name) => {
  const path = join(directory, name)
  return statSync(path).isDirectory() ? sourceFiles(path) : /\.(ts|tsx)$/.test(name) ? [path] : []
})

describe("feature architecture", () => {
  it("keeps feature packages decoupled", () => {
    const violations = sourceFiles(featureRoot).flatMap((path) => {
      const feature = relative(featureRoot, path).split("/")[0]
      const imports = [...readFileSync(path, "utf8").matchAll(/from\s+["']@\/src\/features\/([^/]+)/g)]
      return imports.filter((match) => match[1] !== feature).map((match) => `${relative(process.cwd(), path)} imports ${match[1]}`)
    })

    expect(violations).toEqual([])
  })

  it("keeps domain modules free of framework and infrastructure imports", () => {
    const domainFiles = sourceFiles(featureRoot).filter((path) => path.includes("/domain/"))
    const violations = domainFiles.flatMap((path) => {
      const source = readFileSync(path, "utf8")
      return [/from\s+["']react/, /from\s+["']next/, /\/data\//, /\/presentation\//]
        .filter((pattern) => pattern.test(source))
        .map((pattern) => `${relative(process.cwd(), path)} matches ${pattern}`)
    })

    expect(violations).toEqual([])
  })
})
