import type { JsonSchemaDocument } from "./json-value.js"
import { createContractRegistry } from "./validation.js"
import { admissionAcknowledgementSchema } from "./generated/admission-acknowledgement.v0.js"
import { canonicalEventEnvelopeSchema } from "./generated/canonical-event-envelope.v0.js"
import { errorCodeSchema, type ErrorCode } from "./generated/error-code.v1.js"
import { queryRequestEnvelopeSchema } from "./generated/query-request-envelope.v0.js"
import { queryResponseEnvelopeSchema } from "./generated/query-response-envelope.v0.js"
import { safeErrorSchema } from "./generated/safe-error.v1.js"

/** Named identifiers for every published contract in this package. */
export const ContractId = {
  ErrorCode: errorCodeSchema.$id,
  SafeError: safeErrorSchema.$id,
  CanonicalEventEnvelope: canonicalEventEnvelopeSchema.$id,
  AdmissionAcknowledgement: admissionAcknowledgementSchema.$id,
  QueryRequestEnvelope: queryRequestEnvelopeSchema.$id,
  QueryResponseEnvelope: queryResponseEnvelopeSchema.$id,
} as const

export const contractSchemas: readonly JsonSchemaDocument[] = [
  errorCodeSchema,
  safeErrorSchema,
  canonicalEventEnvelopeSchema,
  admissionAcknowledgementSchema,
  queryRequestEnvelopeSchema,
  queryResponseEnvelopeSchema,
]

export const contractsRegistry = createContractRegistry(contractSchemas)

export const errorCodes: readonly ErrorCode[] = errorCodeSchema.enum
