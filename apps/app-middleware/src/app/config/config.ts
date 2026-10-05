import { err, ok, type Result } from "@difinity-echo/contracts"
import {
  collectErrors,
  readHost,
  readOptionalHttpUrl,
  readPort,
  type ConfigError,
  type RawEnvironment,
} from "./config-primitives.js"

export const AppMiddlewareConfigKey = {
  Host: "APP_MIDDLEWARE_HOST",
  Port: "APP_MIDDLEWARE_PORT",
  QueryApiUrl: "APP_MIDDLEWARE_QUERY_API_URL",
  QueryApiTimeoutMs: "APP_MIDDLEWARE_QUERY_API_TIMEOUT_MS",
} as const

export interface AppMiddlewareConfig {
  readonly http: { readonly host: string; readonly port: number }
  /** The only upstream the middleware may call for data. Required. */
  readonly queryApi: { readonly baseUrl: URL; readonly timeoutMs: number }
}

export const parseAppMiddlewareConfig = (
  env: RawEnvironment
): Result<AppMiddlewareConfig, readonly ConfigError[]> => {
  const host = readHost(env, AppMiddlewareConfigKey.Host, "127.0.0.1")
  const port = readPort(env, AppMiddlewareConfigKey.Port, 4000)
  const url = readOptionalHttpUrl(env, AppMiddlewareConfigKey.QueryApiUrl)
  const rawTimeout = env[AppMiddlewareConfigKey.QueryApiTimeoutMs]?.trim() || "2000"
  const timeoutMs = Number(rawTimeout)
  const errors: ConfigError[] = [...collectErrors([host, port, url])]
  if (url.ok && url.value === undefined) {
    errors.push({
      kind: "invalid-configuration",
      key: AppMiddlewareConfigKey.QueryApiUrl,
      reason: "is required (the Query API is the middleware's only data source)",
    })
  }
  if (!/^\d+$/.test(rawTimeout) || timeoutMs < 100 || timeoutMs > 30000) {
    errors.push({
      kind: "invalid-configuration",
      key: AppMiddlewareConfigKey.QueryApiTimeoutMs,
      reason: "must be an integer between 100 and 30000",
    })
  }
  if (errors.length > 0 || !host.ok || !port.ok || !url.ok || url.value === undefined) {
    return err(errors)
  }
  return ok({
    http: { host: host.value, port: port.value },
    queryApi: { baseUrl: url.value, timeoutMs },
  })
}
