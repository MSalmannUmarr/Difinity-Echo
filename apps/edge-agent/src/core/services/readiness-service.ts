import {
  buildReadiness,
  type ServiceIdentity,
  type ServiceReadiness,
} from "@difinity-echo/observability-contracts"
import type { GetReadinessUseCase } from "../ports/in/service-health.js"
import type { Clock } from "../ports/out/clock.js"
import type { DependencyProbe } from "../ports/out/dependency-probe.js"

export class ReadinessService implements GetReadinessUseCase {
  readonly #service: ServiceIdentity
  readonly #clock: Clock
  readonly #probes: readonly DependencyProbe[]

  constructor(service: ServiceIdentity, clock: Clock, probes: readonly DependencyProbe[]) {
    this.#service = service
    this.#clock = clock
    this.#probes = [...probes]
  }

  async execute(): Promise<ServiceReadiness> {
    const dependencies = await Promise.all(this.#probes.map((probe) => probe.probe()))
    return buildReadiness(this.#service, dependencies, this.#clock.now())
  }
}
