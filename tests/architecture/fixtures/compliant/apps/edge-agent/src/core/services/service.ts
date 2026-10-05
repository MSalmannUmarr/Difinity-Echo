import type { Port } from "../ports/out/port.js"
export const use = (port: Port) => port.read()
