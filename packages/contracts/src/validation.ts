import { Ajv2020, type ErrorObject } from "ajv/dist/2020.js"
import addFormatsModule from "ajv-formats"
import type { JsonSchemaDocument } from "./json-value.js"
import { err, ok, type Result } from "./result.js"

export interface ValidationIssue {
  /** JSON Pointer to the offending location in the validated document. */
  readonly path: string
  /** Schema-level reason. Never contains the offending value. */
  readonly reason: string
}

export interface ContractValidationFailure {
  readonly kind: "contract-validation-failure"
  readonly schemaId: string
  readonly issues: readonly ValidationIssue[]
}

export interface UnknownContract {
  readonly kind: "unknown-contract"
  readonly schemaId: string
}

/**
 * Validates untrusted input at an adapter boundary and narrows it to the
 * schema-derived type. The `unknown` parameter is intentional: this is the
 * single parsing seam where raw external input is narrowed (standard §7.3).
 */
export interface ContractValidator<T> {
  readonly schemaId: string
  validate(input: unknown): Result<T, ContractValidationFailure>
}

export interface ContractRegistry {
  readonly schemaIds: readonly string[]
  validator<T>(schemaId: string): Result<ContractValidator<T>, UnknownContract>
}

type AddFormats = (ajv: Ajv2020) => Ajv2020
const addFormats: AddFormats =
  (addFormatsModule as unknown as { default?: AddFormats }).default ??
  (addFormatsModule as unknown as AddFormats)

const toIssue = (error: ErrorObject): ValidationIssue => {
  const path = error.instancePath === "" ? "/" : error.instancePath
  if (error.keyword === "additionalProperties") {
    const property = String(
      (error.params as { readonly additionalProperty?: unknown }).additionalProperty
    )
    return { path, reason: `unexpected property '${property}'` }
  }
  if (error.keyword === "propertyNames") {
    return { path, reason: "property name is not permitted" }
  }
  return { path, reason: `${error.keyword}: ${error.message ?? "constraint violated"}` }
}

/**
 * Builds an isolated registry so every consumer validates against the same
 * canonical schema documents. Schemas reference one another by `$id`.
 */
export const createContractRegistry = (
  schemas: readonly JsonSchemaDocument[]
): ContractRegistry => {
  const ajv = new Ajv2020({
    allErrors: true,
    strict: true,
    // `not: { required: [...] }` is used deliberately to forbid fields per outcome.
    strictRequired: false,
    allowUnionTypes: true,
  })
  addFormats(ajv)
  for (const schema of schemas) ajv.addSchema(schema, schema.$id)
  const schemaIds = schemas.map((schema) => schema.$id)

  return {
    schemaIds,
    validator<T>(schemaId: string): Result<ContractValidator<T>, UnknownContract> {
      const compiled = ajv.getSchema(schemaId)
      if (compiled === undefined) return err({ kind: "unknown-contract", schemaId })
      return ok({
        schemaId,
        validate(input: unknown): Result<T, ContractValidationFailure> {
          if (compiled(input)) return ok(input as T)
          const issues = (compiled.errors ?? []).map(toIssue)
          return err({ kind: "contract-validation-failure", schemaId, issues })
        },
      })
    },
  }
}
