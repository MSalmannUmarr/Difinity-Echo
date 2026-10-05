// GENERATED FILE - DO NOT EDIT. Source: schemas/operation-event.v1.schema.json
/* eslint-disable */

/**
 * Opaque identifier propagated across Edge, Data Platform, Middleware and Web for one request or operation. Carries no tenant, actor or payload information.
 */
export type CorrelationId = string
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
 * Typed progress event for a request or long-running operation (implementation brief §13.3). Tenant-scoped, redacted diagnostics only; never carries payload content, credentials or raw errors. Actor attribution is added when the authenticated actor context contract exists (Milestone 1+).
 */
export interface OperationEvent {
  schemaVersion: "1"
  event:
    | "RequestStarted"
    | "OperationStarted"
    | "OperationProgressed"
    | "OperationCompleted"
    | "RequestFailed"
  correlationId: CorrelationId
  operation: string
  component: "edge-agent" | "data-platform" | "app-middleware" | "web"
  targetComponent?: "edge-agent" | "data-platform" | "app-middleware" | "web"
  phase: string
  occurredAt: string
  elapsedMs: number
  deadlineAt?: string
  failure?: FailureClassification
}

export const operationEventSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://contracts.difinity.ai/echo/observability/operation-event.v1.schema.json",
  "title": "OperationEvent",
  "description": "Typed progress event for a request or long-running operation (implementation brief §13.3). Tenant-scoped, redacted diagnostics only; never carries payload content, credentials or raw errors. Actor attribution is added when the authenticated actor context contract exists (Milestone 1+).",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "event",
    "correlationId",
    "operation",
    "component",
    "phase",
    "occurredAt",
    "elapsedMs"
  ],
  "properties": {
    "schemaVersion": {
      "const": "1"
    },
    "event": {
      "type": "string",
      "enum": [
        "RequestStarted",
        "OperationStarted",
        "OperationProgressed",
        "OperationCompleted",
        "RequestFailed"
      ]
    },
    "correlationId": {
      "$ref": "correlation-id.v1.schema.json"
    },
    "operation": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9-]*(\\.[a-z][a-z0-9-]*){0,3}$"
    },
    "component": {
      "type": "string",
      "enum": [
        "edge-agent",
        "data-platform",
        "app-middleware",
        "web"
      ]
    },
    "targetComponent": {
      "type": "string",
      "enum": [
        "edge-agent",
        "data-platform",
        "app-middleware",
        "web"
      ]
    },
    "phase": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9-]{1,63}$"
    },
    "occurredAt": {
      "type": "string",
      "format": "date-time"
    },
    "elapsedMs": {
      "type": "integer",
      "minimum": 0
    },
    "deadlineAt": {
      "type": "string",
      "format": "date-time"
    },
    "failure": {
      "$ref": "failure-classification.v1.schema.json"
    }
  }
} as const
