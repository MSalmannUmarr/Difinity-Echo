"use client"

import { Check, Database, History, KeyRound, Network, Save, Shield, SlidersHorizontal, Users } from "lucide-react"
import { useState } from "react"

const tabs = [
  ["connectors", "Connectors", Database], ["privacy", "Privacy", Shield], ["identity", "Identity", KeyRound],
  ["organisation-graph", "Organisation Graph", Network], ["mapping-rules", "Mapping Rules", SlidersHorizontal],
  ["allocation", "Allocation", SlidersHorizontal], ["retention", "Retention", History], ["roles", "Roles & Access", Users], ["audit", "Audit History", History],
] as const

export function ConfigurationPage({ initialTab, issue, repaired, onSave, onReset }: { initialTab: string; issue: string; repaired: boolean; onSave: (issue: string) => Promise<void>; onReset: () => void }) {
  const [tab, setTab] = useState(initialTab || "organisation-graph")
  const [owner, setOwner] = useState(repaired ? "Payments" : "Payments + Platform")
  const [weight, setWeight] = useState(repaired ? "100" : "140")
  const [saving, setSaving] = useState(false)
  const save = async () => { setSaving(true); await onSave(issue || "ownership-conflict"); setOwner("Payments"); setWeight("100"); setSaving(false) }
  return <div className="page-stack"><header className="page-header"><div><p className="page-kicker">Mock control plane</p><h1>How should Echo behave?</h1><p>Configure evidence collection and interpretation locally. No real server or customer system is changed.</p></div><span className="prototype-pill">Prototype configuration</span></header>
    <div className="config-layout"><nav className="config-tabs" aria-label="Configuration sections">{tabs.map(([id, label, Icon]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><Icon/><span>{label}</span></button>)}</nav>
      <section className="config-content">{tab === "organisation-graph" || tab === "mapping-rules" || tab === "allocation" ? <><div className="section-heading"><div><p className="page-kicker">Organisation Graph</p><h2>Checkout API ownership</h2><p>Resolve the mapping conflict affecting Payments analytics and attributed roll-ups.</p></div>{repaired && <span className="repair-confirmation"><Check/>Validated</span>}</div>
        <div className="conflict-strip"><span>Issue</span><strong>{repaired ? "Resolved in this browser session" : "Primary ownership exceeds the 100% allocation rule"}</strong><small>DH-004 · Payments / Checkout API</small></div>
        <div className="mapping-canvas"><div><span>Service</span><strong>Checkout API</strong></div><i/><div><span>Primary owner</span><strong>{owner}</strong></div><i/><div><span>Cost centre</span><strong>Cost Centre 183</strong></div></div>
        <form className="config-form" onSubmit={(event) => { event.preventDefault(); void save() }}><label><span>Primary owner</span><select value={owner} onChange={(event) => setOwner(event.target.value)}><option>Payments + Platform</option><option>Payments</option><option>Platform</option></select><small>One primary owner is required for attributed measures.</small></label><label><span>Attributed allocation</span><input value={weight} onChange={(event) => setWeight(event.target.value)} inputMode="numeric"/><small>Total ownership must equal 100%.</small></label><label className="wide"><span>Relationship source</span><input value="CODEOWNERS + service registry" readOnly/><small>Mock sources are shown for traceability.</small></label><div className="form-actions"><button type="button" className="button-outline" onClick={() => { setOwner("Payments + Platform"); setWeight("140"); onReset() }}>Reset demo</button><button className="button-primary" disabled={saving || (owner === "Payments" && weight === "100" && repaired)}><Save/>{saving ? "Saving locally" : "Validate and save"}</button></div></form>
      </> : <GenericTab name={tabs.find(([id]) => id === tab)?.[1] ?? "Configuration"}/>}</section></div>
  </div>
}

function GenericTab({ name }: { name: string }) { return <div className="generic-config"><p className="page-kicker">{name}</p><h2>Configured for the demonstration environment</h2><p>This mock control is available to show the intended governance surface. Values remain local and do not update a server.</p><div className="setting-rows"><label><span>Enabled for demo</span><input type="checkbox" defaultChecked/></label><label><span>Require validation before recompute</span><input type="checkbox" defaultChecked/></label><label><span>Audit local changes</span><input type="checkbox" defaultChecked/></label></div></div> }
