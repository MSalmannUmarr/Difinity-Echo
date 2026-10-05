import { connect } from "node:net"
import {
  DependencyStatus,
  type DependencyReadiness,
  type FailureClassification,
} from "@difinity-echo/observability-contracts"
import type { DependencyProbe } from "../../../core/ports/out/dependency-probe.js"

/** Host and port of the dependency, supplied by the composition root. */
export interface TcpEndpoint {
  readonly host: string
  readonly port: number
}

export interface TcpReachabilityProbeOptions {
  readonly name: string
  readonly kind: DependencyReadiness["kind"]
  readonly required: boolean
  readonly endpoint: TcpEndpoint | undefined
  readonly timeoutMs: number
}

const classify = (code: string | undefined): FailureClassification => {
  if (code === "ECONNREFUSED") return "connection-refused"
  if (code === "ENOTFOUND" || code === "EHOSTUNREACH" || code === "ENETUNREACH")
    return "unreachable"
  return "unexpected-response"
}

/**
 * Network-level probe. A successful TCP connection proves reachability only,
 * so it reports `reachable`, never `ready`: no protocol handshake,
 * authentication or schema state is verified in Milestone 0.
 */
export class TcpReachabilityProbe implements DependencyProbe {
  readonly #options: TcpReachabilityProbeOptions

  constructor(options: TcpReachabilityProbeOptions) {
    this.#options = options
  }

  probe(): Promise<DependencyReadiness> {
    const { name, kind, required, endpoint, timeoutMs } = this.#options
    const base = { name, kind, required }
    if (endpoint === undefined) {
      return Promise.resolve({ ...base, status: DependencyStatus.NotConfigured })
    }
    return new Promise((resolve) => {
      const socket = connect({ host: endpoint.host, port: endpoint.port })
      const finish = (result: DependencyReadiness): void => {
        socket.destroy()
        resolve(result)
      }
      socket.setTimeout(timeoutMs, () =>
        finish({ ...base, status: DependencyStatus.NotReady, failure: "timeout" })
      )
      socket.once("connect", () => finish({ ...base, status: DependencyStatus.Reachable }))
      socket.once("error", (error: NodeJS.ErrnoException) =>
        finish({ ...base, status: DependencyStatus.NotReady, failure: classify(error.code) })
      )
    })
  }
}
