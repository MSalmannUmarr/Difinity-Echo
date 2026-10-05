"use client"

import { ArrowRight, Cable, HeartPulse, ShieldAlert } from "lucide-react"
import { BarChart } from "@/components/charts/bar-chart"
import { Bar } from "@/components/charts/bar"
import { BarXAxis } from "@/components/charts/bar-x-axis"
import { Grid } from "@/components/charts/grid"
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip"
import type { DataHealthSnapshot } from "../data/mock-data-health-client"
import { StatusBadge } from "@/src/shared/design/status-badge"

export function DataHealthPage({ snapshot, repaired, onConfigure }: { snapshot: DataHealthSnapshot; repaired: boolean; onConfigure: (issue: string) => void }) {
  return <div className="page-stack"><header className="page-header"><div><p className="page-kicker">Evidence operations</p><h1>Can this analysis be trusted?</h1><p>Monitor collection, identity, linkage, cost, hierarchy and outcome evidence before interpreting a comparison.</p></div>{repaired && <span className="repair-confirmation">Ownership mapping repaired locally</span>}</header>
    <section className="health-summary"><div><HeartPulse/><span>Overall evidence health</span><strong>{repaired ? "86%" : "79%"}</strong><small>{repaired ? "Ready with limitations" : "Attention required"}</small></div><div><span>Fresh sources</span><strong>{snapshot.connectors.filter((item) => item.state === "Healthy").length}/{snapshot.connectors.length}</strong><small>Within source SLA</small></div><div><span>Open issues</span><strong>{snapshot.issues.length}</strong><small>{snapshot.issues.filter((item) => item.severity === "High").length} high priority</small></div></section>
    <div className="health-grid"><section className="connector-panel"><div className="section-heading compact"><div><h2>Connector health</h2><p>Collection status and event freshness</p></div><Cable/></div><div className="connector-list">{snapshot.connectors.map((item) => <button key={item.name}><span><strong>{item.name}</strong><small>{item.domain}</small></span><span className="coverage"><i style={{ width: `${item.coverage}%` }}/><em>{item.coverage}%</em></span><span><StatusBadge state={item.state}/><small>{item.freshness}</small></span></button>)}</div></section>
      <section className="chart-panel"><div className="section-heading compact"><div><h2>Lineage coverage</h2><p>Eligible records with confirmed or direct links</p></div></div><BarChart data={[...snapshot.linkage]} xDataKey="name" orientation="horizontal" aspectRatio="1.25 / 1" margin={{ top: 12, right: 34, bottom: 24, left: 132 }}><Grid horizontal={false} vertical/><Bar dataKey="coverage" fill="var(--echo-green)" lineCap={4}/><BarXAxis/><ChartTooltip showDatePill={false} rows={(point) => [{ label: "Coverage", value: `${point.coverage}%`, color: "var(--echo-green)" }]}/></BarChart></section></div>
    <section className="issues-panel"><div className="section-heading compact"><div><h2>Actionable evidence issues</h2><p>Resolve structural gaps before relying on affected comparisons.</p></div><ShieldAlert/></div>{snapshot.issues.length === 0 ? <div className="empty-inline">No active issues in this demo scope.</div> : <div className="issue-list">{snapshot.issues.map((issue) => <button key={issue.id} onClick={() => issue.configurable && onConfigure(issue.id)}><span className={`severity severity-${issue.severity.toLowerCase()}`}>{issue.severity}</span><span><strong>{issue.title}</strong><small>{issue.scope} · {issue.category}</small><p>{issue.detail}</p></span>{issue.configurable && <span className="review-link">Review mapping <ArrowRight/></span>}</button>)}</div>}</section>
  </div>
}
