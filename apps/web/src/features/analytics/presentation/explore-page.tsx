"use client"

import { ArrowRight, Boxes, GitBranch, X } from "lucide-react"
import { useMemo, useState } from "react"
import type { OrganisationGraph } from "../domain/models"
import { StatusBadge } from "@/src/shared/design/status-badge"

export function ExplorePage({ graph, initialEntity, onTrace, onHealth }: { graph: OrganisationGraph; initialEntity: string; onTrace: () => void; onHealth: () => void }) {
  const [selected, setSelected] = useState(initialEntity === "all" ? "payments" : initialEntity)
  const entity = graph.entities.find((item) => item.id === selected) ?? graph.entities[1]
  const related = useMemo(() => graph.relationships.filter((rel) => rel.sourceId === entity.id || rel.targetId === entity.id), [entity.id, graph.relationships])
  return <div className="page-stack"><header className="page-header"><div><p className="page-kicker">Organisational graph</p><h1>Where is it happening?</h1><p>Move across teams, initiatives, products, services and financial ownership without forcing a one-parent hierarchy.</p></div><div className="mode-switch"><button className="active">Attributed</button><button>Touched</button></div></header>
    <div className="explore-layout"><section className="graph-panel" aria-label="Configurable organisational graph"><div className="graph-root"><Boxes/><strong>Engineering</strong><span>Organisation</span></div><div className="graph-lines"/><div className="graph-grid">{graph.entities.filter((item) => item.id !== "engineering").map((item, index) => <button key={item.id} onClick={() => setSelected(item.id)} className={`graph-node node-${index + 1} ${selected === item.id ? "selected" : ""}`}><span>{item.type}</span><strong>{item.name}</strong></button>)}</div><p className="graph-footnote"><GitBranch/>Multi-parent relationships are retained. Touched values are non-additive.</p></section>
      <aside className="entity-inspector"><div className="drawer-title"><div><span>{entity.type}</span><h2>{entity.name}</h2></div><button aria-label="Close inspector"><X/></button></div><p>{entity.description}</p><h3>Connected relationships</h3><div className="relationship-list">{related.map((rel) => { const otherId = rel.sourceId === entity.id ? rel.targetId : rel.sourceId; const other = graph.entities.find((item) => item.id === otherId)!; return <button key={`${rel.sourceId}-${rel.targetId}`} onClick={() => setSelected(other.id)}><span><strong>{rel.kind}</strong>{other.name}</span><StatusBadge state={rel.evidence}/><small>{rel.source} · {rel.effectivePeriod}</small></button> })}</div><div className="drawer-actions"><button className="button-primary" onClick={onTrace}>Inspect evidence <ArrowRight/></button><button className="button-outline" onClick={onHealth}>Check data health</button></div></aside></div>
  </div>
}
