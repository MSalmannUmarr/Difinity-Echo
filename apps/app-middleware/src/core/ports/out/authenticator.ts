import type { Result } from "@difinity-echo/contracts"
import type { ActorContext } from "../../domain/actor-context.js"

declare const credentialBrand: unique symbol

/**
 * Credential presented by the caller, opaque to the core. Only authentication
 * adapters may inspect it; it must never be logged or serialised.
 */
export type PresentedCredential = { readonly [credentialBrand]: "PresentedCredential" }

export type AuthenticationFailure =
  | { readonly kind: "authentication-not-configured" }
  | { readonly kind: "authentication-rejected" }
  | { readonly kind: "authentication-unavailable" }

/** Driven port: resolves a presented credential into an immutable ActorContext. */
export interface Authenticator {
  authenticate(
    credential: PresentedCredential
  ): Promise<Result<ActorContext, AuthenticationFailure>>
}
