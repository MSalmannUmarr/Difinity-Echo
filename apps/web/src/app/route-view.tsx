"use client"
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ApplicationShell } from "./layout/application-shell"
import { useEcho } from "./providers/echo-provider"
import { analyticsClient } from "@/src/features/analytics/data/mock-analytics-client"
import type { OrganisationGraph, OverviewSnapshot } from "@/src/features/analytics/domain/models"
import { OverviewPage } from "@/src/features/analytics/presentation/overview-page"
import { ComparePage } from "@/src/features/analytics/presentation/compare-page"
import { ExplorePage } from "@/src/features/analytics/presentation/explore-page"
import { evidenceClient, type EvidenceTrace } from "@/src/features/evidence/data/mock-evidence-client"
import { LiveTracePage } from "@/src/features/evidence/presentation/live-trace-page"
import { dataHealthClient, type DataHealthSnapshot } from "@/src/features/data-health/data/mock-data-health-client"
import { DataHealthPage } from "@/src/features/data-health/presentation/data-health-page"
import { configurationClient } from "@/src/features/configuration/data/mock-configuration-client"
import { ConfigurationPage } from "@/src/features/configuration/presentation/configuration-page"
import { ErrorState, LoadingState } from "@/src/shared/design/loading-state"
import type { CohortComparison } from "@/src/shared/core/models"

export type EchoRoute = "overview" | "compare" | "explore" | "live-trace" | "data-health" | "configuration"

export function RouteView({ route, overview = false }: { route: EchoRoute; overview?: boolean }) {
  const search = useSearchParams()
  const echo = useEcho()
  const [data, setData] = useState<OverviewSnapshot | CohortComparison | OrganisationGraph | EvidenceTrace | DataHealthSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [traceQuery, setTraceQuery] = useState(search.get("trace") ?? "PAY-1427")
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true); setError(false)
    const load = async () => {
      try {
        let result: typeof data = null
        if (route === "overview") result = await analyticsClient.getOverview(echo.context, echo.scenario)
        if (route === "compare") result = await analyticsClient.getComparison(echo.context, search.get("metric") ?? "Work-item cycle time", echo.scenario)
        if (route === "explore") result = await analyticsClient.getOrganisationGraph()
        if (route === "live-trace") result = await evidenceClient.findTrace(traceQuery, echo.scenario)
        if (route === "data-health") result = await dataHealthClient.getHealth(echo.scenario, echo.mappingRepaired)
        if (active) setData(result)
      } catch { if (active) setError(true) } finally { if (active) setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [route, echo.context, echo.scenario, echo.mappingRepaired, traceQuery, reload, search])

  const content = () => {
    if (loading) return <LoadingState/>
    if (error) return <ErrorState onRetry={() => setReload((value) => value + 1)}/>
    if (route === "overview" && data) return <OverviewPage snapshot={data as OverviewSnapshot} onCompare={(entity, metric) => { echo.updateContext({ entity: entity as typeof echo.context.entity }); echo.navigate("/compare", { entity, metric }) }} onExplore={(entity) => { echo.updateContext({ entity: entity as typeof echo.context.entity }); echo.navigate("/explore", { entity }) }} onHealth={(entity) => echo.navigate("/data-health", { entity })}/>
    if (route === "compare" && data) return <ComparePage comparison={data as CohortComparison} insufficient={echo.scenario === "insufficient-cohort"} onExplore={() => echo.navigate("/explore", { entity: String(echo.context.entity === "all" ? "payments" : echo.context.entity) })} onTrace={() => echo.navigate("/live-trace", { trace: "PAY-1427" })}/>
    if (route === "explore" && data) return <ExplorePage graph={data as OrganisationGraph} initialEntity={search.get("entity") ?? String(echo.context.entity)} onTrace={() => echo.navigate("/live-trace", { trace: "PAY-1427" })} onHealth={() => echo.navigate("/data-health", { issue: "ownership-conflict" })}/>
    if (route === "live-trace") return <LiveTracePage trace={data as EvidenceTrace | null} query={traceQuery} onSearch={setTraceQuery} onHealth={() => echo.navigate("/data-health", { issue: "ownership-conflict" })}/>
    if (route === "data-health" && data) return <DataHealthPage snapshot={data as DataHealthSnapshot} repaired={echo.mappingRepaired} onConfigure={(issue) => echo.navigate("/configuration", { tab: "organisation-graph", issue })}/>
    if (route === "configuration" && echo.persona === "CTO") return <section className="state-panel"><p className="state-kicker">Restricted view</p><h2>Configuration is reserved for administrators.</h2><p>Switch the demo persona to Echo Administrator to review or change collection, privacy, identity, and organisation mapping policies.</p></section>
    if (route === "configuration") return <ConfigurationPage initialTab={search.get("tab") ?? "organisation-graph"} issue={search.get("issue") ?? "ownership-conflict"} repaired={echo.mappingRepaired} onReset={() => { echo.setMappingRepaired(false); echo.showToast("Demo mapping conflict restored locally.") }} onSave={async (issue) => { await configurationClient.repairOwnershipMapping(issue); echo.setMappingRepaired(true); echo.showToast("Mapping repaired locally. Analytical state recomputed.") }}/>
    return <LoadingState/>
  }

  return <ApplicationShell overview={overview}>{content()}</ApplicationShell>
}
