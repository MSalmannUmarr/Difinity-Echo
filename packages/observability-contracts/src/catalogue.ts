import { createContractRegistry, type JsonSchemaDocument } from "@difinity-echo/contracts"
import { correlationIdSchema } from "./generated/correlation-id.v1.js"
import { failureClassificationSchema } from "./generated/failure-classification.v1.js"
import { operationEventSchema } from "./generated/operation-event.v1.js"
import { serviceHealthSchema } from "./generated/service-health.v1.js"
import { serviceReadinessSchema } from "./generated/service-readiness.v1.js"

export const ObservabilityContractId = {
  CorrelationId: correlationIdSchema.$id,
  FailureClassification: failureClassificationSchema.$id,
  ServiceHealth: serviceHealthSchema.$id,
  ServiceReadiness: serviceReadinessSchema.$id,
  OperationEvent: operationEventSchema.$id,
} as const

export const observabilitySchemas: readonly JsonSchemaDocument[] = [
  correlationIdSchema,
  failureClassificationSchema,
  serviceHealthSchema,
  serviceReadinessSchema,
  operationEventSchema,
]

export const observabilityRegistry = createContractRegistry(observabilitySchemas)
