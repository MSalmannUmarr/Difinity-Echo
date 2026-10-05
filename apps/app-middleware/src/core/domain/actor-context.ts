import { err, ok, type Result } from "@difinity-echo/contracts"

declare const brand: unique symbol
type Branded<T, Name extends string> = T & { readonly [brand]: Name }

/** Authenticated actor identity. Never interchangeable with TenantId. */
export type ActorId = Branded<string, "ActorId">
/** Tenant scope resolved from authenticated credentials, never from request fields. */
export type TenantId = Branded<string, "TenantId">
/**
 * A permission granted to the actor. The capability catalogue and role mapping
 * are an OPEN DECISION (implementation brief §11.3); only the syntax is fixed here.
 */
export type Capability = Branded<string, "Capability">

export interface InvalidIdentityValue {
  readonly kind: "invalid-identity-value"
  readonly field: "actorId" | "tenantId" | "capability"
}

const OPAQUE_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{2,127}$/
const CAPABILITY = /^[a-z][a-z0-9-]*(:[a-z][a-z0-9-]*){1,3}$/

const parseWith =
  <T extends string>(pattern: RegExp, field: InvalidIdentityValue["field"]) =>
  (raw: string): Result<T, InvalidIdentityValue> =>
    pattern.test(raw) ? ok(raw as T) : err({ kind: "invalid-identity-value", field })

export const ActorId = { parse: parseWith<ActorId>(OPAQUE_ID, "actorId") } as const
export const TenantId = { parse: parseWith<TenantId>(OPAQUE_ID, "tenantId") } as const
export const Capability = { parse: parseWith<Capability>(CAPABILITY, "capability") } as const

/**
 * Immutable actor/tenant context produced only by the authentication boundary
 * and passed explicitly to every protected operation (standard §11.4).
 * It carries no credentials.
 */
export interface ActorContext {
  readonly actorId: ActorId
  readonly tenantId: TenantId
  readonly capabilities: ReadonlySet<Capability>
  /** Authentication-session generation, used to reject stale context. */
  readonly sessionRevision: number
}

class FrozenCapabilitySet implements ReadonlySet<Capability> {
  readonly #items: Set<Capability>
  constructor(items: Iterable<Capability>) {
    this.#items = new Set(items)
  }
  get size(): number {
    return this.#items.size
  }
  has(value: Capability): boolean {
    return this.#items.has(value)
  }
  forEach(
    callback: (value: Capability, key: Capability, set: ReadonlySet<Capability>) => void
  ): void {
    this.#items.forEach((value) => callback(value, value, this))
  }
  entries(): SetIterator<[Capability, Capability]> {
    return this.#items.entries()
  }
  keys(): SetIterator<Capability> {
    return this.#items.keys()
  }
  values(): SetIterator<Capability> {
    return this.#items.values()
  }
  [Symbol.iterator](): SetIterator<Capability> {
    return this.#items.values()
  }
}

export const createActorContext = (input: {
  readonly actorId: ActorId
  readonly tenantId: TenantId
  readonly capabilities: Iterable<Capability>
  readonly sessionRevision: number
}): ActorContext =>
  Object.freeze({
    actorId: input.actorId,
    tenantId: input.tenantId,
    capabilities: new FrozenCapabilitySet(input.capabilities),
    sessionRevision: input.sessionRevision,
  })
