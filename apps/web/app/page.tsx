import { Suspense } from "react"
import { LandingHero } from "@/src/app/landing/landing-hero"
import { RouteView } from "@/src/app/route-view"

export default function Page() {
  return <><LandingHero/><Suspense fallback={null}><RouteView route="overview" overview/></Suspense></>
}
