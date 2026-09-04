import { z } from 'zod'

export const accountRole = {
  admin: 'admin',
  user: 'user',
} as const

export const accountRoles = [accountRole.user, accountRole.admin] as const

/** The complete authorization role set for this single-account starter. */
export const accountRoleSchema = z.enum(accountRoles)
