import {
  DependencyStatus,
  type DependencyReadiness,
  type FailureClassification,
} from "@difinity-echo/observability-contracts"
import type { DependencyProbe } from "../../../core/ports/out/dependency-probe.js"

export interface HttpHealthProbeOptions {
  readonly name: string
  readonly kind: DependencyReadiness["kind"]
  readonly required: boolean
  /** Fully resolved health URL, or undefined when the dependency is not configured. */
  readonly url: URL | undefined
  readonly timeoutMs: number
}

const classify = (error: unknown): FailureClassification => {
  if (error instanceof DOMException && error.name === "TimeoutError") return "timeout"
  const cause = (error as { readonly cause?: { readonly code?: string } }).cause
  if (cause?.code === "ECONNREFUSED") return "connection-refused"
  if (cause?.code === "ENOTFOUND" || cause?.code === "EHOSTUNREACH") return "unreachable"
  return "unexpected-response"
}

/** Protocol-level probe: an HTTP 2xx from the dependency's own health endpoint means `ready`. */
export class HttpHealthProbe implements DependencyProbe {
  readonly #options: HttpHealthProbeOptions

  constructor(options: HttpHealthProbeOptions) {
    this.#options = options
  }

  async probe(): Promise<DependencyReadiness> {
    const { name, kind, required, url, timeoutMs } = this.#options
    const base = { name, kind, required }
    if (url === undefined) return { ...base, status: DependencyStatus.NotConfigured }
    try {
      const response = await fetch(url, {
        method: "GET",
        redirect: "error",
        signal: AbortSignal.timeout(timeoutMs),
      })
      await response.body?.cancel()
      return response.ok
        ? { ...base, status: DependencyStatus.Ready }
        : { ...base, status: DependencyStatus.NotReady, failure: "unexpected-response" }
    } catch (error: unknown) {
      return { ...base, status: DependencyStatus.NotReady, failure: classify(error) }
    }
  }
}
