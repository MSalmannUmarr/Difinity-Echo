/**
 * Executable architecture rules for the Echo monorepo (Difinity standard §8).
 *
 * The checker reads every relevant source file, extracts static, dynamic,
 * re-export and require() dependencies with the TypeScript pre-processor, and
 * applies the dependency laws below. It runs against the real repository and
 * against intentionally violating fixture repositories, so a rule that never
 * fires (or scans no files) is detected.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { builtinModules } from "node:module"
import { dirname, join, posix, relative, sep } from "node:path"
import ts from "typescript"

export const Rule = {
  CrossApplicationImport: "cross-application-import",
  PackageImportsApplication: "package-imports-application",
  CoreExternalDependency: "core-external-dependency",
  CoreToApplication: "core-to-application",
  DomainDirection: "domain-direction",
  PortDirection: "port-direction",
  AdapterToWiring: "adapter-to-wiring",
  ConcreteAdapterOutsideComposition: "concrete-adapter-outside-composition",
  EnvironmentAccessOutsideBoundary: "environment-access-outside-boundary",
  DirectDataStoreAccess: "direct-data-store-access",
  ContractPackageDependency: "contract-package-dependency",
  CrossFeatureImport: "cross-feature-import",
  FrontendDomainPurity: "frontend-domain-purity",
  DataToPresentation: "data-to-presentation",
  SharedToFeature: "shared-to-feature",
  SharedCorePurity: "shared-core-purity",
  ForbiddenManifestDependency: "forbidden-manifest-dependency",
} as const

export type Rule = (typeof Rule)[keyof typeof Rule]

export interface Violation {
  readonly rule: Rule
  readonly file: string
  readonly target: string
}

export interface AnalysisResult {
  readonly scannedFiles: readonly string[]
  readonly violations: readonly Violation[]
}

/** Backend applications that follow the ports-and-adapters layout. */
const BACKEND_APPS = ["edge-agent", "data-platform", "app-middleware"] as const
const APPS = [...BACKEND_APPS, "web"] as const
/** Language-neutral contract packages: pure, no I/O, no storage/UI/framework dependencies. */
const CONTRACT_PACKAGES = ["contracts", "observability-contracts"] as const
const WORKSPACE_SCOPE = "@difinity-echo/"

/** Pure technical dependencies the backend core may import. */
const CORE_ALLOWED_EXTERNALS = new Set([
  `${WORKSPACE_SCOPE}contracts`,
  `${WORKSPACE_SCOPE}observability-contracts`,
])
const CONTRACT_PACKAGE_ALLOWED_EXTERNALS = new Set([
  "ajv",
  "ajv/dist/2020.js",
  "ajv-formats",
  `${WORKSPACE_SCOPE}contracts`,
])

/**
 * Data-store, event-log and object-storage clients. Only the Core Data Platform
 * may ever depend on them (and only from adapters).
 */
const DATA_STORE_CLIENT = [
  /^pg($|\/)/,
  /^postgres($|\/)/,
  /^@neondatabase\//,
  /^@clickhouse\//,
  /^clickhouse($|\/)/,
  /^kafkajs($|\/)/,
  /^@confluentinc\//,
  /^node-rdkafka($|\/)/,
  /^@aws-sdk\/client-s3($|\/)/,
  /^minio($|\/)/,
  /^@prisma\//,
  /^drizzle-orm($|\/)/,
  /^typeorm($|\/)/,
  /^sequelize($|\/)/,
  /^knex($|\/)/,
]
const FRAMEWORK_OR_UI = [
  /^react($|\/)/,
  /^react-dom($|\/)/,
  /^next($|\/)/,
  /^express($|\/)/,
  /^fastify($|\/)/,
]

const BUILTINS = new Set(builtinModules)
const isBuiltin = (specifier: string): boolean =>
  specifier.startsWith("node:") || BUILTINS.has(specifier.split("/")[0] ?? specifier)
const matchesAny = (specifier: string, patterns: readonly RegExp[]): boolean =>
  patterns.some((pattern) => pattern.test(specifier))

const SOURCE_EXTENSION = /\.(ts|tsx|mts|cts)$/
const IGNORED_DIRECTORIES = new Set(["node_modules", "dist", ".next", "coverage", "generated"])

const toPosix = (path: string): string => path.split(sep).join(posix.sep)

const listSourceFiles = (root: string, directory: string): string[] => {
  const absolute = join(root, directory)
  if (!existsSync(absolute)) return []
  return readdirSync(absolute).flatMap((name) => {
    if (IGNORED_DIRECTORIES.has(name)) return []
    const child = join(directory, name)
    if (statSync(join(root, child)).isDirectory()) return listSourceFiles(root, child)
    return SOURCE_EXTENSION.test(name) && !name.endsWith(".d.ts") ? [toPosix(child)] : []
  })
}

/** Production source roots. Tests may import across layers to exercise them. */
const sourceRoots = (root: string): string[] => [
  ...BACKEND_APPS.map((app) => `apps/${app}/src`),
  ...["app", "src", "components", "lib", "hooks"].map((dir) => `apps/web/${dir}`),
  ...readdirPackages(root).map((name) => `packages/${name}/src`),
]

const readdirPackages = (root: string): string[] => {
  const packages = join(root, "packages")
  return existsSync(packages)
    ? readdirSync(packages).filter((name) => statSync(join(packages, name)).isDirectory())
    : []
}

interface Dependency {
  readonly specifier: string
  /** Repository-relative POSIX path for internal dependencies; undefined for packages. */
  readonly internalPath: string | undefined
}

const resolveDependency = (file: string, specifier: string): Dependency => {
  if (specifier.startsWith(".")) {
    return { specifier, internalPath: posix.normalize(posix.join(posix.dirname(file), specifier)) }
  }
  if (specifier.startsWith("@/") && file.startsWith("apps/web/")) {
    return { specifier, internalPath: posix.join("apps/web", specifier.slice(2)) }
  }
  return { specifier, internalPath: undefined }
}

const extractDependencies = (root: string, file: string): { deps: Dependency[]; text: string } => {
  const text = readFileSync(join(root, file), "utf8")
  const info = ts.preProcessFile(text, true, true)
  const specifiers = [...info.importedFiles, ...info.referencedFiles].map((ref) => ref.fileName)
  return { deps: specifiers.map((specifier) => resolveDependency(file, specifier)), text }
}

const appOf = (path: string): string | undefined => /^apps\/([^/]+)\//.exec(path)?.[1]
const packageOf = (path: string): string | undefined => /^packages\/([^/]+)\//.exec(path)?.[1]
const workspaceTarget = (specifier: string): string | undefined =>
  specifier.startsWith(WORKSPACE_SCOPE)
    ? specifier.slice(WORKSPACE_SCOPE.length).split("/")[0]
    : undefined

const backendLayer = (path: string): string | undefined =>
  /^apps\/[^/]+\/src\/((core\/(domain|ports|services|shared))|(app\/(adapters|container|main|config)))\//.exec(
    path
  )?.[1]

const webFeature = (path: string): string | undefined =>
  /^apps\/web\/src\/features\/([^/]+)\//.exec(path)?.[1]
const webFeatureLayer = (path: string): string | undefined =>
  /^apps\/web\/src\/features\/[^/]+\/(data|domain|presentation)\//.exec(path)?.[1]

const checkFile = (file: string, deps: readonly Dependency[], text: string): Violation[] => {
  const violations: Violation[] = []
  const add = (rule: Rule, target: string): void => {
    violations.push({ rule, file, target })
  }
  const app = appOf(file)
  const pkg = packageOf(file)
  const layer = backendLayer(file)

  if (app !== undefined && /\bprocess\s*(\.\s*env\b|\[\s*["']env["']\s*\])/.test(text)) {
    const boundary =
      /^apps\/[^/]+\/src\/app\/main\//.test(file) || /^apps\/web\/(next\.config|app\/)/.test(file)
    if (!boundary) add(Rule.EnvironmentAccessOutsideBoundary, "process.env")
  }

  for (const { specifier, internalPath } of deps) {
    const targetApp = internalPath !== undefined ? appOf(internalPath) : undefined
    const targetWorkspace = workspaceTarget(specifier)
    const external = internalPath === undefined

    // Applications integrate through contracts, APIs and events, never implementation imports.
    if (app !== undefined) {
      if (targetApp !== undefined && targetApp !== app) add(Rule.CrossApplicationImport, specifier)
      if (targetWorkspace !== undefined && (APPS as readonly string[]).includes(targetWorkspace)) {
        add(Rule.CrossApplicationImport, specifier)
      }
    }
    if (pkg !== undefined) {
      if (
        targetApp !== undefined ||
        (targetWorkspace !== undefined && (APPS as readonly string[]).includes(targetWorkspace))
      ) {
        add(Rule.PackageImportsApplication, specifier)
      }
      if (
        (CONTRACT_PACKAGES as readonly string[]).includes(pkg) &&
        external &&
        !CONTRACT_PACKAGE_ALLOWED_EXTERNALS.has(specifier)
      ) {
        add(Rule.ContractPackageDependency, specifier)
      }
    }

    // Only the Core Data Platform's adapters may talk to data stores directly.
    if (external && matchesAny(specifier, DATA_STORE_CLIENT)) {
      const permitted = app === "data-platform" && layer === "app/adapters"
      if (!permitted) add(Rule.DirectDataStoreAccess, specifier)
    }

    // Backend ports-and-adapters laws (standard §6.2, §8.1).
    if (layer?.startsWith("core/")) {
      if (external && !CORE_ALLOWED_EXTERNALS.has(specifier))
        add(Rule.CoreExternalDependency, specifier)
      if (!external && !/^apps\/[^/]+\/src\/core\//.test(internalPath ?? ""))
        add(Rule.CoreToApplication, specifier)
      if (!external && internalPath !== undefined) {
        const targetLayer = backendLayer(`${internalPath}.ts`) ?? backendLayer(`${internalPath}/x`)
        if (
          layer === "core/domain" &&
          targetLayer !== "core/domain" &&
          targetLayer !== "core/shared"
        ) {
          add(Rule.DomainDirection, specifier)
        }
        if (
          layer === "core/ports" &&
          !["core/domain", "core/ports", "core/shared"].includes(targetLayer ?? "")
        ) {
          add(Rule.PortDirection, specifier)
        }
        if (layer === "core/shared" && targetLayer !== "core/shared")
          add(Rule.DomainDirection, specifier)
      }
    }
    if (
      layer === "app/adapters" &&
      internalPath !== undefined &&
      /\/src\/app\/(container|main|config)\//.test(`${internalPath}/`)
    ) {
      add(Rule.AdapterToWiring, specifier)
    }
    if (
      layer !== undefined &&
      layer !== "app/adapters" &&
      layer !== "app/container" &&
      internalPath !== undefined &&
      /\/src\/app\/adapters\//.test(`${internalPath}/`)
    ) {
      add(Rule.ConcreteAdapterOutsideComposition, specifier)
    }

    // Frontend Feature-Sliced Design laws (standard §6.3, §8.1).
    if (app === "web") {
      const feature = webFeature(file)
      const featureLayer = webFeatureLayer(file)
      const targetFeature = internalPath !== undefined ? webFeature(`${internalPath}/x`) : undefined
      if (feature !== undefined && targetFeature !== undefined && targetFeature !== feature) {
        add(Rule.CrossFeatureImport, specifier)
      }
      if (featureLayer === "domain") {
        const ownDomain =
          internalPath?.startsWith(`apps/web/src/features/${feature}/domain`) ?? false
        const sharedCore = internalPath?.startsWith("apps/web/src/shared/core") ?? false
        if (!(ownDomain || sharedCore)) add(Rule.FrontendDomainPurity, specifier)
      }
      if (
        featureLayer === "data" &&
        internalPath !== undefined &&
        /\/presentation(\/|$)/.test(internalPath)
      ) {
        add(Rule.DataToPresentation, specifier)
      }
      if (file.startsWith("apps/web/src/shared/") && targetFeature !== undefined) {
        add(Rule.SharedToFeature, specifier)
      }
      if (file.startsWith("apps/web/src/shared/core/")) {
        const pure = internalPath?.startsWith("apps/web/src/shared/core") ?? false
        if (!pure || matchesAny(specifier, FRAMEWORK_OR_UI)) add(Rule.SharedCorePurity, specifier)
      }
    }
    if (
      pkg !== undefined &&
      (CONTRACT_PACKAGES as readonly string[]).includes(pkg) &&
      (isBuiltin(specifier) || matchesAny(specifier, FRAMEWORK_OR_UI))
    ) {
      add(Rule.ContractPackageDependency, specifier)
    }
  }
  return violations
}

interface Manifest {
  readonly dependencies?: Readonly<Record<string, string>>
  readonly devDependencies?: Readonly<Record<string, string>>
}

/** Dependency-manifest checks: forbidden clients cannot even be installed in the wrong deployable. */
const checkManifests = (root: string): Violation[] => {
  const manifests = [
    ...APPS.map((app) => `apps/${app}/package.json`),
    ...readdirPackages(root).map((name) => `packages/${name}/package.json`),
  ].filter((path) => existsSync(join(root, path)))
  return manifests.flatMap((path) => {
    const manifest = JSON.parse(readFileSync(join(root, path), "utf8")) as Manifest
    const names = Object.keys({ ...manifest.dependencies, ...manifest.devDependencies })
    const owner = appOf(path) ?? packageOf(path)
    return names.flatMap((name): Violation[] => {
      if (matchesAny(name, DATA_STORE_CLIENT) && owner !== "data-platform") {
        return [{ rule: Rule.ForbiddenManifestDependency, file: path, target: name }]
      }
      const workspace = workspaceTarget(name)
      if (workspace !== undefined && (APPS as readonly string[]).includes(workspace)) {
        return [{ rule: Rule.ForbiddenManifestDependency, file: path, target: name }]
      }
      return []
    })
  })
}

export const analyseRepository = (root: string): AnalysisResult => {
  const scannedFiles = sourceRoots(root).flatMap((dir) => listSourceFiles(root, dir))
  const violations = scannedFiles.flatMap((file) => {
    const { deps, text } = extractDependencies(root, file)
    return checkFile(file, deps, text)
  })
  return { scannedFiles, violations: [...violations, ...checkManifests(root)] }
}

export const repositoryRoot = (): string => {
  let directory = dirname(new URL(import.meta.url).pathname)
  while (!existsSync(join(directory, "pnpm-workspace.yaml"))) {
    const parent = dirname(directory)
    if (parent === directory) throw new Error("repository root not found")
    directory = parent
  }
  return directory
}

export const relativeToRoot = (root: string, path: string): string => toPosix(relative(root, path))
