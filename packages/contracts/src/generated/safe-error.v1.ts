// GENERATED FILE - DO NOT EDIT. Source: schemas/common/safe-error.v1.schema.json
/* eslint-disable */

/**
 * Client-visible failure. Carries a typed code, a safe message and a correlation identifier. Never contains stack traces, raw causes, credentials or payload content.
 */
export interface SafeError {
  code:
    | "invalid-request"
    | "unauthenticated"
    | "forbidden"
    | "not-found"
    | "insufficient-evidence"
    | "stale-or-immature-data"
    | "dependency-unavailable"
    | "rate-limited"
    | "schema-incompatible"
    | "policy-incompatible"
    | "unexpected-defect"
  message: string
  correlationId: string
  retryAfterSeconds?: number
}

export const safeErrorSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://contracts.difinity.ai/echo/common/safe-error.v1.schema.json",
  "title": "SafeError",
  "description": "Client-visible failure. Carries a typed code, a safe message and a correlation identifier. Never contains stack traces, raw causes, credentials or payload content.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "code",
    "message",
    "correlationId"
  ],
  "properties": {
    "code": {
      "type": "string",
      "enum": [
        "invalid-request",
        "unauthenticated",
        "forbidden",
        "not-found",
        "insufficient-evidence",
        "stale-or-immature-data",
        "dependency-unavailable",
        "rate-limited",
        "schema-incompatible",
        "policy-incompatible",
        "unexpected-defect"
      ]
    },
    "message": {
      "type": "string",
      "minLength": 1,
      "maxLength": 300
    },
    "correlationId": {
      "type": "string",
      "pattern": "^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$"
    },
    "retryAfterSeconds": {
      "type": "integer",
      "minimum": 1,
      "maximum": 86400
    }
  }
} as const
