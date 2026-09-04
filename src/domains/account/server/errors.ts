import { Data } from 'effect'

export class AccountProfileNotFoundError extends Data.TaggedError(
  'AccountProfileNotFoundError',
) {}

export const AccountProfileReadError = Data.TaggedError('AccountProfileReadError')<{
  readonly cause: unknown
}>

export const AccountProfileUpdateError = Data.TaggedError('AccountProfileUpdateError')<{
  readonly cause: unknown
}>
