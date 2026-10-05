"use client"
/* eslint-disable react-hooks/set-state-in-effect */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { DEFAULT_CONTEXT, entityId, type AnalyticalContext, type DemoScenario, type Persona } from "@/src/shared/core/models"

interface EchoState {
  readonly context: AnalyticalContext
  readonly persona: Persona
  readonly scenario: DemoScenario
  readonly mappingRepaired: boolean
  readonly toast: string | null
  updateContext: (patch: Partial<AnalyticalContext>) => void
  setPersona: (persona: Persona) => void
  setScenario: (scenario: DemoScenario) => void
  setMappingRepaired: (value: boolean) => void
  showToast: (message: string) => void
  navigate: (path: string, patch?: Record<string, string>) => void
  href: (path: string, patch?: Record<string, string>) => string
}

const EchoContext = createContext<EchoState | null>(null)

const readStored = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback
  try { return JSON.parse(window.localStorage.getItem(key) ?? "null") ?? fallback } catch { return fallback }
}

export function EchoProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [context, setContext] = useState<AnalyticalContext>(DEFAULT_CONTEXT)
  const [persona, setPersonaState] = useState<Persona>("VP Engineering")
  const [scenario, setScenarioState] = useState<DemoScenario>("healthy")
  const [mappingRepaired, setMappingRepairedState] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const stored = readStored<Partial<AnalyticalContext>>("echo:context", {})
    setContext({
      ...DEFAULT_CONTEXT,
      ...stored,
      entity: params.get("entity") ? entityId(params.get("entity")!) : stored.entity ?? DEFAULT_CONTEXT.entity,
      window: (params.get("window") as AnalyticalContext["window"]) ?? stored.window ?? DEFAULT_CONTEXT.window,
      provider: params.get("provider") ?? stored.provider ?? DEFAULT_CONTEXT.provider,
    })
    setPersonaState(readStored<Persona>("echo:persona", "VP Engineering"))
    setScenarioState(readStored<DemoScenario>("echo:scenario", "healthy"))
    setMappingRepairedState(readStored<boolean>("echo:mapping-repaired", false))
  }, [])

  useEffect(() => { window.localStorage.setItem("echo:context", JSON.stringify(context)) }, [context])
  useEffect(() => { window.localStorage.setItem("echo:persona", JSON.stringify(persona)) }, [persona])
  useEffect(() => { window.localStorage.setItem("echo:scenario", JSON.stringify(scenario)) }, [scenario])
  useEffect(() => { window.localStorage.setItem("echo:mapping-repaired", JSON.stringify(mappingRepaired)) }, [mappingRepaired])

  const updateContext = useCallback((patch: Partial<AnalyticalContext>) => setContext((current) => ({ ...current, ...patch })), [])
  const setPersona = useCallback((value: Persona) => setPersonaState(value), [])
  const setScenario = useCallback((value: DemoScenario) => setScenarioState(value), [])
  const setMappingRepaired = useCallback((value: boolean) => setMappingRepairedState(value), [])
  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 3000)
  }, [])
  const href = useCallback((path: string, patch: Record<string, string> = {}) => {
    const params = new URLSearchParams()
    if (context.entity !== "all") params.set("entity", context.entity)
    if (context.window !== DEFAULT_CONTEXT.window) params.set("window", context.window)
    if (context.provider !== DEFAULT_CONTEXT.provider) params.set("provider", context.provider)
    Object.entries(patch).forEach(([key, value]) => params.set(key, value))
    return `${path}${params.size ? `?${params.toString()}` : ""}`
  }, [context])
  const navigate = useCallback((path: string, patch: Record<string, string> = {}) => router.push(href(path, patch)), [href, router])

  const value = useMemo(() => ({ context, persona, scenario, mappingRepaired, toast, updateContext, setPersona, setScenario, setMappingRepaired, showToast, navigate, href }), [context, persona, scenario, mappingRepaired, toast, updateContext, setPersona, setScenario, setMappingRepaired, showToast, navigate, href])

  useEffect(() => {
    if (pathname !== "/") window.scrollTo({ top: 0, behavior: "instant" })
  }, [pathname])

  return <EchoContext.Provider value={value}>{children}</EchoContext.Provider>
}

export const useEcho = () => {
  const value = useContext(EchoContext)
  if (!value) throw new Error("useEcho must be used within EchoProvider")
  return value
}
