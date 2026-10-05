#!/usr/bin/env node
// Generates TypeScript types and embedded schema constants from the canonical
// JSON Schema files. JSON Schema is the source of truth; generated files are
// committed and checked for drift by each package's contract tests.
//
// Usage: generate-contract-types <schemaDir> <outDir> [--check]
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises"
import { join, relative, resolve, basename, dirname } from "node:path"
import { compile } from "json-schema-to-typescript"

const BANNER = "// GENERATED FILE - DO NOT EDIT. Source: "

const toCamel = (title) => title.charAt(0).toLowerCase() + title.slice(1)

async function listSchemas(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) return listSchemas(path)
      return entry.name.endsWith(".schema.json") ? [path] : []
    })
  )
  return nested.flat().sort()
}

async function renderAll(schemaDir) {
  const root = resolve(schemaDir)
  const files = await listSchemas(root)
  const outputs = new Map()
  for (const file of files) {
    const schema = JSON.parse(await readFile(file, "utf8"))
    if (typeof schema.title !== "string") throw new Error(`${file}: missing title`)
    const types = await compile(schema, schema.title, {
      cwd: dirname(file),
      bannerComment: "",
      additionalProperties: false,
      declareExternallyReferenced: true,
      strictIndexSignatures: true,
      unknownAny: true,
      style: { semi: false, printWidth: 100, trailingComma: "es5" },
    })
    const source = relative(resolve(root, ".."), file)
    const name = basename(file, ".schema.json")
    const body = [
      `${BANNER}${source}`,
      "/* eslint-disable */",
      "",
      types.trim(),
      "",
      `export const ${toCamel(schema.title)}Schema = ${JSON.stringify(schema, null, 2)} as const`,
      "",
    ].join("\n")
    outputs.set(`${name}.ts`, body)
  }
  return outputs
}

async function main() {
  const [schemaDir, outDir, flag] = process.argv.slice(2)
  if (!schemaDir || !outDir) {
    console.error("usage: generate-contract-types <schemaDir> <outDir> [--check]")
    process.exit(2)
  }
  const outputs = await renderAll(schemaDir)
  if (flag === "--check") {
    const stale = []
    for (const [file, content] of outputs) {
      const current = await readFile(join(outDir, file), "utf8").catch(() => "")
      if (current !== content) stale.push(file)
    }
    if (stale.length > 0) {
      console.error(
        `Generated contract types are stale: ${stale.join(", ")}. Run the generate script.`
      )
      process.exit(1)
    }
    console.info(`Generated contract types are current (${outputs.size} files).`)
    return
  }
  await mkdir(outDir, { recursive: true })
  for (const [file, content] of outputs) await writeFile(join(outDir, file), content)
  console.info(`Wrote ${outputs.size} generated files to ${outDir}`)
}

await main()
