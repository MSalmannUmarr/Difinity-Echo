import { err, type Result } from "@difinity-echo/contracts"
import type { ActorContext } from "../../../core/domain/actor-context.js"
import type {
  AuthenticationFailure,
  Authenticator,
  PresentedCredential,
} from "../../../core/ports/out/authenticator.js"

/**
 * Fail-closed authenticator used until the browser/SSO provider is selected
 * (open decision). Every authentication attempt is rejected, so no protected
 * operation can succeed without a real identity integration.
 */
export class UnconfiguredAuthenticator implements Authenticator {
  authenticate(
    _credential: PresentedCredential
  ): Promise<Result<ActorContext, AuthenticationFailure>> {
    return Promise.resolve(err({ kind: "authentication-not-configured" }))
  }
}
