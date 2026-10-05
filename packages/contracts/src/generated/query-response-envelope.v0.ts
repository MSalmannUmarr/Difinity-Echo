// GENERATED FILE - DO NOT EDIT. Source: schemas/query/query-response-envelope.v0.schema.json
/* eslint-disable */

/**
 * DRAFT (v0). Envelope for every tenant-aware Query API and middleware response. Distinguishes success, successful absence and failure so an operational failure is never represented as an empty result. 'data' is validated by the query-specific schema that a later milestone defines.
 */
export type QueryResponseEnvelope = {
  schemaVersion: "0"
  correlationId: string
  outcome: "success" | "absent" | "failure"
  data?: {}
  error?: SafeError
}

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

export const queryResponseEnvelopeSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://contracts.difinity.ai/echo/query/query-response-envelope.v0.schema.json",
  "title": "QueryResponseEnvelope",
  "description": "DRAFT (v0). Envelope for every tenant-aware Query API and middleware response. Distinguishes success, successful absence and failure so an operational failure is never represented as an empty result. 'data' is validated by the query-specific schema that a later milestone defines.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "correlationId",
    "outcome"
  ],
  "properties": {
    "schemaVersion": {
      "const": "0"
    },
    "correlationId": {
      "type": "string",
      "pattern": "^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$"
    },
    "outcome": {
      "type": "string",
      "enum": [
        "success",
        "absent",
        "failure"
      ]
    },
    "data": {
      "type": "object"
    },
    "error": {
      "$ref": "../common/safe-error.v1.schema.json"
    }
  },
  "allOf": [
    {
      "if": {
        "properties": {
          "outcome": {
            "const": "success"
          }
        }
      },
      "then": {
        "required": [
          "data"
        ],
        "not": {
          "required": [
            "error"
          ]
        }
      }
    },
    {
      "if": {
        "properties": {
          "outcome": {
            "const": "absent"
          }
        }
      },
      "then": {
        "allOf": [
          {
            "not": {
              "required": [
                "data"
              ]
            }
          },
          {
            "not": {
              "required": [
                "error"
              ]
            }
          }
        ]
      }
    },
    {
      "if": {
        "properties": {
          "outcome": {
            "const": "failure"
          }
        }
      },
      "then": {
        "required": [
          "error"
        ],
        "not": {
          "required": [
            "data"
          ]
        }
      }
    }
  ]
} as const
