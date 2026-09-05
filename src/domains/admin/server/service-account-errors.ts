import { Data } from 'effect'

export class ServiceAccountNotFoundError extends Data.TaggedError(
  'ServiceAccountNotFoundError',
) {}
