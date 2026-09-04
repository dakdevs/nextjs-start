import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

type DevelopmentMailboxMessage = Readonly<{
  idempotencyKey: string
  subject: string
  text: string
  to: string
}>

/** Local-only platform adapter. Production email always uses Resend. */
export const writeDevelopmentMailboxMessage = (email: DevelopmentMailboxMessage) => {
  const messageId = crypto.randomUUID()
  const mailboxDirectory = join(process.cwd(), '.next', 'development-emails')

  return mkdir(mailboxDirectory, { recursive: true })
    .then(() =>
      writeFile(
        join(mailboxDirectory, `${messageId}.json`),
        JSON.stringify({ ...email, createdAt: new Date().toISOString() }),
        { encoding: 'utf8', mode: 0o600 },
      ),
    )
    .then(() => messageId)
}
