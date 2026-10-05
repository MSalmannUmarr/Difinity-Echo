import { err, ok, type Result } from "@difinity-echo/contracts"
import {
  collectErrors,
  readHost,
  readPort,
  type ConfigError,
  type RawEnvironment,
} from "./config-primitives.js"

export const EdgeAgentConfigKey = {
  Host: "EDGE_AGENT_HOST",
  Port: "EDGE_AGENT_PORT",
} as const

export interface EdgeAgentConfig {
  readonly http: {
    readonly host: string
    readonly port: number
  }
}

/** Parses configuration once at the process boundary into a typed, validated object. */
export const parseEdgeAgentConfig = (
  env: RawEnvironment
): Result<EdgeAgentConfig, readonly ConfigError[]> => {
  const host = readHost(env, EdgeAgentConfigKey.Host, "127.0.0.1")
  const port = readPort(env, EdgeAgentConfigKey.Port, 4200)
  if (!host.ok || !port.ok) return err(collectErrors([host, port]))
  return ok({ http: { host: host.value, port: port.value } })
}
