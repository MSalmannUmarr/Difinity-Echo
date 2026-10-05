import { parseEdgeAgentConfig } from "../config/config.js"
import { createEdgeAgentContainer } from "../container/container.js"

const config = parseEdgeAgentConfig(process.env)
if (!config.ok) {
  for (const error of config.error) console.error(`[edge-agent] ${error.key}: ${error.reason}`)
  process.exit(1)
}

const { server } = createEdgeAgentContainer(config.value)
const { host, port } = config.value.http

server.listen(port, host, () => {
  console.info(
    `[edge-agent] listening on http://${host}:${port} (health: /health/live, /health/ready)`
  )
})

const shutdown = (signal: NodeJS.Signals): void => {
  console.info(`[edge-agent] received ${signal}, shutting down`)
  server.close(() => process.exit(0))
}
process.once("SIGINT", shutdown)
process.once("SIGTERM", shutdown)
