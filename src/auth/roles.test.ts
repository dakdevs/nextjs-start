import { describe, expect, it } from 'vitest'

import { accountRoleSchema } from '~/auth/roles'

describe('account authorization roles', () => {
  it('accepts only the documented user and administrator roles', () => {
    expect(accountRoleSchema.safeParse('user').success).toBe(true)
    expect(accountRoleSchema.safeParse('admin').success).toBe(true)
    expect(accountRoleSchema.safeParse('owner').success).toBe(false)
  })
})
