"use client"

import { ArrowDown, ArrowRight, Braces, CheckCircle2, GitCommitHorizontal, Rocket, ShieldCheck, Sparkles } from "lucide-react"
import Link from "next/link"
import BlurText from "@/components/BlurText"

const flow = [
  ["AI activity", Sparkles, "Evidence captured"], ["Change", Braces, "Local provenance"], ["Commit", GitCommitHorizontal, "Source identity"],
  ["Deployment", Rocket, "Release lineage"], ["Outcome", CheckCircle2, "Quality window"],
] as const

export function LandingHero() {
  const scrollToOverview = () => document.querySelector("#overview")?.scrollIntoView({ behavior: "smooth", block: "start" })
  return <section className="landing"><nav className="landing-nav"><Link href="/" className="brand light"><span className="brand-mark"><span/></span><span>echo</span></Link><div><a href="#thesis">Product thesis</a><a href="#overview">Open prototype</a></div><button className="button-light" onClick={scrollToOverview}>Explore Echo <ArrowDown/></button></nav>
    <div className="hero-grid"><div className="hero-copy"><p className="hero-kicker">Engineering evidence intelligence</p><BlurText text="Every developmental change echoes through your organisation." animateBy="words" direction="bottom" delay={70} className="hero-title"/><p>Connect AI-assisted activity to delivery, quality and outcomes through evidence, not simplistic adoption statistics.</p><div className="hero-actions"><button className="button-light" onClick={scrollToOverview}>Explore Echo <ArrowDown/></button><Link href="/live-trace">Open Live Trace <ArrowRight/></Link></div></div>
      <div className="echo-visual" aria-label="Engineering evidence flowing from AI activity to organisational outcomes"><div className="echo-orbit orbit-one"/><div className="echo-orbit orbit-two"/><div className="echo-core"><span>PAY-1427</span><strong>One change</strong><small>9 evidence records</small></div>{flow.map(([label, Icon, detail], index) => <div key={label} className={`flow-node flow-${index + 1}`}><Icon/><span><strong>{label}</strong><small>{detail}</small></span></div>)}</div></div>
    <div id="thesis" className="thesis-strip"><p>AI activity is only the beginning.</p><div><span>Traceability</span><span>Comparability</span><span>Evidence awareness</span><span>Privacy</span></div><ShieldCheck/></div>
  </section>
}
