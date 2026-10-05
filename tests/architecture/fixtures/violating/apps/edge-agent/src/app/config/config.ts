import { DataPlatformServer } from "@difinity-echo/data-platform"
export const config = DataPlatformServer
export const parseConfig = () => process.env["X"]
