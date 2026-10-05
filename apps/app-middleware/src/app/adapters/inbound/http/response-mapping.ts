import type { SafeError } from "@difinity-echo/contracts"
import type { CorrelationId } from "@difinity-echo/observability-contracts"
import type { AuthorizationDenied } from "../../../../core/domain/authorization.js"
import type { AuthenticationFailure } from "../../../../core/ports/out/authenticator.js"
import type { QueryApiFailure } from "../../../../core/ports/out/query-api-client.js"

export type MiddlewareFailure = AuthenticationFailure | AuthorizationDenied | QueryApiFailure

export interface MappedFailure {
  readonly httpStatus: number
  readonly body: SafeError
}

/**
 * Maps typed failures to client-safe responses. Distinguishes authentication,
 * authorisation and dependency failures; never reports a failure as empty data
 * and never includes raw causes (standard §11.5).
 */
export const mapFailure = (
  failure: MiddlewareFailure,
  correlationId: CorrelationId
): MappedFailure => {
  const respond = (
    httpStatus: number,
    code: SafeError["code"],
    message: string
  ): MappedFailure => ({
    httpStatus,
    body: { code, message, correlationId },
  })
  switch (failure.kind) {
    case "authentication-not-configured":
    case "authentication-rejected":
      return respond(401, "unauthenticated", "Authentication is required.")
    case "authentication-unavailable":
      return respond(503, "dependency-unavailable", "Authentication is temporarily unavailable.")
    case "authorization-denied":
      return respond(403, "forbidden", "You do not have access to this resource.")
    case "query-api-unreachable":
      return respond(503, "dependency-unavailable", "Echo analytics are temporarily unavailable.")
    case "query-api-invalid-response":
      return respond(502, "unexpected-defect", "Echo analytics returned an unexpected response.")
  }
}
