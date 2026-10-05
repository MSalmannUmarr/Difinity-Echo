import { Client } from "pg"
import { createClient } from "@clickhouse/client"
export const db = [Client, createClient]
