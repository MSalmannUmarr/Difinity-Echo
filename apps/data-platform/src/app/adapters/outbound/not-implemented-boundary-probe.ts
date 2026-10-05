import {
  DependencyKind,
  DependencyStatus,
  type DependencyReadiness,
} from "@difinity-echo/observability-contracts"
import type { DependencyProbe } from "../../../core/ports/out/dependency-probe.js"

/**
 * Reports an architectural boundary that exists in the design but has no
 * implementation yet. It is never `required` and never reports `ready`.
 */
export class NotImplementedBoundaryProbe implements DependencyProbe {
  readonly #name: string

  constructor(name: string) {
    this.#name = name
  }

  probe(): Promise<DependencyReadiness> {
    return Promise.resolve({
      name: this.#name,
      kind: DependencyKind.Boundary,
      required: false,
      status: DependencyStatus.NotImplemented,
    })
  }
}
