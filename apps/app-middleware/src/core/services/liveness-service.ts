import {
  buildLiveness,
  type ServiceHealth,
  type ServiceIdentity,
} from "@difinity-echo/observability-contracts"
import type { GetLivenessUseCase } from "../ports/in/service-health.js"
import type { Clock } from "../ports/out/clock.js"

export class LivenessService implements GetLivenessUseCase {
  readonly #service: ServiceIdentity
  readonly #clock: Clock

  constructor(service: ServiceIdentity, clock: Clock) {
    this.#service = service
    this.#clock = clock
  }

  execute(): ServiceHealth {
    return buildLiveness(this.#service, this.#clock.now())
  }
}
