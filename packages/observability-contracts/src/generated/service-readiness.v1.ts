// GENERATED FILE - DO NOT EDIT. Source: schemas/service-readiness.v1.schema.json
/* eslint-disable */

/**
 * Safe, typed classification of an operational failure. Raw causes stay in access-controlled diagnostics and are never exposed through this contract.
 */
export type FailureClassification =
  | "timeout"
  | "connection-refused"
  | "unreachable"
  | "unexpected-response"
  | "misconfigured"
  | "unexpected-defect"

/**
 * Readiness report: whether the service can serve its currently implemented responsibilities, with a safe per-dependency state. 'not-implemented' marks a boundary that exists in the architecture but has no implementation yet; it must never be reported as 'ready'. 'reachable' means network reachability only, without protocol-level verification.
 */
export interface ServiceReadiness {
  schemaVersion: "1"
  service: {
    component: "edge-agent" | "data-platform" | "app-middleware" | "web"
    version: string
  }
  status: "ready" | "not-ready"
  checkedAt: string
  /**
   * @maxItems 32
   */
  dependencies: DependencyReadiness[]
}
export interface DependencyReadiness {
  name: string
  kind: "infrastructure" | "service" | "boundary"
  required: boolean
  status: "ready" | "reachable" | "not-ready" | "not-configured" | "not-implemented"
  failure?: FailureClassification
}

export const serviceReadinessSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://contracts.difinity.ai/echo/observability/service-readiness.v1.schema.json",
  "title": "ServiceReadiness",
  "description": "Readiness report: whether the service can serve its currently implemented responsibilities, with a safe per-dependency state. 'not-implemented' marks a boundary that exists in the architecture but has no implementation yet; it must never be reported as 'ready'. 'reachable' means network reachability only, without protocol-level verification.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "service",
    "status",
    "checkedAt",
    "dependencies"
  ],
  "properties": {
    "schemaVersion": {
      "const": "1"
    },
    "service": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "component",
        "version"
      ],
      "properties": {
        "component": {
          "type": "string",
          "enum": [
            "edge-agent",
            "data-platform",
            "app-middleware",
            "web"
          ]
        },
        "version": {
          "type": "string",
          "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+(-[0-9A-Za-z.-]+)?$"
        }
      }
    },
    "status": {
      "type": "string",
      "enum": [
        "ready",
        "not-ready"
      ]
    },
    "checkedAt": {
      "type": "string",
      "format": "date-time"
    },
    "dependencies": {
      "type": "array",
      "maxItems": 32,
      "items": {
        "title": "DependencyReadiness",
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name",
          "kind",
          "required",
          "status"
        ],
        "properties": {
          "name": {
            "type": "string",
            "pattern": "^[a-z][a-z0-9-]{1,63}$"
          },
          "kind": {
            "type": "string",
            "enum": [
              "infrastructure",
              "service",
              "boundary"
            ]
          },
          "required": {
            "type": "boolean"
          },
          "status": {
            "type": "string",
            "enum": [
              "ready",
              "reachable",
              "not-ready",
              "not-configured",
              "not-implemented"
            ]
          },
          "failure": {
            "$ref": "failure-classification.v1.schema.json"
          }
        }
      }
    }
  }
} as const
