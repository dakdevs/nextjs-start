import { describe, expect, it } from 'vitest'

import { isUserBanActive } from '~/auth/ban-policy'

const now = new Date('2026-09-05T12:00:00.000Z')

describe('user ban policy', () => {
  it('treats a permanent ban as active', () => {
    expect(isUserBanActive({ banned: true, banExpires: null }, now)).toBe(true)
  })

  it('treats a future temporary ban as active', () => {
    expect(
      isUserBanActive(
        { banned: true, banExpires: new Date('2026-09-05T12:00:01.000Z') },
        now,
      ),
    ).toBe(true)
  })

  it('treats an expired temporary ban as inactive', () => {
    expect(
      isUserBanActive(
        { banned: true, banExpires: new Date('2026-09-05T12:00:00.000Z') },
        now,
      ),
    ).toBe(false)
  })
})
