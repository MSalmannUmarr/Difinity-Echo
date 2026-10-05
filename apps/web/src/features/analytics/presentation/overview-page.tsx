"use client"

import { ArrowUpRight, Info, TrendingDown } from "lucide-react"
import { LineChart } from "@/components/charts/line-chart"
import { Line } from "@/components/charts/line"
import { Grid } from "@/components/charts/grid"
import { XAxis } from "@/components/charts/x-axis"
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip"
import type { OverviewSnapshot } from "../domain/models"
import { StatusBadge } from "@/src/shared/design/status-badge"

export function OverviewPage({ snapshot, onCompare, onExplore, onHealth }: { snapshot: OverviewSnapshot; onCompare: (entity: string, metric: string) => void; onExplore: (entity: string) => void; onHealth: (entity: string) => void }) {
  return <div className="page-stack">
    <header className="page-header"><div><p className="page-kicker">Organisation overview</p><h1>What changed?</h1><p>Compare investment, delivery, quality and evidence across the selected engineering scope.</p></div><div className="scope-stamp"><span>Observed comparison</span><strong>{snapshot.comparison.difference}</strong><small>median cycle time, AI-linked work</small></div></header>
    <section className="matrix-section" aria-labelledby="comparison-matrix-title">
      <div className="section-heading"><div><h2 id="comparison-matrix-title">Consolidated comparison matrix</h2><p>Open any result to inspect the cohort, organisation, or supporting evidence.</p></div><span className="method-note"><Info/>Correlation, not causation</span></div>
      <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Entity</th><th>AI investment</th><th>AI coverage</th><th>Delivery</th><th>Quality</th><th>Customer</th><th>Evidence</th></tr></thead><tbody>{snapshot.rows.map((row) => <tr key={row.entity.id}>
        <td><button onClick={() => onExplore(row.entity.id)} className="entity-button"><strong>{row.entity.name}</strong><span>{row.entity.type}</span><ArrowUpRight/></button></td>
        <MetricCell value={row.investment.formatted} delta={row.investment.delta} onClick={() => onCompare(row.entity.id, "AI investment")}/>
        <MetricCell value={row.coverage.formatted} delta={row.coverage.delta} onClick={() => onCompare(row.entity.id, "AI coverage")}/>
        <MetricCell value={row.delivery.formatted} delta={row.delivery.delta} positive onClick={() => onCompare(row.entity.id, "Work-item cycle time")}/>
        <MetricCell value={row.quality.formatted} delta={row.quality.delta} onClick={() => onCompare(row.entity.id, "Change failure rate")}/>
        <MetricCell value={row.customer.formatted} delta={row.customer.delta} onClick={() => onCompare(row.entity.id, "Support demand")}/>
        <td><button className="cell-button" onClick={() => onHealth(row.entity.id)}><StatusBadge state={row.evidence}/></button></td>
      </tr>)}</tbody></table></div>
    </section>
    <div className="overview-lower">
      <section className="chart-panel"><div className="section-heading compact"><div><h2>Cycle-time direction</h2><p>Natural grain: eligible work item</p></div><div className="chart-legend"><span><i className="legend-green"/>AI-linked</span><span><i/>Capture-complete comparator</span></div></div>
        <LineChart data={[...snapshot.trend]} xDataKey="date" aspectRatio="2.5 / 1" margin={{ top: 18, right: 24, bottom: 38, left: 18 }}><Grid horizontal/><Line dataKey="aiLinked" stroke="var(--echo-green)" showMarkers/><Line dataKey="comparator" stroke="var(--echo-slate)" showMarkers/><XAxis/><ChartTooltip rows={(point) => [{ label: "AI-linked", value: `${point.aiLinked} days`, color: "var(--echo-green)" }, { label: "Comparator", value: `${point.comparator} days`, color: "var(--echo-slate)" }]}/></LineChart>
      </section>
      <aside className="insight-panel"><p className="page-kicker">Evidence-led insight</p><TrendingDown/><h2>Payments is the clearest change.</h2><p>AI-linked work shows a lower median cycle time in this illustrative cohort. Evidence remains partial because Checkout API ownership is conflicted.</p><button className="text-action" onClick={() => onCompare("payments", "Work-item cycle time")}>Inspect the comparison <ArrowUpRight/></button></aside>
    </div>
  </div>
}

function MetricCell({ value, delta, positive, onClick }: { value: string; delta: string; positive?: boolean; onClick: () => void }) {
  return <td><button className="metric-cell" onClick={onClick}><strong>{value}</strong><span className={positive ? "positive" : ""}>{delta}</span></button></td>
}
