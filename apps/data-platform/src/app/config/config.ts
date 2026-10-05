import { err, ok, type Result } from "@difinity-echo/contracts"
import {
  collectErrors,
  readHost,
  readOptionalEndpoint,
  readOptionalHttpUrl,
  readPort,
  type ConfigError,
  type NetworkEndpoint,
  type RawEnvironment,
} from "./config-primitives.js"

export const DataPlatformConfigKey = {
  Host: "DATA_PLATFORM_HOST",
  Port: "DATA_PLATFORM_PORT",
  ProbeTimeoutMs: "DATA_PLATFORM_PROBE_TIMEOUT_MS",
  KafkaBootstrap: "DATA_PLATFORM_KAFKA_BOOTSTRAP",
  PostgresEndpoint: "DATA_PLATFORM_POSTGRES_ENDPOINT",
  ClickHouseUrl: "DATA_PLATFORM_CLICKHOUSE_URL",
  ObjectStorageUrl: "DATA_PLATFORM_OBJECT_STORAGE_URL",
} as const

export interface DataPlatformConfig {
  readonly http: { readonly host: string; readonly port: number }
  readonly probeTimeoutMs: number
  /** Optional: an absent value is reported as `not-configured`, never as ready. */
  readonly infrastructure: {
    readonly kafkaBootstrap: NetworkEndpoint | undefined
    readonly postgresEndpoint: NetworkEndpoint | undefined
    readonly clickHouseUrl: URL | undefined
    readonly objectStorageUrl: URL | undefined
  }
}

const readTimeout = (env: RawEnvironment): Result<number, ConfigError> => {
  const raw = env[DataPlatformConfigKey.ProbeTimeoutMs]?.trim()
  if (raw === undefined || raw === "") return ok(1500)
  const value = Number(raw)
  return /^\d+$/.test(raw) && value >= 100 && value <= 30000
    ? ok(value)
    : err({
        kind: "invalid-configuration",
        key: DataPlatformConfigKey.ProbeTimeoutMs,
        reason: "must be an integer between 100 and 30000",
      })
}

export const parseDataPlatformConfig = (
  env: RawEnvironment
): Result<DataPlatformConfig, readonly ConfigError[]> => {
  const host = readHost(env, DataPlatformConfigKey.Host, "127.0.0.1")
  const port = readPort(env, DataPlatformConfigKey.Port, 4100)
  const timeout = readTimeout(env)
  const kafka = readOptionalEndpoint(env, DataPlatformConfigKey.KafkaBootstrap)
  const postgres = readOptionalEndpoint(env, DataPlatformConfigKey.PostgresEndpoint)
  const clickHouse = readOptionalHttpUrl(env, DataPlatformConfigKey.ClickHouseUrl)
  const objectStorage = readOptionalHttpUrl(env, DataPlatformConfigKey.ObjectStorageUrl)
  if (
    !host.ok ||
    !port.ok ||
    !timeout.ok ||
    !kafka.ok ||
    !postgres.ok ||
    !clickHouse.ok ||
    !objectStorage.ok
  ) {
    return err(collectErrors([host, port, timeout, kafka, postgres, clickHouse, objectStorage]))
  }
  return ok({
    http: { host: host.value, port: port.value },
    probeTimeoutMs: timeout.value,
    infrastructure: {
      kafkaBootstrap: kafka.value,
      postgresEndpoint: postgres.value,
      clickHouseUrl: clickHouse.value,
      objectStorageUrl: objectStorage.value,
    },
  })
}
