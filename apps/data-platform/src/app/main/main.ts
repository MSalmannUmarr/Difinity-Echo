import { parseDataPlatformConfig } from "../config/config.js"
import { createDataPlatformContainer } from "../container/container.js"

const config = parseDataPlatformConfig(process.env)
if (!config.ok) {
  for (const error of config.error) console.error(`[data-platform] ${error.key}: ${error.reason}`)
  process.exit(1)
}

const { server } = createDataPlatformContainer(config.value)
const { host, port } = config.value.http

server.listen(port, host, () => {
  console.info(
    `[data-platform] listening on http://${host}:${port} (health: /health/live, /health/ready)`
  )
})

const shutdown = (signal: NodeJS.Signals): void => {
  console.info(`[data-platform] received ${signal}, shutting down`)
  server.close(() => process.exit(0))
}
process.once("SIGINT", shutdown)
process.once("SIGTERM", shutdown)
