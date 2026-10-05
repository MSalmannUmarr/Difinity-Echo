// GENERATED FILE - DO NOT EDIT. Source: schemas/query/query-request-envelope.v0.schema.json
/* eslint-disable */

/**
 * DRAFT (v0). Envelope for a middleware-to-Query-API request. It carries no tenant or actor claims: the Query API derives tenant scope from the authenticated service call, never from request fields. Query names and parameter schemas are defined per milestone.
 */
export interface QueryRequestEnvelope {
  schemaVersion: "0"
  correlationId: string
  query: string
  parameters?: {}
}

export const queryRequestEnvelopeSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://contracts.difinity.ai/echo/query/query-request-envelope.v0.schema.json",
  "title": "QueryRequestEnvelope",
  "description": "DRAFT (v0). Envelope for a middleware-to-Query-API request. It carries no tenant or actor claims: the Query API derives tenant scope from the authenticated service call, never from request fields. Query names and parameter schemas are defined per milestone.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "correlationId",
    "query"
  ],
  "properties": {
    "schemaVersion": {
      "const": "0"
    },
    "correlationId": {
      "type": "string",
      "pattern": "^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$"
    },
    "query": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9-]*(\\.[a-z][a-z0-9-]*){1,3}$"
    },
    "parameters": {
      "type": "object"
    }
  }
} as const
