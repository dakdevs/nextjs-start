import { Effect, Layer, Logger, ManagedRuntime } from 'effect'

import { EmailService, EmailServiceLive } from '~/email/email-service'

const emailRuntime = ManagedRuntime.make(
  Layer.mergeAll(EmailServiceLive, Logger.layer([Logger.consoleJson])),
)

/** Runs an email Effect at the Better Auth delivery boundary. */
export const runEmailEffect = <Value, Failure>(
  effect: Effect.Effect<Value, Failure, EmailService>,
) => emailRuntime.runPromise(effect)
