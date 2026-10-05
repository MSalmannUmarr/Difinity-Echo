import type { Order } from "../domain/order"
import { http } from "@/src/shared/api/http"
export const api = (o: Order) => http(o)
