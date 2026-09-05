import { Data } from 'effect'

export class ServiceAccountUnauthorizedError extends Data.TaggedError(
  'ServiceAccountUnauthorizedError',
) {}
