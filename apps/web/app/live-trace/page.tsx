import { Suspense } from "react"
import { RouteView } from "@/src/app/route-view"
export default function Page() { return <Suspense fallback={null}><RouteView route="live-trace"/></Suspense> }
