import { Effect, Logger, ManagedRuntime } from 'effect'

const appRuntime = ManagedRuntime.make(Logger.layer([Logger.consoleJson]))

/** Runs an application Effect only at a framework or transport boundary. */
export const runAppEffect = <Value, Failure>(effect: Effect.Effect<Value, Failure>) =>
  appRuntime.runPromise(effect)
