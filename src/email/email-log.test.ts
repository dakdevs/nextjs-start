import { describe, expect, it } from 'vitest'

import { developmentEmailLogEntry } from '~/email/email-log'

describe('developmentEmailLogEntry', () => {
  it('does not include recipient, subject, or a token-bearing body', () => {
    const entry = developmentEmailLogEntry({
      email: {
        idempotencyKey: 'idem_01',
        subject: 'Reset your password',
        text: 'Reset at https://example.test/reset?token=secret-token',
        to: 'person@example.test',
      },
      messageId: 'mail_01',
    })

    const serialized = JSON.stringify(entry)

    expect(serialized).toContain('mail_01')
    expect(serialized).not.toContain('person@example.test')
    expect(serialized).not.toContain('secret-token')
    expect(serialized).not.toContain('Reset your password')
  })
})
