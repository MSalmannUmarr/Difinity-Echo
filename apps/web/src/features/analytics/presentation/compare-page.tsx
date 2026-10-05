"use client"

import { ArrowRight, BookOpen, FlaskConical, Users } from "lucide-react"
import { BarChart } from "@/components/charts/bar-chart"
import { Bar } from "@/components/charts/bar"
import { BarXAxis } from "@/components/charts/bar-x-axis"
import { Grid } from "@/components/charts/grid"
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip"
import type { CohortComparison } from "@/src/shared/core/models"
import { StatusBadge } from "@/src/shared/design/status-badge"

const distribution = [
  { name: "2-4d", aiLinked: 34, comparator: 18 },
  { name: "5-7d", aiLinked: 48, comparator: 31 },
  { name: "8-10d", aiLinked: 27, comparator: 32 },
  { name: "11-14d", aiLinked: 11, comparator: 17 },
]

export function ComparePage({ comparison, insufficient, onExplore, onTrace }: { comparison: CohortComparison; insufficient: boolean; onExplore: () => void; onTrace: () => void }) {
  const formatValue = (value: number) => comparison.metric.unit === "$k" ? `$${value}k` : comparison.metric.unit === "%" ? `${value}%` : `${value} ${comparison.metric.unit}`
  return <div className="page-stack"><header className="page-header"><div><p className="page-kicker">Cohort comparison</p><h1>Is the difference real?</h1><p>AI-linked work is compared only with eligible, capture-complete work where AI was not observed.</p></div><StatusBadge state={comparison.evidence}/></header>
    {insufficient ? <section className="state-panel"><FlaskConical/><p className="state-kicker">Insufficient sample</p><h2>This cohort is too small to compare responsibly.</h2><p>Only {comparison.aiSample} AI-linked and {comparison.comparatorSample} comparator work items meet the current filters. Expand the time window or scope.</p></section> : <>
      <section className="comparison-hero"><div><span>AI-linked median</span><strong>{formatValue(comparison.aiLinkedMedian)}</strong><small>n = {comparison.aiSample}</small></div><div className="difference"><span>Observed difference</span><strong>{comparison.difference}</strong><small>Illustrative comparison</small></div><div><span>Capture-complete comparator</span><strong>{formatValue(comparison.comparatorMedian)}</strong><small>n = {comparison.comparatorSample}</small></div></section>
      <div className="compare-grid"><section className="chart-panel"><div className="section-heading compact"><div><h2>Cohort distribution</h2><p>Eligible observations across value bands</p></div><div className="chart-legend"><span><i className="legend-green"/>AI-linked</span><span><i/>No AI observed</span></div></div><BarChart data={distribution} xDataKey="name" aspectRatio="2 / 1" barGap={0.28} margin={{ top: 16, right: 20, bottom: 38, left: 20 }}><Grid horizontal/><Bar dataKey="aiLinked" fill="var(--echo-green)" lineCap={3}/><Bar dataKey="comparator" fill="var(--echo-stone-dark)" lineCap={3}/><BarXAxis/><ChartTooltip rows={(point) => [{ label: "AI-linked", value: String(point.aiLinked), color: "var(--echo-green)" }, { label: "Comparator", value: String(point.comparator), color: "var(--echo-stone-dark)" }]}/></BarChart></section>
      <aside className="method-panel"><BookOpen/><h2>Comparison contract</h2><dl><div><dt>Metric</dt><dd>{comparison.metric.label}</dd></div><div><dt>Natural grain</dt><dd>{comparison.metric.naturalGrain}</dd></div><div><dt>Window</dt><dd>{comparison.window}</dd></div><div><dt>Cohorts</dt><dd>AI-linked vs capture-complete</dd></div></dl><p>Unknown AI status is excluded. Missing telemetry is not treated as non-AI evidence.</p></aside></div>
      <section className="sample-strip"><div><Users/><span>Representative samples</span></div><button onClick={onTrace}><strong>PAY-1427</strong><span>6.2 days · Direct AI evidence</span><ArrowRight/></button><button onClick={onExplore}><strong>Payments</strong><span>Explore linked work items</span><ArrowRight/></button></section>
    </>}
  </div>
}
