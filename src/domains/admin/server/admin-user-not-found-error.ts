import { Data } from 'effect'

export class AdminUserNotFoundError extends Data.TaggedError(
  'AdminUserNotFoundError',
) {}
