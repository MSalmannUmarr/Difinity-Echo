import { parseAppMiddlewareConfig } from "../config/config.js"
import { createAppMiddlewareContainer } from "../container/container.js"

const config = parseAppMiddlewareConfig(process.env)
if (!config.ok) {
  for (const error of config.error) console.error(`[app-middleware] ${error.key}: ${error.reason}`)
  process.exit(1)
}

const { server } = createAppMiddlewareContainer(config.value)
const { host, port } = config.value.http

server.listen(port, host, () => {
  console.info(
    `[app-middleware] listening on http://${host}:${port} (health: /health/live, /health/ready)`
  )
})

const shutdown = (signal: NodeJS.Signals): void => {
  console.info(`[app-middleware] received ${signal}, shutting down`)
  server.close(() => process.exit(0))
}
process.once("SIGINT", shutdown)
process.once("SIGTERM", shutdown)
