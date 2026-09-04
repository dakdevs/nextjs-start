import { z } from 'zod'

import { authenticatedContractBase } from '~/orpc/contract-base'

export const updateAccountProfileForAccountScreenInputSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .describe('The display name shown on the account.'),
    bio: z
      .string()
      .trim()
      .max(500)
      .describe('A short profile biography, or an empty string to clear it.'),
  })
  .strict()

export const updateAccountProfileForAccountScreenContract = authenticatedContractBase
  .input(updateAccountProfileForAccountScreenInputSchema)
  .output(z.object({ name: z.string(), bio: z.string() }))
