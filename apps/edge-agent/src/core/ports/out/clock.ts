/** Driven port: the only source of time for the core, so tests stay deterministic. */
export interface Clock {
  now(): Date
}
