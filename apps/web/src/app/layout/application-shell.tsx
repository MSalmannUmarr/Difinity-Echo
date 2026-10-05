"use client"

import Link from "next/link"
import { Activity, BarChart3, CheckCircle2, GitCompareArrows, HeartPulse, Network, Search, Settings2, ShieldCheck } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEcho } from "../providers/echo-provider"
import type { AnalyticalContext, DemoScenario, Persona } from "@/src/shared/core/models"

const nav = [
  ["/", "Overview", BarChart3], ["/compare", "Compare", GitCompareArrows], ["/explore", "Explore", Network],
  ["/live-trace", "Live Trace", Search], ["/data-health", "Data Health", HeartPulse], ["/configuration", "Data Policy", Settings2],
] as const

const personas: Persona[] = ["CTO", "VP Engineering", "Engineering Manager", "Platform Lead", "Echo Administrator"]
const scenarios: { value: DemoScenario; label: string }[] = [
  { value: "healthy", label: "Healthy organisation" }, { value: "poor-evidence", label: "Poor evidence coverage" },
  { value: "connector-outage", label: "Connector outage" }, { value: "mapping-conflict", label: "Mapping conflict" },
  { value: "insufficient-cohort", label: "Insufficient cohort" }, { value: "service-error", label: "Service error" },
]

const restricted = (persona: Persona, path: string) => persona === "CTO" && path === "/configuration"

export function ApplicationShell({ children, overview = false }: { children: React.ReactNode; overview?: boolean }) {
  const pathname = usePathname()
  const { context, updateContext, persona, setPersona, scenario, setScenario, href, toast } = useEcho()
  return <section id={overview ? "overview" : undefined} className="app-surface">
    <div className="demo-banner"><span>Echo prototype</span><span>Illustrative demo data. Not customer results.</span></div>
    <div className="app-grid">
      <aside className="sidebar">
        <Link href="/#overview" className="brand"><span className="brand-mark"><Activity/></span><span>echo</span></Link>
        <nav aria-label="Primary navigation">
          {nav.filter(([path]) => !restricted(persona, path)).map(([path, label, Icon]) => <Link key={path} href={path === "/" ? "/#overview" : href(path)} className={(pathname === path || (path === "/" && pathname === "/")) ? "nav-link active" : "nav-link"}><Icon/><span>{label}</span></Link>)}
        </nav>
        <div className="sidebar-note"><ShieldCheck/><p>Content protected</p><span>Evidence metadata only</span></div>
      </aside>
      <div className="app-main">
        <header className="utility-bar">
          <div><span className="utility-label">Tenant</span><strong>{context.tenant}</strong></div>
          <div className="utility-actions">
            <label><span>Demo scenario</span><select value={scenario} onChange={(event) => setScenario(event.target.value as DemoScenario)}>{scenarios.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label><span>View as</span><select value={persona} onChange={(event) => setPersona(event.target.value as Persona)}>{personas.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          </div>
        </header>
        <div className="context-bar" aria-label="Analytical context">
          <ContextSelect label="Time window" value={context.window} options={["Last 30 days", "Last 90 days", "Last 180 days"]} onChange={(value) => updateContext({ window: value as AnalyticalContext["window"] })}/>
          <ContextSelect label="View by" value={context.viewBy} options={["Team", "Initiative", "Product", "Application / Service", "Cost Centre"]} onChange={(value) => updateContext({ viewBy: value as AnalyticalContext["viewBy"] })}/>
          <ContextSelect label="Entity" value={context.entity} options={["all", "payments", "platform", "identity"]} labels={["All entities", "Payments", "Platform", "Identity"]} onChange={(value) => updateContext({ entity: value as AnalyticalContext["entity"] })}/>
          <ContextSelect label="AI provider" value={context.provider} options={["All providers", "Cursor", "GitHub Copilot"]} onChange={(provider) => updateContext({ provider })}/>
          <ContextSelect label="Involvement" value={context.involvement} options={["All", "Owned", "Contributed"]} onChange={(value) => updateContext({ involvement: value as AnalyticalContext["involvement"] })}/>
          <ContextSelect label="Allocation" value={context.allocation} options={["Attributed", "Touched"]} onChange={(value) => updateContext({ allocation: value as AnalyticalContext["allocation"] })}/>
        </div>
        <main className="page-content">{children}</main>
      </div>
    </div>
    {toast && <div className="toast" role="status"><CheckCircle2/>{toast}</div>}
  </section>
}

function ContextSelect({ label, value, options, labels, onChange }: { label: string; value: string; options: readonly string[]; labels?: readonly string[]; onChange: (value: string) => void }) {
  return <label className="context-control"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option, index) => <option key={option} value={option}>{labels?.[index] ?? option}</option>)}</select></label>
}
