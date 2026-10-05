import type { Clock } from "../../../core/ports/out/clock.js"

export class SystemClock implements Clock {
  now(): Date {
    return new Date()
  }
}
