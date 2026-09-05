import { oc } from '@orpc/contract'
import { z } from 'zod'

/** Safe metadata shared by purpose-built contracts; never expose causes here. */
const contractBase = oc.errors({
  INTERNAL_SERVER_ERROR: {
    message: 'Something went wrong',
    data: z.object({ errorId: z.uuid() }),
  },
})

/** Base for operations whose consumer is a signed-in person. */
export const authenticatedContractBase = contractBase.errors({
  UNAUTHORIZED: {
    message: 'Sign in is required',
  },
})

/** Base for operations whose consumer is an authorized administrator. */
export const adminContractBase = authenticatedContractBase.errors({
  FORBIDDEN: {
    message: 'Administrator access is required',
  },
  NOT_FOUND: {
    message: 'The requested administrative record no longer exists',
  },
})
