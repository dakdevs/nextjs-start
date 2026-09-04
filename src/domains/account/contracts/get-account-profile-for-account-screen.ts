import { z } from 'zod'

import { authenticatedContractBase } from '~/orpc/contract-base'

export const getAccountProfileForAccountScreenContract = authenticatedContractBase
  .input(z.object({}).strict())
  .output(
    z.object({
      email: z.email(),
      emailVerified: z.boolean(),
      name: z.string(),
      bio: z.string(),
      hasPasskey: z.boolean(),
    }),
  )
