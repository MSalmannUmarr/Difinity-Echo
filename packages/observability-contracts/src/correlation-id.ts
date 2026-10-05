import { err, ok, type Result } from "@difinity-echo/contracts"

declare const correlationIdBrand: unique symbol

/** Validated correlation identifier (see correlation-id.v1.schema.json). */
export type CorrelationId = string & { readonly [correlationIdBrand]: "CorrelationId" }

export interface InvalidCorrelationId {
  readonly kind: "invalid-correlation-id"
}

const CORRELATION_ID_SYNTAX = /^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$/

export const CorrelationId = {
  parse(raw: string): Result<CorrelationId, InvalidCorrelationId> {
    return CORRELATION_ID_SYNTAX.test(raw)
      ? ok(raw as CorrelationId)
      : err({ kind: "invalid-correlation-id" })
  },
} as const

/** HTTP header used to propagate the correlation identifier between components. */
export const CORRELATION_ID_HEADER = "x-correlation-id"
