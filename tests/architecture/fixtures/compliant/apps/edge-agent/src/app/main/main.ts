import { wire } from "../container/container.js"
export const start = () => [wire, process.env["PORT"]]
