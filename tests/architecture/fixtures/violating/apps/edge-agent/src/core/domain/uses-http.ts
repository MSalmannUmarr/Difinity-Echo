import { request } from "node:http"
import { config } from "../../app/config/config.js"
import { thing } from "../ports/out/port.js"
export const x = [request, config, thing]
