import type { value } from "../../domain/value.js"
export interface Port {
  read(): typeof value
}
