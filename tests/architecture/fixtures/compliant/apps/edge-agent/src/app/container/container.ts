import { adapter } from "../adapters/outbound/adapter.js"
import { use } from "../../core/services/service.js"
export const wire = () => use(adapter)
