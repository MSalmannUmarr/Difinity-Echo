import { err, ok, type Result } from "@difinity-echo/contracts"

/** Raw environment input. Only the process entry point (app/main) supplies the real environment. */
export type RawEnvironment = Readonly<Record<string, string | undefined>>

export interface ConfigError {
  readonly kind: "invalid-configuration"
  readonly key: string
  readonly reason: string
}

const HOSTNAME =
  /^(?=.{1,253}$)[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/
const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/

const invalid = (key: string, reason: string): ConfigError => ({
  kind: "invalid-configuration",
  key,
  reason,
})

export const readHost = (
  env: RawEnvironment,
  key: string,
  fallback: string
): Result<string, ConfigError> => {
  const value = env[key]?.trim() || fallback
  return HOSTNAME.test(value) || IPV4.test(value)
    ? ok(value)
    : err(invalid(key, "must be a hostname or IPv4 address"))
}

export const readPort = (
  env: RawEnvironment,
  key: string,
  fallback: number
): Result<number, ConfigError> => {
  const raw = env[key]?.trim()
  if (raw === undefined || raw === "") return ok(fallback)
  if (!/^\d+$/.test(raw)) return err(invalid(key, "must be an integer TCP port"))
  const port = Number(raw)
  return port >= 1 && port <= 65535 ? ok(port) : err(invalid(key, "must be between 1 and 65535"))
}

/** Optional `http(s)://` base URL. Absence is a valid "not configured" state. */
export const readOptionalHttpUrl = (
  env: RawEnvironment,
  key: string
): Result<URL | undefined, ConfigError> => {
  const raw = env[key]?.trim()
  if (raw === undefined || raw === "") return ok(undefined)
  if (!URL.canParse(raw)) return err(invalid(key, "must be an absolute URL"))
  const url = new URL(raw)
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return err(invalid(key, "must use http or https"))
  }
  if (url.username !== "" || url.password !== "") {
    return err(invalid(key, "must not embed credentials"))
  }
  return ok(url)
}

/** Optional `host:port` network endpoint used for reachability probes. */
export interface NetworkEndpoint {
  readonly host: string
  readonly port: number
}

export const readOptionalEndpoint = (
  env: RawEnvironment,
  key: string
): Result<NetworkEndpoint | undefined, ConfigError> => {
  const raw = env[key]?.trim()
  if (raw === undefined || raw === "") return ok(undefined)
  const match = /^([^:\s]+):(\d{1,5})$/.exec(raw)
  const host = match?.[1]
  const port = Number(match?.[2])
  if (host === undefined || !(HOSTNAME.test(host) || IPV4.test(host))) {
    return err(invalid(key, "must be host:port"))
  }
  if (!(port >= 1 && port <= 65535)) return err(invalid(key, "port must be between 1 and 65535"))
  return ok({ host, port })
}

/** Collects every configuration error instead of failing on the first one. */
export const collectErrors = (
  results: readonly Result<unknown, ConfigError>[]
): readonly ConfigError[] => results.flatMap((result) => (result.ok ? [] : [result.error]))
