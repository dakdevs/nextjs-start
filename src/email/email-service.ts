import 'server-only'

import { Context, Data, Effect, Layer, Random } from 'effect'
import { Resend } from 'resend'

import { env } from '~/config/env'
import { writeDevelopmentMailboxMessage } from '~/email/development-mailbox'
import { developmentEmailLogEntry } from '~/email/email-log'

type TransactionalEmail = Parameters<typeof writeDevelopmentMailboxMessage>[0]

const EmailDeliveryError = Data.TaggedError('EmailDeliveryError')<{
  readonly cause: unknown
  readonly retryAfterMilliseconds: number | null
  readonly retryable: boolean
}>

type EmailDeliveryFailure = InstanceType<typeof EmailDeliveryError>

const EmailConfigurationError = Data.TaggedError('EmailConfigurationError')<{
  readonly message: string
}>

export class EmailService extends Context.Service<
  EmailService,
  {
    readonly sendTransactional: (
      email: TransactionalEmail,
    ) => Effect.Effect<void, EmailDeliveryFailure>
  }
>()('nextjs-start/email/email-service/EmailService') {}

const ResendResponseError = Data.TaggedError('ResendResponseError')<{
  readonly message: string
  readonly retryAfterMilliseconds: number | null
  readonly retryable: boolean
}>

const retryAfterMilliseconds = (header: string | undefined) => {
  if (header === undefined) return null
  const seconds = Number(header)
  return Number.isFinite(seconds) && seconds >= 0 ? seconds * 1_000 : null
}

const sendOnce = (resend: Resend, email: TransactionalEmail) =>
  Effect.tryPromise({
    try: () =>
      resend.emails
        .send(
          {
            from: env.EMAIL_FROM,
            subject: email.subject,
            text: email.text,
            to: email.to,
          },
          { idempotencyKey: email.idempotencyKey },
        )
        .then((response) => {
          if (response.error === null) return

          const status = response.error.statusCode
          throw new ResendResponseError({
            message: response.error.message,
            retryAfterMilliseconds: retryAfterMilliseconds(
              response.headers?.['retry-after'],
            ),
            retryable: status === 408 || status === 429 || (status ?? 0) >= 500,
          })
        }),
    catch: (cause) =>
      cause instanceof ResendResponseError
        ? new EmailDeliveryError({
            cause,
            retryAfterMilliseconds: cause.retryAfterMilliseconds,
            retryable: cause.retryable,
          })
        : new EmailDeliveryError({
            cause,
            retryAfterMilliseconds: null,
            retryable: cause instanceof TypeError,
          }),
  }).pipe(
    Effect.timeout('10 seconds'),
    Effect.mapError((error) =>
      error._tag === 'TimeoutError'
        ? new EmailDeliveryError({
            cause: error,
            retryAfterMilliseconds: null,
            retryable: true,
          })
        : error,
    ),
  )

const sendWithResilience = (
  resend: Resend,
  email: TransactionalEmail,
  attempt = 1,
): Effect.Effect<void, EmailDeliveryFailure> =>
  sendOnce(resend, email).pipe(
    Effect.catchTag('EmailDeliveryError', (error) => {
      if (!error.retryable || attempt >= 3) return Effect.fail(error)

      return Random.next.pipe(
        Effect.map((random) =>
          Math.round(
            error.retryAfterMilliseconds ?? 250 * 2 ** (attempt - 1) * (0.5 + random),
          ),
        ),
        Effect.flatMap((delay) => Effect.sleep(`${delay} millis`)),
        Effect.andThen(sendWithResilience(resend, email, attempt + 1)),
      )
    }),
  )

const writeDevelopmentMailboxMessageEffect = (email: TransactionalEmail) =>
  Effect.tryPromise({
    try: () => writeDevelopmentMailboxMessage(email),
    catch: (cause) =>
      new EmailDeliveryError({ cause, retryAfterMilliseconds: null, retryable: false }),
  }).pipe(
    Effect.flatMap((messageId) =>
      Effect.logInfo('Development email written').pipe(
        Effect.annotateLogs(developmentEmailLogEntry({ email, messageId })),
      ),
    ),
  )

const developmentEmailService = EmailService.of({
  sendTransactional: writeDevelopmentMailboxMessageEffect,
})

const makeResendEmailService = (apiKey: string) => {
  const resend = new Resend(apiKey)
  return EmailService.of({
    sendTransactional: (email) => sendWithResilience(resend, email),
  })
}

const emailServiceLayer = () => {
  if (env.VERCEL_ENV === 'production' && env.EMAIL_DELIVERY !== 'resend') {
    return Layer.effect(
      EmailService,
      Effect.fail(
        new EmailConfigurationError({
          message: 'EMAIL_DELIVERY must be resend in production',
        }),
      ),
    )
  }

  if (env.EMAIL_DELIVERY === 'resend') {
    if (env.RESEND_API_KEY === undefined) {
      return Layer.effect(
        EmailService,
        Effect.fail(
          new EmailConfigurationError({
            message: 'RESEND_API_KEY is required when EMAIL_DELIVERY=resend',
          }),
        ),
      )
    }
    return Layer.succeed(EmailService, makeResendEmailService(env.RESEND_API_KEY))
  }

  return Layer.succeed(EmailService, developmentEmailService)
}

export const EmailServiceLive = emailServiceLayer()
