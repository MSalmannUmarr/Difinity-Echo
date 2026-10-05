import { err, ok, type Result } from "@difinity-echo/contracts"
import type { ActorContext, Capability } from "./actor-context.js"

export interface AuthorizationDenied {
  readonly kind: "authorization-denied"
}

/**
 * Capability-based authorisation (implementation brief §11.2). Which capability
 * each operation requires is decided per milestone, not here.
 */
export const authorize = (
  actor: ActorContext,
  required: Capability
): Result<ActorContext, AuthorizationDenied> =>
  actor.capabilities.has(required) ? ok(actor) : err({ kind: "authorization-denied" })
