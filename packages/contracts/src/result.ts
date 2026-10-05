/**
 * Explicit result type for expected failures (Difinity standard §7.2).
 * Expected failures are values, never thrown exceptions.
 */
export interface Ok<T> {
  readonly ok: true
  readonly value: T
}

export interface Err<E> {
  readonly ok: false
  readonly error: E
}

export type Result<T, E> = Ok<T> | Err<E>

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value })

export const err = <E>(error: E): Err<E> => ({ ok: false, error })

export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.ok

export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => !result.ok

export const mapResult = <T, U, E>(result: Result<T, E>, map: (value: T) => U): Result<U, E> =>
  result.ok ? ok(map(result.value)) : result
