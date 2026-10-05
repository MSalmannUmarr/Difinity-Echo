/**
 * Explicit type for intentionally opaque JSON that must round-trip (standard §7.3).
 * Use only at transport boundaries; domain and port contracts use specific types.
 */
export type JsonPrimitive = string | number | boolean | null

export type JsonValue = JsonPrimitive | readonly JsonValue[] | { readonly [key: string]: JsonValue }

/** Minimal shape every canonical JSON Schema document in this repository satisfies. */
export interface JsonSchemaDocument {
  readonly $schema: string
  readonly $id: string
  readonly title: string
}
