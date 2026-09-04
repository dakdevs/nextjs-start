import type { writeDevelopmentMailboxMessage } from '~/email/development-mailbox'

type DevelopmentEmailLogInput = {
  email: Parameters<typeof writeDevelopmentMailboxMessage>[0]
  messageId: string
}

/** Metadata safe for operational logs: it cannot disclose a recipient or token-bearing body. */
export const developmentEmailLogEntry = (input: DevelopmentEmailLogInput) => ({
  event: 'development_email_written',
  messageId: input.messageId,
})
