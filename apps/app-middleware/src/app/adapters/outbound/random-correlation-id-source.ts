import { randomUUID } from "node:crypto"
import { CorrelationId } from "@difinity-echo/observability-contracts"
import type { CorrelationIdSource } from "../../../core/ports/out/correlation-id-source.js"

export class RandomCorrelationIdSource implements CorrelationIdSource {
  next(): CorrelationId {
    const parsed = CorrelationId.parse(randomUUID())
    if (!parsed.ok) throw new Error("Generated correlation id failed validation")
    return parsed.value
  }
}
