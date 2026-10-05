import { CheckCircle2, CircleAlert, CircleDashed, Link2, ShieldAlert } from "lucide-react"
import type { EvidenceState, HealthState } from "@/src/shared/core/models"

const styles: Record<EvidenceState | HealthState, string> = {
  Direct: "badge badge-blue", Confirmed: "badge badge-green", Inferred: "badge badge-amber", Conflicted: "badge badge-red", Missing: "badge badge-muted",
  Healthy: "badge badge-green", Delayed: "badge badge-amber", Partial: "badge badge-amber", Disconnected: "badge badge-red", "Attention required": "badge badge-red",
}

export function StatusBadge({ state }: { state: EvidenceState | HealthState }) {
  const Icon = state === "Direct" ? Link2 : state === "Confirmed" || state === "Healthy" ? CheckCircle2 : state === "Missing" ? CircleDashed : state === "Conflicted" || state === "Disconnected" || state === "Attention required" ? ShieldAlert : CircleAlert
  return <span className={styles[state]}><Icon aria-hidden="true" />{state}</span>
}
