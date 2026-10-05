import { describe, expect, it } from "vitest"
import {
  ActorId,
  Capability,
  createActorContext,
  TenantId,
} from "../src/core/domain/actor-context.js"
import { authorize } from "../src/core/domain/authorization.js"
import { UnconfiguredAuthenticator } from "../src/app/adapters/outbound/unconfigured-authenticator.js"
import type { PresentedCredential } from "../src/core/ports/out/authenticator.js"

const unwrap = <T>(result: { ok: true; value: T } | { ok: false }): T => {
  if (!result.ok) throw new Error("expected ok")
  return result.value
}

const actor = createActorContext({
  actorId: unwrap(ActorId.parse("synthetic-actor-1")),
  tenantId: unwrap(TenantId.parse("synthetic-tenant-a")),
  capabilities: [unwrap(Capability.parse("synthetic:read"))],
  sessionRevision: 1,
})

describe("actor context", () => {
  it("is immutable", () => {
    expect(Object.isFrozen(actor)).toBe(true)
    expect(() => {
      ;(actor as { tenantId: string }).tenantId = "synthetic-tenant-b"
    }).toThrow(TypeError)
    expect("add" in actor.capabilities).toBe(false)
  })

  it.each([
    ["actorId", ActorId.parse("")],
    ["tenantId", TenantId.parse("../tenant")],
    ["capability", Capability.parse("NotACapability")],
  ])("rejects an invalid %s", (_field, result) => {
    expect(result.ok).toBe(false)
  })
})

describe("authorisation", () => {
  it("allows a granted capability", () => {
    expect(authorize(actor, unwrap(Capability.parse("synthetic:read"))).ok).toBe(true)
  })

  it("denies a capability that was not granted", () => {
    expect(authorize(actor, unwrap(Capability.parse("synthetic:write")))).toEqual({
      ok: false,
      error: { kind: "authorization-denied" },
    })
  })
})

describe("authentication boundary", () => {
  it("fails closed while no identity provider is configured", async () => {
    const result = await new UnconfiguredAuthenticator().authenticate({} as PresentedCredential)
    expect(result).toEqual({ ok: false, error: { kind: "authentication-not-configured" } })
  })
})
