/**
 * Architectural boundaries owned by Echo Edge (implementation brief §9.3).
 * Milestone 0 registers each boundary so readiness reports it honestly as
 * `not-implemented`. Behaviour is added in Milestone 1 (M1-02 to M1-05, M1-14).
 */
export const EdgeBoundary = {
  VendorAdapter: "vendor-adapter",
  PrivacyAllowlist: "privacy-allowlist",
  EventNormaliser: "event-normaliser",
  GitProvenance: "git-provenance",
  DurableBuffer: "durable-buffer",
  AdmissionClient: "admission-client",
} as const

export type EdgeBoundary = (typeof EdgeBoundary)[keyof typeof EdgeBoundary]

export const edgeBoundaries: readonly EdgeBoundary[] = Object.values(EdgeBoundary)
