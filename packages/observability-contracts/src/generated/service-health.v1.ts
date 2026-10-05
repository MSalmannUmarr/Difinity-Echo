// GENERATED FILE - DO NOT EDIT. Source: schemas/service-health.v1.schema.json
/* eslint-disable */

/**
 * Liveness report: the process is running and able to answer. Says nothing about dependencies; see ServiceReadiness.
 */
export interface ServiceHealth {
  schemaVersion: "1"
  service: {
    component: "edge-agent" | "data-platform" | "app-middleware" | "web"
    version: string
  }
  status: "alive"
  checkedAt: string
}

export const serviceHealthSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://contracts.difinity.ai/echo/observability/service-health.v1.schema.json",
  "title": "ServiceHealth",
  "description": "Liveness report: the process is running and able to answer. Says nothing about dependencies; see ServiceReadiness.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "service",
    "status",
    "checkedAt"
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
      "const": "alive"
    },
    "checkedAt": {
      "type": "string",
      "format": "date-time"
    }
  }
} as const
